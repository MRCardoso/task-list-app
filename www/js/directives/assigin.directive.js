angular.module('starter').directive('assigin', function(){
    return {
        restrict: 'E',
        scope: {
            onShow: '=?onShow'
        },
        controller: ["$scope","$state", "$ionicModal", "UserData","User","messageBox", function($scope,$state,$ionicModal,UserData,User,messageBox){
            $scope.signinData = {};
            $scope.$root.isAuth = (UserData.getToken() != null ? true : false);
            $scope.$root.userData = UserData.find();

            $ionicModal.fromTemplateUrl('templates/signin.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.$root.assignModal = function() {
                $scope.modal.show();
            };
            $scope.closeModal = function() {
                $scope.modal.hide();
            };
            
            $scope.signin = function(){
                User.signin(angular.extend({ username: null, password: null }, this.signinData))
                .then(function (data) {
                    $scope.closeModal();
                }, function (err) {
                    messageBox.alert('Error', ['<div class="center">', err, '</div>'].join(''), $scope);
                });
            };

            $scope.signout = function(){
                messageBox.confirm({
                    title: "Logout",
                    message: "Are you sure you want to log out?",
                    success: function(e){
                        User.signout().then(function(){                    
                            if( window.cordova )
                                $cordovaToast.show("Logout done with success", 'long', 'top');
                            $scope.closeModal();
                        }, function(err){
                            messageBox.alert('Error', ['<div class="center">',err,'</div>'].join(''), $scope);
                        });
                    }
                });
            }
        }],
        template: [
            '<ion-nav-buttons side="left">',
                '<a class="button button-blue icon" ng-class="{\'ion-log-in\': !isAuth, \'ion-android-settings\': isAuth}" ng-click="$root.assignModal()"></a>',
            '</ion-nav-buttons>'
        ].join('')
    }
});