// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova', 'chart.js']);

app.run(function($ionicPlatform, $ionicPopup, $ionicLoading,$rootScope,$ionicScrollDelegate, $ionicNavBarDelegate) 
{
    // $rootScope.scrolling = false;
    $ionicPlatform.ready(function()
    {
        // $ionicLoading.show({template: 'Loading...',duration: 2000}).then(function(){});
        
        if(window.cordova && window.cordova.plugins.Keyboard) 
        {
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
    
	$rootScope.scrollEvent = function() {
		var scrollamount = $ionicScrollDelegate.$getByHandle('scrollHandle').getScrollPosition().top;
		if (scrollamount > 0) { // Would hide nav-bar immediately when scrolled and show it only when all the way at top. You can fiddle with it to find the best solution for you
            $ionicNavBarDelegate.showBar(false);
            // console.log(scrollamount);
            // $rootScope.scrolling = true;
		} else {
            // $rootScope.scrolling = false;
            // console.log(scrollamount);
            $ionicNavBarDelegate.showBar(true);            
		}
	};
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
     // note that you can also chain configs
    $ionicConfigProvider.navBar.alignTitle('left');
    $ionicConfigProvider.tabs.position("top");
    $ionicConfigProvider.tabs.style("standard");
    $ionicConfigProvider.backButton.text('');
    
    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        // templateUrl: 'templates/layout/menu.html',
        templateUrl: 'templates/layout/tabs.html',
        // controller: 'loginController'
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