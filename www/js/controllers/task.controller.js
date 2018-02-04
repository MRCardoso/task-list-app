angular.module('starter').controller('TaskController', [
    '$scope', '$ionicHistory','$state', '$cordovaToast', '$ionicPopover', '$ionicSlideBoxDelegate', '$timeout', 'Task','messageBox', 'Log','Loading','BadgeHelper','ExpoImpo','appLabel','TaskSync',
    function($scope, $ionicHistory,$state, $cordovaToast, $ionicPopover, $ionicSlideBoxDelegate, $timeout, Task, messageBox, Log, Loading, BadgeHelper, ExpoImpo,appLabel,TaskSync)
    {
        var labels = appLabel;
        $scope.tasks = [];
        $scope.priorities = labels['priority'];
        $scope.situations = labels['situation'];
        $scope.statuses = labels['status'];
        $scope.showRemove = false;
        $scope.arrayIds = [];
                
        /**
        | --------------------------------------------------------------------
        | Load all tasks in app
        | --------------------------------------------------------------------
        */
        $scope.find = function()
        {
            Loading.show();
            Task.find().then(function(r){
                $scope.tasks = r;
            }, function(e){
                messageBox.alert('error', 'Cannot be was load the tasks', $scope);
            }).finally(function() {
                $timeout(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                    Loading.hide();
                },100);
            });
        };
        
        /**
        | --------------------------------------------------------------------
        | Load a task by id
        | --------------------------------------------------------------------
        */
        $scope.findOne = function()
        {
            $scope.task = Task.populateFields({},1);
            Loading.show();
            
            if( $state.params.taskId )
            {
                Task.findOne($state.params.taskId).then(function(task){
                    $scope.task = Task.prepare(task);
                    Loading.hide();
                }, function(e){
                    Loading.hide();
                    $scope.task = {};
                });
            }
            else{
                Loading.hide();
            }
        };
        
        /**
        | --------------------------------------------------------------------
        | Create or update a task
        | --------------------------------------------------------------------
        */
        $scope.save = function()
        {
            if( Task.validate(this.task) ){
                Task.save(this.task, $state.params.taskId).then(function(){
                    if( window.cordova )
                        $cordovaToast.show("Task was save with successful!!", 'long', 'top');
                    
                    BadgeHelper.redirectBadge(function(){
                        $ionicHistory.goBack();
                    });
                }, function(e){
                    messageBox.alert('error', 'No was possible save the task', $scope);
                });
            }
        };

        /**
        | --------------------------------------------------------------------
        | Delete a task
        | --------------------------------------------------------------------
        */
        $scope.remove = function(id)
        {
            var message = "Do you want remove the task("+$scope.arrayIds.join(',')+")?";
            $scope.arrayIds = [];
            messageBox.confirm({
                "title": "Delete task",
                "message": message,
                "success": function(e){
                    Task.remove(id).then(function(r){
                        if( window.cordova )
                            $cordovaToast.show("Task was deleted with successful!!", 'long', 'top');
                        BadgeHelper.redirectBadge();
                    }, function(e){
                        messageBox.alert('error', 'No was possible remove the task', $scope);
                    });
                }
            },$scope);
        };

        $scope.$watch('showRemove',function(r){
            if( r == false && $scope.arrayIds.length > 0){
                $scope.remove({operator: 'IN', value: $scope.arrayIds});
            }
        });
        
        $scope.hasItem = function(id){
            return $scope.arrayIds.indexOf(id);
        };

        $scope.storeItem = function(id){
            var index = $scope.hasItem(id);
            if( index != -1 ){
                $scope.arrayIds.splice(index,1);
            } else{
                $scope.arrayIds.push(id);
            }
        };

        /**
        | --------------------------------------------------------------------
        | Go to view page
        | --------------------------------------------------------------------
        */
        $scope.viewTask = function(id){
            $state.go('app.taskview', {taskId:id});
        };

        /*
        | --------------------------------------------------------------------
        | Graph configurations
        | --------------------------------------------------------------------
        */
        $scope.createChart = function()
        {
            Task.createChartData(labels).then(function(items){
                $scope.options = items.options;
                $scope.charts = items.charts;
            }, function(e){
                messageBox.alert('error', 'Houve um erro ao carregar tarefas', $scope);
            });
        };

        /**
        | --------------------------------------------------------------------
        | Download Tasks
        | --------------------------------------------------------------------
        */
        $scope.download = function (){
            $scope.popover.hide();
            ExpoImpo.download($scope.filtered);
        };

        /**
        | --------------------------------------------------------------------
        | Upload Tasks
        | --------------------------------------------------------------------
        */
        $scope.upload = function(){
            $scope.popover.hide();
            ExpoImpo.upload();
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
        
        $scope.sync = function(event, data)
        {
            event.stopPropagation();

            TaskSync.syncOne(data).then(function(task){
                data.id_task_reference = task._id;
                if( window.cordova )
                    $cordovaToast.show("Task sync with success!!", 'long', 'top');
                else
                    messageBox.alert('error', 'Task sync with success', $scope);
            })
        }
}]);