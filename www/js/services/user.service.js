angular.module('starter').service('User', ["$q","$http","$rootScope","AppSetting","UserData", function($q,$http,$rootScope,AppSetting,UserData)
{
    this.signin = function(data)
    {
        return $q(function(resolve,reject){
            $http
            .post(AppSetting.urlSignin(),data)
            .then(function(res){
                UserData.add(res.data.user);
                $rootScope.$broadcast('auth.user.refresh', "signin");
                resolve(res.data.user);
            }, function(e){
                reject(e.data.message);
            });
        });
    };
    this.signout = function(){
        return $q(function(resolve,reject){
            $http
            .post(AppSetting.urlSignout(),{})
            .then(function(res){
                UserData.add(null);
                $rootScope.$broadcast('auth.user.refresh', "signout");
                resolve(res.data);
            }, function(e){
                reject(e.data.message);
            });
        });
    }
}])