app.controller('TaskController', [
    '$scope', '$ionicModal', '$ionicListDelegate', '$ionicPopup', '$ionicHistory','$state',
    function($scope,$ionicModal,$ionicListDelegate,$ionicPopup, $ionicHistory,$state)
    {
        var task = new Task();
        var labels = app.appLabels;
        $scope.tasks = [];
        $scope.priorities = labels['priority'];
        $scope.situations = labels['situation'];
        $scope.statuses = labels['status'];
        $scope.showRemove = false;    
        $scope.delPop = null;

        $scope.find = function()
        {
            $scope.tasks = task.getTasks();
        }
        $scope.findOne = function()
        {
            var data = {isNewRecord:true};
            
            if( $state.params.taskId )
            {
                data = task.getTasks($state.params.taskId);
                data.start_date = new Date(data.start_date);
                if( data.end_date != null )
                    data.end_date = new Date(data.end_date);
                data.isNewRecord = false;
                data.current = $state.params.taskId;
            }
            $scope.formData = task.populateFields(data);
        };

        $scope.save = function()
        {
            task.save(this.formData, $state.params.taskId);
            var myPopup = $ionicPopup.alert({
                template: "Task created with successful!!",
                title: 'Success',
                scope: $scope,
                buttons: [{
                    text: '<b>OK</b>',
                    type: 'button-positive', 
                    onTap: function(e){
                        $scope.$root.openedTask = task.allOpened();
                        $ionicHistory.goBack();
                    }
                }]
            });
        };

        $scope.remove = function(index, event)
        {
            if( $scope.delPop == null)
            {
                $scope.delPop = $ionicPopup.confirm({
                    template: "Do you want remove this task?",
                    title: 'Comfirmation',
                    scope: $scope,
                    buttons: [
                        {
                            text: '<b>Cancel</b>',
                            type: 'button-stable',
                            onTap: function(e){ $scope.delPop = null; }
                        },
                        {
                            text: '<b>OK</b>',
                            type: 'button-positive', 
                            onTap: function(e){
                                $scope.delPop = null;
                                $scope.$root.openedTask = task.allOpened();
                                task.remove(index);                                
                                $scope.find();                                
                            }
                        }
                    ]
                });
            }
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
        }
}]);