angular.module('starter').provider('UserData', ["AppSetting", function(AppSetting)
{
    var add = function(data){
        localStorage.setItem(AppSetting.storageKey+'.auth', angular.toJson(data));
    };

    var find = function(){
        return angular.fromJson(localStorage.getItem(AppSetting.storageKey+'.auth')) || {};
    };

    var getToken = function(){
        var user = find();
        return user.authToken || null;
    }
    
    this.$get = function () {
        return {
            add: add,
            find: find,
            getToken: getToken
        }
    };
}]);