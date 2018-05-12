angular.module('starter').service('User', ["$q", "$http", "$rootScope", "AppSetting", "UserData", "Loading", function ($q, $http, $rootScope, AppSetting, UserData, Loading)
{
    var refreshToken = function(token) {
        $http.defaults.headers.post['x-access-token'] = token;
    };
    this.signin = function(data)
    {
        Loading.show();
        return $q(function(resolve,reject){
            $http
            .post(AppSetting.urlSignin(),data)
            .then(function(res){
                var u = res.data.user;
                UserData.add(u);
                refreshToken(u.authToken);
                $rootScope.$broadcast('auth.user.refresh', "signin");
                resolve(u);
            }, function(e){
                reject(e.data.message);
            }).finally(function(params) {
                Loading.hide();
            });
        });
    };
    this.signout = function(){
        Loading.show();
        return $q(function(resolve,reject){
            $http
            .post(AppSetting.urlSignout(),{})
            .then(function(res){
                UserData.add(null);
                refreshToken(null);
                $rootScope.$broadcast('auth.user.refresh', "signout");
                resolve(null);
            }, function(e){
                if (e.status == 404){
                    UserData.add(null);
                    refreshToken(null);
                    $rootScope.$broadcast('auth.user.refresh', "signout");
                    return resolve(null);
                }
                reject(e.data.message);
            }).finally(function (params) {
                Loading.hide();
            });
        });
    }
}])