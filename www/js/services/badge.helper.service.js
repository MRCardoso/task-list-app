angular.module('starter').factory('BadgeHelper', ['$ionicPlatform', '$cordovaBadge', 'messageBox', 'Log', '$q', 'Task', 'Loading','$state', function($ionicPlatform, $cordovaBadge, messageBox, Log, $q, Task, Loading, $state){

    /**
    | --------------------------------------------------------------------
    | Add a badge in the ico of the app to notify the tasks open
    | --------------------------------------------------------------------
    */
    function addBadge(value, callback)
    {
        return $q(function(resolve, reject){
            if( window.cordova )
            {                
                $ionicPlatform.ready(function()
                {
                    $cordovaBadge.hasPermission().then(function(yes) 
                    {
                        var action;
                        if( value == 0 ) 
                            action = $cordovaBadge.clear();
                        else 
                            action = $cordovaBadge.set(value);

                        action.then(function() {
                            Log.info("added: "+value);
                            resolve({});
                        }, function(err) {
                            Log.err('action.err: ', err);
                            reject('error on manage badge!');
                        });
                    }, function(no) {
                        Log.err("$cordovaBadge.hasPermission.err:", no);
                        reject('Without permission');
                    });
                });
            }
            else{
                resolve({});
            }
        });
    }

    function redirectBadge(action)
    {
        Loading.show('spiral');
        Task.opened().then(function(opened){
            Log.info("task-open: " + opened.total);
            addBadge(opened.total)
            .then(function(){
                Loading.hide().then(function(){
                    if( action != undefined)
                        action();
                    else
                        $state.reload();
                });
            }, function(message){
                Loading.hide().then(function(){
                    messageBox.alert('error', message, $scope);
                });                
            });
        })            
    }
    return {
        addBadge: addBadge,
        redirectBadge: redirectBadge
    }
}])