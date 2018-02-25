angular.module('starter')
.factory('TaskSync', [
    '$rootScope', '$http', '$q', '$timeout', '$filter', '$resource', 'Database', 'DBUtil', 'Task', 'Loading', 'Log', 'messageBox', 'AppSetting', 'UserData', 'ProccessSync','TaskServer',
    function ($rootScope, $http, $q, $timeout, $filter, $resource, Database, DBUtil, Task, Loading, Log, messageBox, AppSetting, UserData, ProccessSync, TaskServer)
{
    var fnVoid = function () { };
    var migrations = [];
    var taskLocalStorage = angular.fromJson(localStorage.getItem('task')) || [];

    /**
     * Start the database local when not created
     */
    function initialize()
    {
        Loading.show('spiral');
        Database.setConnectionOptions({
            dbName: 'mrc.tasklist',
            showLogs: true,
            enableMigrations: true,
            dbSize: (10 * 1024 * 1024)
        });
        
        Database.initialize({
            tableName: 'task',
            columns: Task.populateFields({}, 0)
        }).then(function(instance){
            db = instance;
            migrationToBeRun().then(proccessMake);
        }, function(e){
            messageBox.alert('Error','No was possible start the app',$rootScope);
        }).finally(function(){
            Loading.hide();
        });
    }
    function migrationToBeRun() {
        return $q(function(resolve,reject) {
            $http.get('migration-make.json', {}).then(function (res) {
                var scripts = res.data.map(function (r) { return r.replace('www', ''); });
                db.select(['path']).from('migrations').where({ path: { operator: 'IN', value: scripts } }).all()
                .then(function (r) {
                    if (r.length > 0) {
                        angular.forEach(r, function (m, i) {
                            var index = scripts.indexOf(m.path)
                            if (index != -1) {
                                scripts.splice(index, 1);
                            }
                        })
                    }
                    resolve(scripts);
                }, reject);
            }, reject);
        })
    }
    /*
    | -------------------------------------------------------------------------------
    | List and the proccess of to be run in the app
    | -------------------------------------------------------------------------------
    */
    function proccessMake(m)
    {
        migrations = m;
        var current = new Date();
        var pDefault = [];
        
        if (migrations.length > 0) {
            pDefault.push(migrate);
        }
        if (taskLocalStorage.length > 0){
            pDefault.push(migrateLocalStorage);
        }

        return ProccessSync.proccessStart(pDefault);
    }
    /**
     * Run migrations for the local database  of the app
     */
    function migrate(scope) {
        scope.message = "Running Migrations!";
        var deferred = $q.defer();
        var listFails = [];

        var data = migrations;
        var total = data.length;
        function sync(index) {
            if (index < data.length) {
                $timeout(function () {
                    var next = (index + 1);
                    var filename = data[index];
                    var current = {status: 1,path: filename,created: Date.now()};
                    deferred.notify({ i: next, t: total});
                    $http.get(filename).then(function (qData) {
                        db.insert('migrations', current).then(function(){
                            db.query(qData.data).then(fnVoid, function (e) {
                                listFails.push(current);
                                db.remove('migrations', { path: filename });
                            }).finally(function() {
                                sync(next);
                            })
                        },function(e){
                            listFails.push(current);
                            sync(next);
                        });
                    });
                }, 500);
            } else {
                deferred.notify({ i: index, t: total});
                ProccessSync.proccessFinish(listFails, "success run migrations.").then(deferred.resolve);
            }
        }

        sync(0);
        return deferred.promise;
    }

    /**
     * Migrate the data in localstorage saved in old versions of the app
     * to the sqlite storage to the new version of app
     */
    function migrateLocalStorage(scope)
    {
        scope.message = "Migrating localstorage data to the local device database";
        var deferred = $q.defer();
        var listFails = [];
        var data = taskLocalStorage;
        var total = data.length;
        
        function sync(index) {
            if (index < data.length) {
                $timeout(function () {
                    var next = (index + 1);
                    var current = data[index];
                    delete current.isNewRecord;
                    delete current.id;
                    deferred.notify({ i: next, t: total });

                    current.start_date = new Date(current.start_date);
                    if (current.end_date != null) current.end_date = new Date(current.end_date);
                    Task.save(current, undefined).then(function() {}, function (e) {
                        listFails.push(current);
                    }).finally(function() {
                        sync(next);  
                    });
                }, 500);
            } else {
                localStorage.removeItem('task');
                deferred.notify({ i: index, t: total });
                ProccessSync.proccessFinish(listFails, "success migrate tasks.").then(deferred.resolve);
            }
        }

        sync(0);

        return deferred.promise;
    }

    /**
    * --------------------------------------------------------------------
    * Make download of the tasks with the server
    * INSERT - create tasks in app, from returned of server
    * UPDATE - create tasks in app, from returned of server
    * DELETE - create tasks in app, from returned of server
    * --------------------------------------------------------------------
    * @param scope the progress scope
    * @param forceAuth validate to force the download
    */
    function download(scope,forceAuth)
    {
        scope.message = "Load the tasks with the remote app";
        forceAuth = angular.isUndefined(forceAuth) ? false : forceAuth;
        if (!UserData.getToken() && !forceAuth)
        {
            return $q(function (resolve, reject) { resolve("No has auth user"); });
        }
        var deferred = $q.defer();

        TaskServer.query().$promise.then(function (response) {
            var listFails = [];
            var arrayIds = [];
            var data = response;
            var total = data.length;
            function sync(index) {
                if (index < data.length) {
                    $timeout(function () {
                        var next = (index + 1);
                        var current = data[index];
                        deferred.notify({ i: next, t: total});
                        var rIndex = arrayIds.indexOf(current.id_task_reference);
                        if (rIndex != -1) {
                            arrayIds.splice(rIndex, 1);
                        }
                        Task.saveByServer(current).then(fnVoid, function (e) {
                            listFails.push(current);
                        }).finally(function () {
                            sync(next);
                        });
                    },500);
                } else {
                    var finisher = function() {
                        $rootScope.$broadcast("task.update.list");
                        deferred.notify({ i: index, t: total });
                        ProccessSync.proccessFinish(listFails, "success dowload server tasks.").then(deferred.resolve);    
                    }
                    if (arrayIds.length>0)
                    {
                        messageBox.confirm({
                            title: "Sync task Deleted",
                            message: "Was found " + arrayIds.length + " task(s) removed from server, you wish remove from app too?",
                            success: function (e) {
                                Task.removeReferences(arrayIds).then(fnVoid, function (e) { listFails.push(current); }).finally(finisher);
                            },
                            fail: finisher
                        }, $rootScope);
                    } else{
                        finisher();
                    }
                    
                }
            }
            Task.findReferences().then(function(references) {
                arrayIds = references.map(function(r) {
                    return r.id_task_reference
                });
                sync(0);
            })
        },deferred.reject);
        
        return deferred.promise;
    }

    /**
     * --------------------------------------------------------------------
     * Remove task deleted from app, in the server too
     * --------------------------------------------------------------------
     * @param {array} references 
     */
    function remove(scope, references) {
        var listFails = [];
        var data = references;
        var total = data.length;
        var deferred = $q.defer();
        function sync(index) {
            if (index < data.length) {
                $timeout(function(){
                    var next = (index + 1);
                    var current = data[index];
                    deferred.notify({ i: next, t: total });
                    TaskServer.patch({ taskId: current }, {}).$promise.then(function () { }, function (err) {
                        listFails.push(err.data.message);
                    }).finally(function () {
                        sync(next);
                    });
                }, 500);
            } else {
                deferred.notify({ i: index, t: total });
                ProccessSync.proccessFinish(listFails, "success remove tasks from server.").then(deferred.resolve);
            }
        }
        sync(0);
        
        return deferred.promise;
    }
    
    return {
        initialize: initialize,
        proccessMake: proccessMake,
        remove: function(references) {
            messageBox.confirm({
                title: "Sync task Deleted",
                message: "Was found " + references.length + " task(s) synced with web app, you wish remove from web too?",
                success: function (e) {
                    ProccessSync.proccessStart([remove], [references], function(errors) {
                        messageBox.alert('Success', [
                            "Success when removing tasks from server, however has the follow errors:<br>",
                            errors[0].join('<br>'),
                        ].join(''), $rootScope);
                    })
                }
            }, $rootScope);
        },
        dowload: function() {
            return ProccessSync.proccessStart([download]);
        }
    }
}])