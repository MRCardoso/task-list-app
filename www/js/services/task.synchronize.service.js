angular.module('starter')
    .factory('TaskSync', ['$rootScope', '$http', '$q', '$timeout', 'Database', 'DBUtil', 'Task', 'Loading', 'Log', 'messageBox', 'ExpoImpo','AppSetting', 
    function ($rootScope, $http, $q, $timeout, Database, DBUtil, Task, Loading, Log, messageBox, ExpoImpo,AppSetting){
    /**
     * Start the database local when not created
     */
    function initialize()
    {
        DBUtil.setObject('db.config', {
            dbName: 'mrc.tasklist', // default custom.db
            dbSize: (10 * 1024 * 1024)// default 5MB
        });

        Loading.show('spiral');
        Database.setConnectionOptions({
            dbName: 'mrc.tasklist',
            showLogs: false,
            dbSize: (10 * 1024 * 1024)
        });
        Database.initialize({
            tableName: 'task',
            columns: Task.populateFields({}, 0)
        }).then(function(instance){
            db = instance;
            download()
            .then(function(message){
                messageBox.alert("Success", message, $rootScope);
            });
            // migrate();
        }, function(e){
            messageBox.alert('Error','No was possible start the app',$rootScope);
        }).finally(function(){
            Loading.hide();
        });
    }

    function modalProgress(options, scope){
        options = options || {};

        var deferred = $q.defer();
        scope.progress = 0;
        scope.progressIndex = 1;
        scope.progressTotal = options.data.length;

        var p = messageBox.show({
            title: (options.title || "Sync data"),
            message: [
                '<div class="center">',
                (options.message || "Sync data"),
                '<p>{{progressIndex}}/{{progressTotal}}</p>',
                '<progress max="100" value="{{ progress }}"></progress>',
                '<small>{{progress}}%</small>',
                '</div>'
            ].join('')
        }, scope);

        function progress(index){
            if( index < options.data.length ){
                var current = options.data[index];
                $timeout(function(){
                    scope.progress = Math.ceil( index * 100 / scope.progressTotal );
                    var next = (index+1);
                    scope.progressIndex = next;
                    $timeout(function(){
                        deferred.notify(current);
                        progress(next);
                    },500);
                },500);
            } else{
                scope.progress = 100;
                p.close();
                return deferred.resolve();
            }
        }

        progress(0);

        return deferred.promise;
    }

    /**
     * Migrate the data in localstorage saved in old versions of the app
     * to the sqlite storage to the new version of app
     */
    function migrateLocalStorage()
    {
        return $q(function (resolve, reject){
            var listFails = [];
            var data = angular.fromJson(localStorage.getItem('task')) || [];
            if (data.length == 0) {
                return resolve();
            }
            modalProgress({
                title: "Migrating Data",
                message: "Migrating localstorage data to the local device database",
                data: data
            }, $rootScope).then(function () {
                var title = 'Success', message = '<div class="center">Success migrate tasks.</div>';
                if (listFails.length > 0) {
                    title = 'Attention';
                    message = [
                        '<div class="center">',
                        message, ', however',
                        '<p>It was not possible migrate ', listFails.length, ' task(s).</p>',
                        '<p>Download ', (listFails.length == 1 ? 'this task' : 'these tasks'), '.</p>',
                        '</div>'
                    ].join('');
                }
                messageBox.alert(title, message, $rootScope).then(function () {
                    localStorage.removeItem('task');
                    if (listFails.length > 0) {
                        ExpoImpo.download(listFails);
                        reject();
                    }
                    resolve();
                });
            }, function () { reject(); }, function (current) {
                // delete current.isNewRecord;
                // delete current.id;

                current.start_date = new Date(current.start_date);
                if (current.end_date != null) current.end_date = new Date(current.end_date);
                Task.save(current, undefined).then(function () { }, function (e) {
                    Log.err('não foi possivel');
                    listFails.push(current);
                });
            });
        });
    }

    /**
     * Make download of the tasks with the server(not implemented)
     */
    function download()
    {
        return $q(function(resolve, reject){
            migrateLocalStorage().then(function(){
                $http.get(AppSetting.urlListServer()).then(function (res) {
                    modalProgress({
                        title: "Sync Tasks",
                        message: "Sync your tasks with the server",
                        data: res.data
                    }, $rootScope).then(function () {
                        return resolve('<div class="center">Success to sync with server.</div>');
                    }, function () {
                        return reject('<div class="center">Não foi possivel adicionar a task</div>');
                    }, function (current) {
                        Task.findByReference(current._id).then(function (t) { }, function (err) {
                            Task.saveByServer(current).then(function () { }, function (e) {
                                reject('<div class="center">Não foi possivel adicionar a task</div>');
                            });
                        });
                    });
                }, function (e) {
                    reject(['<div class="center">', e.data.message, '</div>'].join(''));
                });   
            });
        });
    }
    /**
     * Make uploaf of the tasks with the server(not implemented)
     */
    function sync(){}

    function syncOne(task){
        return $q(function(resolve,reject){
            $http.post(AppSetting.urlSyncOne(), {
                title:          task.title,
                description:    task.description,
                priority:       task.priority,
                situation:      task.situation,
                status:         task.status,
                created:        task.created,
                start_date:      task.start_date,
                end_date:        task.end_date
            }).then(function(res){
                Task.saveSyncId(res.data.task._id, task.id).then(function(){
                    resolve(res.data.task);
                }, function(e){
                    reject('No was possible save the task');
                });
            }, function(e){
                reject(e.data.message);      
            });
        });
    }

    function migrate(){
        return $q(function(resolve,reject){
            $http.get('./migrations.json',{}).then(function(res){
                var scripts = res.data;
                db.select(['path'])
                .from('migration')
                .where({ path: { operator: 'IN', value: scripts } })
                .all()
                .then(function(r){
                    // var files = scripts.filter(function(s){
                    //     return r
                    // })
                    // angular.forEach(sa, function (filename, i) {
                    //     filename = filename.replace('www', '');
                    //     $http.get(filename).then(function (script) {
                    //         // db.query(script.data).then(resolve,reject);
                    //     })
                    // })
                });
            })
        })
    }
    
    return {
        initialize: initialize,
        syncOne: syncOne,
        download: download
    }
}])