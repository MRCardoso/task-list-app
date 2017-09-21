app.controller('TaskController', [
    '$scope', '$ionicHistory','$state','$ionicPlatform','$cordovaBadge', '$cordovaToast','$ionicPopover', '$ionicSlideBoxDelegate','$filter', '$cordovaFile','$cordovaFileOpener2','messageBox','Log','$ionicLoading','$cordovaAppVersion',
    function($scope, $ionicHistory,$state, $ionicPlatform, $cordovaBadge, $cordovaToast, $ionicPopover, $ionicSlideBoxDelegate, $filter, $cordovaFile, $cordovaFileOpener2, messageBox,Log, $ionicLoading, $cordovaAppVersion)
    {
        var task = new Task();
        var labels = app.appLabels;
        $scope.tasks = [];
        $scope.priorities = labels['priority'];
        $scope.situations = labels['situation'];
        $scope.statuses = labels['status'];
        $scope.showRemove = false;
                
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

            refrashAndBadge(function(){
                $ionicHistory.goBack();
            });
        };

        /**
        | --------------------------------------------------------------------
        | Delete a task
        | --------------------------------------------------------------------
        */
        $scope.remove = function(index, event)
        {
            messageBox.confirm({
                "title": "Delete task",
                "message": "Do you want remove this task?",
                "success": function(e){
                    if( window.cordova )
                        $cordovaToast.show("Task was deleted with successful!!", 'long', 'top');
                    task.remove(index);
                    refrashAndBadge();
                }
            },$scope);
        };

        $scope.clean = function()
        {
            messageBox.confirm({
                "title": "Delete All tasks",
                "message": "Do you want remove all tasks?<br>is recommended that you exporting your tasks first",
                "success": function(e){
                    if( window.cordova )
                        $cordovaToast.show("All tasks are removed!", 'long', 'top');
                    task.clean();
                    refrashAndBadge();
                }
            },$scope);
        };

        $scope.validate = function(){
            if( this.formData == undefined )
                return false;
            return (
                this.formData.title == '' || this.formData.title == null
                || this.formData.start_date == '' || this.formData.start_date == null
            );
        };

        /**
        | --------------------------------------------------------------------
        | Go to view page
        | --------------------------------------------------------------------
        */
        $scope.viewTask = function(id){
            $state.go('app.taskview', {taskId:id});
        };

        /**
        | --------------------------------------------------------------------
        | Create a popover with options for task
        | --------------------------------------------------------------------
        */
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
        
        /**
        | --------------------------------------------------------------------
        | Call the next slider
        | --------------------------------------------------------------------
        */
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        /**
        | --------------------------------------------------------------------
        | Call the previous slider
        | --------------------------------------------------------------------
        */
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };

        /**
        | --------------------------------------------------------------------
        | Called each time the slide changes
        | --------------------------------------------------------------------
        */
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };

        /**
        | --------------------------------------------------------------------
        | Add a badge in the ico of the app to notify the tasks open
        | --------------------------------------------------------------------
        */
        $scope.addBadge = function(value, callback)
        {
            return new Promise(function(resolve, reject){
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
    
                            action.then(function() {
                                Log.info("added: "+value);
                                resolve({});
                            }, function(err) {
                                Log.err('action.err: ', err);
                                reject('error on manage badge!');
                                messageBox.alert('error', 'error on manage badge!', $scope);
                            });
                        }, function(no) {
                            Log.err("$cordovaBadge.hasPermission.err:", no);
                            reject('Without permission');
                            messageBox.alert('error', 'Without permission', $scope);
                        });
                    });
                }
                else{
                    resolve({});
                }
            });
        };
        
        /**
        | --------------------------------------------------------------------
        | Create a file with all tasks exists in your app
        | --------------------------------------------------------------------
        */
        $scope.download = function ()
        {
            $scope.popover.hide();
            var inApp = window.cordova;
            var data = task.createFileDownload($scope.filtered, $filter);

            messageBox.confirm({
                "title": "Download Task",
                "message": "Download a file with all your tasks?",
                "success": function(e){
                    if( inApp ){
                        Log.info('cordova.file:', cordova.file);
                        $cordovaFile
                        .writeFile(cordova.file.externalRootDirectory, data.name, data.str, true)
                        .then(function(success) {
                            Log.success("$cordovaFile.writeFile.success:", success);
                            var targetPath = success.target.localURL;
                            // var targetPath = cordova.file.externalRootDirectory + data.name;
                            messageBox.confirm({
                                "title": "Success",
                                "message": "Download successfully done",
                                "btnCancel": "Close",
                                "btnOk": "Open",
                                "classCancel": "button-blue-inverse",
                                "classOk": "button-balanced",
                                "success": function(e){
                                    $cordovaFileOpener2.open(
                                        targetPath,
                                        'text/comma-separated-values'
                                    ).then(function(event) {
                                        Log.success("$cordovaFileOpener2.open.success:", event);
                                    }, function(err) {
                                        Log.err("$cordovaFileOpener2.open.err:", err);
                                        messageBox.alert('Fail', 'Not was possible to open the downloaded file!', $scope);
                                    });
                                }
                            });
                        }, function(error) {
                            Log.err("$cordovaFile.writeFile.err:", error);
                            messageBox.alert('Fail', 'Do not was possible do the download!', $scope);
                        });
                    } else{
                        var link = document.createElement("a");
                        link.download = data.name;
                        link.href = URL.createObjectURL(data.file);
                        link.click();
                    }
                }
            },$scope);
        };

        /**
        | --------------------------------------------------------------------
        | Upload a file .json, with a list of tasks to be create in your app
        | --------------------------------------------------------------------
        */
        $scope.upload = function()
        {
            $scope.popover.hide();
            messageBox.confirm({
                "title": "Import Tasks",
                "message": "Do you wish import a file with your tasks?",
                "success": function(e){
                    var successFile = function(reason){
                        if( window.cordova )
                            $cordovaToast.show(reason, 'long', 'top');
                        refrashAndBadge();
                    },
                    errorFile = function(reason){
                        Log.err("$cordovaFile.writeFile.err: "+reason);
                        messageBox.alert('Validation Error', reason, $scope, [{
                            text: '<b>Ok</b>',
                            type: 'button-blue-inverse',
                            onTap: function(e){
                                refrashAndBadge();
                            }
                        }]);
                    };
                    if( 'fileChooser' in window)
                    {
                        window.fileChooser.open(function(uri) {
                            Log.success("window.fileChooser.open.success: "+uri);
                            window.FilePath.resolveNativePath(uri, function(fileName){
                                Log.success("window.FilePath.resolveNativePath.success: "+fileName);
                                window.resolveLocalFileSystemURL(fileName, function (fileEntry)
                                {
                                    Log.success("window.resolveLocalFileSystemURL.success: ", fileEntry);
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

        function refrashAndBadge(action)
        {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner icon="dots"></ion-spinner>',
                showBackdrop: true,
            });
            var opened = task.allOpened();
            Log.info("task-open: " + opened);
            $scope.addBadge(opened)
            .then(function(){
                $ionicLoading.hide().then(function(){
                    if( action != undefined)
                        action();
                    else
                        $state.reload();
                });
            }, function(message){
                $ionicLoading.hide().then(function(){
                    messageBox.alert('error', message, $scope);
                });                
            });            
        }
}]);