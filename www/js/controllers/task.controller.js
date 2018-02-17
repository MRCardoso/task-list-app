angular.module('starter').controller('TaskController', [
    '$scope', '$ionicHistory', '$state', '$cordovaToast', '$ionicPopover', '$ionicSlideBoxDelegate', '$timeout', '$filter', 'Task', 'messageBox', 'Log', 'Loading', 'BadgeHelper', 'ExpoImpo', 'appLabel', 'TaskSync','UserData',
    function ($scope, $ionicHistory, $state, $cordovaToast, $ionicPopover, $ionicSlideBoxDelegate, $timeout, $filter, Task, messageBox, Log, Loading, BadgeHelper, ExpoImpo, appLabel, TaskSync, UserData)
    {
        var labels = appLabel;
        var tasks = [];
        var customFilter = {sync:false,noSync:false};
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
            Loading.show('spiral');
            Task.find().then(function(r){
                $scope.tasks = tasks = r;
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
            Loading.show('spiral');
            
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
            var message = "Do you want remove " + $scope.arrayIds.length +" task?";
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

        /**
        | --------------------------------------------------------------------
        | trigger events handler
        | --------------------------------------------------------------------
        */
        $scope.$on("task.update.list", function () {
            $scope.find();
        });

        /**
        | --------------------------------------------------------------------
        | Watches
        | --------------------------------------------------------------------
        */
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
            ExpoImpo.download([$scope.filtered]);
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
        
        /**
        | --------------------------------------------------------------------
        | Update tasks with the server manually
        | --------------------------------------------------------------------
        */
        $scope.syncWithServer = function() {
            messageBox.confirm({
                title: "Syncronize tasks",
                message: "You with check per update in remote app?",
                success: function (e) {
                    TaskSync.dowload();
                }
            }, $scope);
        };

        /**
        | --------------------------------------------------------------------
        | Sends to server a task that no still synced
        | --------------------------------------------------------------------
        */
        $scope.sync = function(event, data)
        {
            event.stopPropagation();
            data.syncing = true;
            TaskSync.syncOne(data).then(function(task){
                data.id_task_reference = task._id;
                if( window.cordova )
                    $cordovaToast.show("Task sync with success!!", 'long', 'top');
            }).finally(function () { delete data.syncing; });
        };

        /**
        | --------------------------------------------------------------------
        | validate if the current task already was synced
        | --------------------------------------------------------------------
        */
        $scope.isSync = function(item)
        {
            if (UserData.authenticated()){
                return (item.id_task_reference == null? false: true);
            }
            return null;
        };

        /**
        | --------------------------------------------------------------------
        | Filters
        | --------------------------------------------------------------------
        */
        $scope.filterSync = function() {
            $scope.tasks = $filter('filter')(tasks, function(i) {
                if (customFilter.sync) return true;
                return (i.id_task_reference !== null);
            });
            customFilter.sync = !customFilter.sync;
            customFilter.noSync = false;
        };
        $scope.filterNoSync = function() {
            $scope.tasks = $filter('filter')(tasks, function (i) {
                if (customFilter.noSync) return true;
                return (i.id_task_reference === null);
            });
            customFilter.noSync = !customFilter.noSync;
            customFilter.sync = false;
        };
}]);