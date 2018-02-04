angular.module('starter').factory('httpInterceptors', function($q, $injector,$rootScope)
{
    return {
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