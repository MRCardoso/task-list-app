angular.module('starter').directive('renderLabel', function(){
    return {
        restrict: 'E',
        template: '<label class="label label-{{labelList[key].class}}" title="{{type}}">{{labelList[key].name}}</label>',
        scope: {
            labels: '=labels',
            index: '=index',
            type: '=type'
        },
        controller: function($scope, appLabel){
            if ( $scope.type in appLabel)
            {
                $scope.key = +$scope.index;
                $scope.labelList = appLabel[$scope.type];                
            }
        }
    }
})