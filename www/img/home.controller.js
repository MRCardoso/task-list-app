app.controller('HomeController', ["$scope", "$rootScope", "$filter", "$ionicLoading", "$http", function ($scope, $rootScope, $filter, $ionicLoading,$http)
{
    $scope.date = new Date();
    $scope.showCalendar = true;

    $scope.findOpen = function()
    {
        $scope.openTasks = new Task().getTasks().filter(function(row,i)
        {
            var current = $filter('date')($scope.date, 'yyyy-MM-dd');
            var startDate = $filter('date')(new Date(row.start_date), 'yyyy-MM-dd');   
            // var endDate = row.end_date != null ? $filter('date')(new Date(row.end_date), 'yyyy-MM-dd') : null;
            return startDate == current;// && ( current <= endDate || endDate == null);
        });
    };
    
    $scope.$watch('date', function(d){
        $scope.findOpen();
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