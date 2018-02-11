app.controller('HomeController', ["$scope", "$filter", "$timeout","messageBox", "Loading", "Task", function ($scope, $filter, $timeout, messageBox, Loading,Task)
{
    $scope.date = new Date();
    $scope.showCalendar = true;

    $scope.findOpen = function()
    {
        Loading.show('spiral');
        var start = new Date($filter('date')($scope.date, 'yyyy-MM-dd 00:00:00')).getTime();
        var end = new Date($filter('date')($scope.date, 'yyyy-MM-dd 23:59:59')).getTime();

        Task.find(['*'], {start_date: {operator: 'BETWEEN', value: [start,end]}})
        .then(function(tasks){
            $scope.openTasks = tasks.map(function (r) { return Task.prepare(r); });
        }, function(e){
            messageBox.alert('error', 'Houve um erro ao carregar tarefas', $scope);
        }).finally(function(){
            Loading.hide();
        });
    };
    
    $scope.$watch('date', function(d){
        $timeout(function(){
            $scope.findOpen();
        }, 500)
    });

    $scope.toggleGroup = function(item) {
        if ($scope.isGroupShown(item)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = item;
        }
    };

    $scope.isGroupShown = function(item) {
        return $scope.shownGroup === item;
    };    
}])