angular.module('starter').directive('mineAuth', function(){
    return {
        restrict: 'E',
        scope: {
            onShow: '=?onShow'
        },
        controller: ["$scope","$state", "$ionicModal", "UserData","User","messageBox", function($scope,$state,$ionicModal,UserData,User,messageBox){
            $scope.$root.isAuth = (UserData.getToken() != null ? true : false);
            $scope.$root.userData = UserData.find();

            $ionicModal.fromTemplateUrl('user-data-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $scope.$root.openModal = function() {
                $scope.modal.show();
            };
            $scope.closeModal = function() {
                $scope.modal.hide();
            };
            
            $scope.signout = function(){
                messageBox.confirm({
                    title: "Logout",
                    message: "Are you sure you want to log out?",
                    success: function(e){
                        User.signout().then(function(){                    
                            if( window.cordova )
                                $cordovaToast.show("Logout done with success", 'long', 'top');
                            $scope.modal.hide();
                        }, function(err){
                            messageBox.alert('Error', ['<div class="center">',err,'</div>'].join(''), $scope);
                        });
                    }
                });
            }
        }],
        template: [
            '<ion-nav-buttons side="left">',
                '<a ng-hide="isAuth" class="button button-blue icon ion-log-in" ng-href="#/signin"></a>',
                '<a ng-show="isAuth" class="button button-blue icon ion-android-settings" ng-click="$root.openModal()"></a>',
            '</ion-nav-buttons>'
        ].join('')
    }
});