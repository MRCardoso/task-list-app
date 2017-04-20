app.controller('TaskController', [
    '$scope', '$ionicModal', '$ionicListDelegate', '$ionicPopup', '$ionicHistory','$state','$ionicPlatform','$cordovaBadge',
    function($scope,$ionicModal,$ionicListDelegate,$ionicPopup, $ionicHistory,$state, $ionicPlatform, $cordovaBadge)
    {
        var task = new Task();
        var labels = app.appLabels;
        $scope.tasks = [];
        $scope.priorities = labels['priority'];
        $scope.situations = labels['situation'];
        $scope.statuses = labels['status'];
        $scope.showRemove = false;    
        $scope.delPop = null;

        $scope.addBadge = function(value)
        {
            if( window.cordova )
            {                
                $ionicPlatform.ready(function()
                {
                    console.log('entrou--');
                    $cordovaBadge.hasPermission().then(function(yes) 
                    {
                        $cordovaBadge.set(value).then(function() {}, function(err) {
                            $ionicPopup.alert({title: 'error', template: 'error occurred in add badge'});
                        });
                    }, function(no) {
                        $ionicPopup.alert({title: 'error', template: 'Without permission'});
                    });
                });
            }            
        };

        $scope.find = function()
        {
            $scope.tasks = task.getTasks();
            var openeds = $scope.tasks.filter(row => row.situation == 1);
            
            if( openeds.length > 0 ){
                $scope.addBadge(openeds.length);
            }
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
}]);