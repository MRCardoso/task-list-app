angular.module('starter').config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, UserDataProvider) {
    // note that you can also chain configs
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.tabs.position("top");
    $ionicConfigProvider.tabs.style("standard");
    $ionicConfigProvider.backButton.text('');

    $httpProvider.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.headers.common['x-access-token'] = UserDataProvider.$get().getToken();
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    // $httpProvider.defaults.headers.common['x-access-token'] = UserDataProvider.$get().getToken();

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

    $stateProvider
    .state('signin', {
        url: '/signin',
        templateUrl: 'templates/signin.html',
        controller: 'loginController'
    })
    .state('app', {
        url: '/app',
        abstract: true,
        // templateUrl: 'templates/layout/menu.html',
        templateUrl: 'templates/layout/tabs.html'
    })    
    .state('app.home', {
        url: '/home',
        views: {
            'app-home': {
                templateUrl: 'templates/home/home.html',
                controller: 'HomeController'
            }
        }
    })
    .state('app.help', {
        url: '/help',
        views: {
            'app-help': {
                templateUrl: 'templates/home/help.html',
                controller: 'HelpController'
            }
        }
    })
    .state('app.task', {
        url: '/task',
        views: {
            'app-task': {
                templateUrl: 'templates/task/list.html',
                controller: 'TaskController'
            }
        }
    })
    .state('app.taskadd', {
        url: '/taskAdd',
        views: {
            'app-task': {
                templateUrl: 'templates/task/save.html',
                controller: 'TaskController'
            }
        }
    })
   .state('app.taskedit', {
        url: '/taskEdit/:taskId',
        views: {
            'app-task': {
                templateUrl: 'templates/task/save.html',
                controller: 'TaskController'
            }
        }
    })
   .state('app.taskview', {
        url: '/taskView/:taskId',
        views: {
            'app-task': {
                templateUrl: 'templates/task/view.html',
                controller: 'TaskController'
            }
        }
    })
   .state('app.taskgraph', {
        url: '/taskGraph',
        views: {
            'app-task': {
                templateUrl: 'templates/task/graph.html',
                controller: 'TaskController'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
});