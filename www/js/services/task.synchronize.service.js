angular.module('starter')
.factory('TaskSync', [
    '$rootScope', '$http', '$q', '$timeout', '$filter', 'Database', 'DBUtil', 'Task', 'Loading', 'Log', 'messageBox', 'AppSetting', 'UserData','ProccessSync', 
    function ($rootScope, $http, $q, $timeout, $filter,Database, DBUtil, Task, Loading, Log, messageBox, AppSetting, UserData, ProccessSync)
{
    ProccessSync.proccessUpdate = function (name) {
        var updated = Date.now();
        var index = proccesses.map(function (r, i) { if (r.name == name) return i; });
        if (index[0] != undefined) {
            proccesses[index[0]].lastUpdate = updated;
        } else {
            proccesses.push({ name: name, lastUpdate: updated });
        }
        Log.info("updated Sync " + name + ", Date: " + $filter('date')(updated,'dd/MM/yyyy HH:mm:ss'));
        DBUtil.setObject('proccess.update', proccesses);
    };

    var proccesses = (DBUtil.getObject("proccess.update") || []);
    var fnVoid = function () { };

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
            proccessMake();
        }, function(e){
            messageBox.alert('Error','No was possible start the app',$rootScope);
        }).finally(function(){
            Loading.hide();
        });
    }
    /*
    | -------------------------------------------------------------------------------
    | List and the proccess of to be run in the app
    | -------------------------------------------------------------------------------
    */
    function proccessMake()
    {
        var current = new Date();
        var pid = (DBUtil.getObject("proccess.update") || []);
        var pDefault = [
            migrate,
            migrateLocalStorage,
            download,
        ];
        if (pid.length > 0)
        {
            pid.map(function(r)
            {
                var index = pDefault.indexOf(eval(r.name));
                if(index!= -1)
                {
                    var nextUpdate = new Date( r.lastUpdate + (1440 * 60 * 1000));
                    if(current.getTime() < nextUpdate.getTime()){
                        pDefault.splice(index, 1);
                    }
                }
            })
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

        $http.get('migration-make.json', {}).then(function (res) {
            var scripts = res.data.map(function (r) { return r.replace('www', ''); });
            db.select(['path']).from('migrations').where({ path: { operator: 'IN', value: scripts } }).all().then(function (r) {
                if (r.length > 0) {
                    angular.forEach(r, function (m, i) {
                        var index = scripts.indexOf(m.path)
                        if (index != -1) {
                            scripts.splice(index, 1);
                        }
                    })
                }
                var data = scripts;
                var total = data.length;
                function sync(index) {
                    $timeout(function () {
                        if (index < data.length) {
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
                        } else {
                            deferred.notify({ i: index, t: total});
                            ProccessSync.proccessFinish(listFails, "success run migrations.").then(deferred.resolve);
                        }
                    }, 500);
                }

                sync(0);
            });
        })
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
        var data = angular.fromJson(localStorage.getItem('task')) || [];
        var total = data.length;
        
        function sync(index) {
            $timeout(function () {
                if (index < data.length) {
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
                } else {
                    localStorage.removeItem('task');
                    deferred.notify({ i: index, t: total });
                    ProccessSync.proccessFinish(listFails, "success migrate tasks.").then(deferred.resolve);
                }
            }, 500);
        }

        sync(0);

        return deferred.promise;
    }

    /**
     * Make download of the tasks with the server
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

        $http.get(AppSetting.urlListServer()).then(function (res) {
            var listFails = [];
            var arrayIds = [];
            var data = res.data;
            var total = data.length;
            function sync(index) {
                if (index < data.length) {
                    $timeout(function () {
                        var next = (index + 1);
                        var current = data[index];
                        deferred.notify({ i: next, t: total});
                        Task.findOneReference(current._id).then(function(t){
                            var rIndex = arrayIds.indexOf(current._id);
                            if (rIndex != -1){
                                arrayIds.splice(rIndex, 1);
                            }
                            sync(next);
                        }, function (err){
                            Task.saveByServer(current).then(fnVoid, function (e) {
                                listFails.push(current);
                            }).finally(function() {
                                sync(next);
                            });
                        });
                    },500);
                } else {
                    var finisher = function() {
                        $rootScope.$broadcast("task.update.list");
                        deferred.notify({ i: index, t: total });
                        ProccessSync.proccessFinish(listFails, "success dowload server tasks.").then(deferred.resolve);    
                    }
                    if (arrayIds.length>0){
                        Task.removeReferences(arrayIds).then(fnVoid, function(e){ listFails.push(current); }).finally(finisher);
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
     * Make uploaf of the tasks with the server(not implemented)
     */
    function sync(){}

    function syncOne(task){
        Loading.show();
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
                $timeout(function() {
                    Task.saveSyncId(res.data.task._id, task.id).then(function(){
                        resolve(res.data.task);
                    }, function(e){
                        reject('No was possible save the task');
                    });
                },1000);
            }, function(e){
                reject(e.data.message);
            }).finally(function (params) {
                $timeout(function () {
                    Loading.hide();
                }, 1000);
            });
        });
    }
    
    return {
        initialize: initialize,
        proccessMake: proccessMake,
        syncOne: syncOne,
        dowload: function() {
            return ProccessSync.proccessStart([download]);
        }
    }
}])