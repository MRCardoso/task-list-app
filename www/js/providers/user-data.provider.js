angular.module('starter').provider('UserData', ["$injector", "AppSetting", function ($injector,AppSetting)
{
    var add = function(data){
        localStorage.setItem(AppSetting.storageKey+'.auth', angular.toJson(data));
    };

    var find = function(){
        var loadUser = angular.fromJson(localStorage.getItem(AppSetting.storageKey+'.auth')) || {};
        loadUser.getToken = function() {
            return (loadUser.authToken || null);
        };
        loadUser.getImage = function () {
            setTimeout(function(){
                var i = cordova.file.externalRootDirectory + loadUser.image.name;
                console.log(i, cordova, window.plugins)
                return i;
            }, 500);
        };
        return loadUser;
    };

    var getToken = function(){
        var user = find();
        return (user != null ? (user.authToken || null) : null);
    }
    
    this.$get = function () {
        return {
            add: add,
            find: find,
            getToken: getToken
        }
    };
}]);