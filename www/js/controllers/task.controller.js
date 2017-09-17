app.controller('TaskController', [
    '$scope', '$ionicPopup', '$ionicHistory','$state','$ionicPlatform','$cordovaBadge', '$cordovaToast','$ionicPopover', '$ionicSlideBoxDelegate','$filter', '$cordovaFile','$cordovaFileOpener2',
    function($scope,$ionicPopup, $ionicHistory,$state, $ionicPlatform, $cordovaBadge, $cordovaToast, $ionicPopover, $ionicSlideBoxDelegate, $filter, $cordovaFile, $cordovaFileOpener2)
    {
        var task = new Task();
        var labels = app.appLabels;
        $scope.tasks = [];
        $scope.priorities = labels['priority'];
        $scope.situations = labels['situation'];
        $scope.statuses = labels['status'];
        $scope.showRemove = false;    
        $scope.delPop = null;

        $ionicPopover.fromTemplateUrl('config-option.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });
        
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.hide();
            // $scope.popover.remove();
        });

        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };

        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };

        $scope.addBadge = function(value)
        {
            if( window.cordova )
            {                
                $ionicPlatform.ready(function()
                {
                    $cordovaBadge.hasPermission().then(function(yes) 
                    {
                        var action;
                        if( value == 0 ) 
                            action = $cordovaBadge.clear();
                        else 
                            action = $cordovaBadge.set(value);

                        action.then(function() {console.log('added', value)}, function(err) {
                            $ionicPopup.alert({title: 'error', template: 'error on manage badge!'});
                        });
                    }, function(no) {
                        $ionicPopup.alert({title: 'error', template: 'Without permission'});
                    });
                });
            }            
        };
        
        /**
        | --------------------------------------------------------------------
        | Load all tasks in app
        | --------------------------------------------------------------------
        */
        $scope.find = function()
        {
            $scope.tasks = task.getTasks();            
        }
        
        /**
        | --------------------------------------------------------------------
        | Load a task by id
        | --------------------------------------------------------------------
        */
        $scope.findOne = function()
        {
            var data = {isNewRecord:true};
            
            if( $state.params.taskId )
            {
                data = task.getTasks($state.params.taskId);
                data.start_date = new Date(data.start_date);
                if( data.end_date != null ) data.end_date = new Date(data.end_date);
            }
            $scope.formData = task.populateFields(data);
        };
        
        /**
        | --------------------------------------------------------------------
        | Create or update a task
        | --------------------------------------------------------------------
        */
        $scope.save = function()
        {
            task.save(this.formData, $state.params.taskId);
            
            if( window.cordova )
                $cordovaToast.show("Task was save with successful!!", 'long', 'top');

            $scope.addBadge(task.allOpened());
            $ionicHistory.goBack();
        };

        /**
        | --------------------------------------------------------------------
        | Delete a task
        | --------------------------------------------------------------------
        */
        $scope.remove = function(index, event)
        {
            createModalConfirm(
                "Do you want remove this task?", 
                function(e){
                    $scope.delPop = null;
                    if( window.cordova )
                        $cordovaToast.show("Task was deleted with successful!!", 'long', 'top');
                    task.remove(index);
                    refrashAndBadge();
                }
            );
        };

        $scope.validate = function(){
            if( this.formData == undefined )
                return false;
            return (
                this.formData.title == '' || this.formData.title == null
                || this.formData.start_date == '' || this.formData.start_date == null
            );
        };
        $scope.viewTask = function(id){
            $state.go('app.taskview', {taskId:id});
        };

        /**
        | --------------------------------------------------------------------
        | Create a file with all tasks exists in your app
        | --------------------------------------------------------------------
        */
        $scope.download = function ()
        {
            var inApp = window.cordova;
            var data = task.createFileDownload($scope.filtered, $filter);
            
            $ionicPopup.alert({
                title: 'Download File', 
                template: '<p>Download a file with all your tasks</p>',
                buttons: [
                    {
                        text: '<b>Cancel</b>',
                        type: 'button-light',
                        onTap: function(e){
                        }
                    },
                    {
                        text: '<b>OK</b>',
                        type: 'button-blue-inverse', 
                        onTap: function(e){
                            if( inApp ){
                                console.log(cordova.file);
                                $cordovaFile.writeFile(cordova.file.externalRootDirectory, data.name, data.str, true)
                                .then(function(success) {
                                    // var url = success.target.localURL;
                                    var targetPath = cordova.file.externalRootDirectory + data.name;
                                    $ionicPopup.alert({
                                        title: 'Fail', 
                                        template: "Download successfully done",
                                        buttons: [{
                                            text: '<b>ok</b>',
                                            type: 'button-blue',
                                            onTap: function(e){
                                                $cordovaFileOpener2.open(
                                                    targetPath,
                                                    'text/comma-separated-values'
                                                ).then(function(event) {
                                                    console.log('event', event);
                                                }, function(err) {
                                                    console.log('err', err);
                                                    $ionicPopup.alert({
                                                        title: 'Fail', 
                                                        template: '<p>Fail to open the file downloaded!</p>'
                                                    });
                                                });
                                            }
                                        }]
                                    });
                                }, function(error) {
                                    console.log('err-create', error);
                                    $ionicPopup.alert({
                                        title: 'Fail', 
                                        template: '<p>Error to create the file</p>'
                                    });
                                });
                            } else{
                                var link = document.createElement("a");
                                link.download = data.name;
                                link.href = URL.createObjectURL(data.file);
                                link.click();
                            }
                        }
                    }
                ]
            });
        };

        /**
        | --------------------------------------------------------------------
        | Upload a file .json, with a list of tasks to be create in your app
        | --------------------------------------------------------------------
        */
        $scope.upload = function()
        {
            $scope.popover.hide();
            createModalConfirm("Do you wish import a file with your tasks?", function(e)
            {
                var successFile = function(reason){
                    if( window.cordova )
                        $cordovaToast.show(reason, 'long', 'top');
                    refrashAndBadge();
                },
                errorFile = function(reason){
                    console.log('error', reason);
                    $ionicPopup.alert({
                        title: 'Error', 
                        template: reason,
                        buttons:[{
                            text: '<b>Ok</b>',
                            type: 'button-blue-inverse',
                            onTap: function(e){
                                refrashAndBadge();
                            }
                        }]
                    });
                };
                if( 'fileChooser' in window)
                {
                    window.fileChooser.open(function(uri) {
                        console.log('url:', uri);
                        window.FilePath.resolveNativePath(uri, function(fileName){
                            console.log('fileName', fileName);
                            window.resolveLocalFileSystemURL(fileName, function (fileEntry)
                            {
                                console.log('fileEntry', fileEntry);
                                fileEntry.file(function (file) {
                                    task.saveByExport(file).then(successFile, errorFile);
                                });
                            });
                        });
                    });
                }
                else{
                    var element = document.getElementById('upload-file-item');
                    element.value = "";
                    element.click();
                    
                    element.onchange = function()
                    {
                        task.saveByExport(this.files[0]).then(successFile, errorFile);
                    };
                }
            });
        };

        /*
        | --------------------------------------------------------------------
        | Graph configurations
        | --------------------------------------------------------------------
        */
        $scope.createChart = function()
        {
            var tasks = task.getTasks();
            $scope.options = {
                thickness: 10,
                duration: 8000,
                legend: {
                    display: true,
                    position: 'bottom'
                }
            };
            $scope.charts = task.createChartData(tasks, labels);
        };

        function refrashAndBadge()
        {
            var opened = task.allOpened();
            console.log('task-open', opened);
            $scope.addBadge(opened);
            $state.reload();
        }

        function createModalConfirm(message, success, fail)
        {
            if( $scope.delPop == null)
            {
                $scope.delPop = $ionicPopup.confirm({
                    template: message,
                    title: 'Confirmation',
                    scope: $scope,
                    buttons: [
                        {
                            text: '<b>Cancel</b>',
                            type: 'button-light',
                            onTap: function(e){ 
                                $scope.delPop = null;
                                if( fail != undefined )
                                    fail();
                            }
                        },
                        {
                            text: '<b>OK</b>',
                            type: 'button-blue-inverse', 
                            onTap: function(e){
                                $scope.delPop = null;
                                success(e);
                            }
                        }
                    ]
                });
            }
        }
}]);