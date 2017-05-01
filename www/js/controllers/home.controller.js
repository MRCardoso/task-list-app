app
.controller('HomeController', ["$scope", "$rootScope", "$filter", "$ionicLoading", function ($scope, $rootScope, $filter, $ionicLoading) {
    $scope.date = new Date();
    $scope.showCalendar = true;
    var task = new Task();
    
    // $ionicLoading
    // .show({template: 'Loading...',duration: 1000})
    // .then(function(){
    //     console.log("The loading indicator is now displayed");
    // });

    $scope.findOpen = function(){
        $scope.openTasks = task.getTasks().filter(function(row,i)
        {
            row.current = i;
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