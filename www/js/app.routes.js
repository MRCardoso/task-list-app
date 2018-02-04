angular.module('starter').config(function ($stateProvider, $urlRouterProvider, $httpProvider)
{
    $httpProvider.interceptors.push('httpInterceptors');

    $stateProvider
    // .state('signin', {
    //     url: '/signin',
    //     templateUrl: 'templates/signin.html',
    //     controller: 'loginController'
    // })
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