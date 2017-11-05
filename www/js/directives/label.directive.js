app.directive('renderLabel', function(){
    return {
        restrict: 'E',
        template: '<label class="label label-{{labelList[key].class}}" title="{{type}}">{{labelList[key].name}}</label>',
        scope: {
            labels: '=labels',
            index: '=index',
            type: '=type'
        },
        controller: function($scope){
            if ( $scope.type in app.appLabels)
            {
                $scope.key = +$scope.index;
                $scope.labelList = app.appLabels[$scope.type];                
            }
        }
    }
})