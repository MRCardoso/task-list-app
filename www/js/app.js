// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova']);

app.run(function($ionicPlatform, $ionicPopup) 
{
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
     // note that you can also chain configs
    $ionicConfigProvider.navBar.alignTitle('center');
    
    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'loginController'
    })
    .state('app.home', {
        url: '/home',
        views: {
            'menuContent': {
                templateUrl: 'templates/home.html',
                controller: 'HomeController'
            }
        }
    })
    .state('app.help', {
        url: '/help',
        views: {
            'menuContent': {
                templateUrl: 'templates/help.html',
                controller: 'HelpController'
            }
        }
    })
    .state('app.task', {
        url: '/task',
        views: {
            'menuContent': {
                templateUrl: 'templates/task/list.html',
                controller: 'TaskController'
            }
        }
    })
    .state('app.taskadd', {
        url: '/taskAdd',
        views: {
            'menuContent': {
                templateUrl: 'templates/task/save.html',
                controller: 'TaskController'
            }
        }
    })
    .state('app.taskedit', {
        url: '/taskEdit/:taskId',
        views: {
            'menuContent': {
                templateUrl: 'templates/task/save.html',
                controller: 'TaskController'
            }
        }
    })
    .state('app.taskview', {
        url: '/taskView/:taskId',
        views: {
            'menuContent': {
                templateUrl: 'templates/task/view.html',
                controller: 'TaskController'
            }
        }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});