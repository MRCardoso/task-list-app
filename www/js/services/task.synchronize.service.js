angular.module('starter').factory('TaskSync', ['$rootScope', '$timeout','Database', 'Task', 'Loading', 'Log', 'messageBox', 'ExpoImpo', function($rootScope, $timeout, Database, Task, Loading, Log, messageBox, ExpoImpo){
    /**
     * Start the database local when not created
     */
    function initialize()
    {
        Loading.show();
        Database.initialize({
            tableName: 'task',
            columns: Task.populateFields({}, 0)
        }).then(function(instance){
            db = instance;
            migrateLocalStorage();
        }, function(e){
            messageBox.alert('Error','No was possible start the app',$rootScope);
        }).finally(function(){
            Loading.hide();
        });
    }

    /**
     * Migrate the data in localstorage saved in old versions of the app
     * to the sqlite storage to the new version of app
     */
    function migrateLocalStorage(){
        var listFails = [];
        var data = angular.fromJson(localStorage.getItem('task')) || [];
        if(  data.length == 0 ){
            return true;
        }
        $rootScope.progress = 0;
        $rootScope.progressIndex = 0;
        $rootScope.progressTotal = data.length;

        var p = messageBox.show({
            title: 'Migrating Data',
            message: [
                '<div class="center">',
                "Migrating localstorage data to the local device database",
                '<p>{{progressIndex}}/{{progressTotal}}</p>',
                '<progress max="100" value="{{ progress }}"></progress>',
                '<small>{{progress}}%</small>',
                '</div>'
            ].join('')
        }, $rootScope);

        function progress(index){
            if( index < data.length ){
                $rootScope.progressIndex = index;
                var current = data[index];
                delete current.isNewRecord;
                delete current.id;
                
                current.start_date = new Date(current.start_date);
                if(current.end_date!=null) current.end_date = new Date(current.end_date);
                
                $timeout(function(){
                    $rootScope.progress = Math.ceil( index * 100 / $rootScope.progressTotal );
                    Task
                    .save(current, undefined)
                    .then(function(){ }, function(e){
                        Log.err('não foi possivel');
                        listFails.push(current);
                    }).finally(function(){
                        progress(index+1);
                    });
                },500);
            } else{
                $rootScope.progress = 100;
                var title = 'Success', message = '<div class="center">Success migrate tasks.</div>';
                if(listFails.length>0){
                    title = 'Attention';
                    message = [
                        '<div class="center">',
                        message, ', however',
                        '<p>It was not possible migrate ',listFails.length,' task(s).</p>',
                        '<p>Download ',(listFails.length==1?'this task':'these tasks'),'.</p>',
                        '</div>'
                    ].join('');
                }
                messageBox.alert(title, message, $rootScope).then(function(){
                    if(listFails.length>0){
                        ExpoImpo.download(listFails);
                    }
                    localStorage.removeItem('task');
                    p.close();
                });
            }
        }

        progress($rootScope.progressIndex);
    }

    /**
     * Make download of the tasks with the server(not implemented)
     */
    function download(){}
    /**
     * Make uploaf of the tasks with the server(not implemented)
     */
    function sync(){}
    
    return {
        initialize: initialize
    }
}])