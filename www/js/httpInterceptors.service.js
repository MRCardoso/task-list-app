angular.module('starter').factory('httpInterceptors', function($q, $injector,$rootScope)
{
    return {
        'request': function (config) {
            if(!config.params){
                config.params = {};
            }
            if (/http(s)?:\/\//.test(config.url)){
                var pInfo = ionic.Platform;
                config.params['PlatformOrigin'] = 1;//mobile
                config.params['PlatformName'] = pInfo.platform();
                config.params['PlatformVersion'] = pInfo.version();
            }
            return config;
        },
        'responseError': function (rejection) {
            var code = rejection.status + ' - ' + rejection.statusText;
            switch (rejection.status) {
                // case 500: break;
                // case 400: break;
                // case 404: break;
                // case 403: break;
                case 401:
                    $injector.get("UserData").add(null);
                    $rootScope.$broadcast('auth.user.refresh');
                    $injector.get("messageBox").confirm({
                        title: code,
                        btnOk: "Signin",
                        message: ['<div class="center">', rejection.data.message, '</div>'].join(''),
                        success: function (e) {
                            $rootScope.assignModal();
                        }
                    }, $rootScope);
                    break;
            }
            return $q.reject(rejection);
        }
    };
});