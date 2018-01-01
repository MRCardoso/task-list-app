angular.module('starter').controller('loginController', ["$scope", "$ionicModal","$state", "messageBox", "User", function($scope,$ionicModal,$state,messageBox,User)
{
    $scope.signinData = {};

    $scope.goHome = function(){
        $state.go('app.home');
    }
    $scope.signin = function()
    {
        var data = angular.extend({username: null,password: null}, this.signinData);
        User.signin(data).then(function(data){
            $state.go('app.home');
        },function(err){
            messageBox.alert('Error', ['<div class="center">',err,'</div>'].join(''), $scope);
        });
    };
}])