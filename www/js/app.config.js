angular.module('starter').config(function($ionicConfigProvider, $httpProvider, UserDataProvider)
{
    // note that you can also chain configs
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.tabs.position("top");
    $ionicConfigProvider.tabs.style("standard");
    $ionicConfigProvider.backButton.text('');
    
    var headerParams = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'x-access-token': UserDataProvider.$get().getToken()
    };
    $httpProvider.defaults.headers.common = headerParams;
    $httpProvider.defaults.headers.post = headerParams;
    $httpProvider.defaults.headers.put = headerParams;
    $httpProvider.defaults.headers.patch = headerParams;

    $httpProvider.defaults.transformRequest = function(data){
        if (angular.isUndefined(data)) {
            return data;
        }
        var serialize = function(obj, prefix) {
            var str = [];
            for(var p in obj) {
                if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push(typeof v == "object" ?
                    serialize(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&");
        }
        return serialize(data);
    };
});