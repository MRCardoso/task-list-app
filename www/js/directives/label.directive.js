app.directive('renderLabel', function(){
    return {
        restrict: 'E',
        template: '<label class="label label-{{labelList[index].class}}">{{labelList[index].name}}</label>',
        scope: {
            labels: '=labels',
            index: '=index',
            type: '=type'
        },
        controller: function($scope){
            if ( $scope.type in app.appLabels)
            {
                $scope.index = +$scope.index;
                $scope.labelList = app.appLabels[$scope.type];
            }
        }
    }
})