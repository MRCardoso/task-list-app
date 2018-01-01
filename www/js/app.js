// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', [
    'ionic', 
    'ngCordova', 
    'chart.js',
    'storelitedb',
    'logding.helper'
]).run(function($ionicPlatform, $rootScope, $http, UserData, TaskSync, DBUtil, Log){
    $ionicPlatform.ready(function()
    {
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
            StatusBar.backgroundColorByHexString("#4E8FBD");
        }
    });
    
    $rootScope.$on('auth.user.refresh', function(){
        Log.info('---------------------auth.user.refresh---------------------');
        var token = UserData.getToken();
        $http.defaults.headers.common['x-access-token'] = token;
        $rootScope.isAuth = (token != null ? true : false);
        $rootScope.userData = UserData.find();
    })

    DBUtil.setObject('db.config', {
        dbName: 'mrc.tasklist', // default custom.db
        dbSize: (10*1024*1024)// default 5MB
    });

    TaskSync.initialize();
});