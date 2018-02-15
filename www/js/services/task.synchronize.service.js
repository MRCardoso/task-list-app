angular.module('starter')
.factory('TaskSync', [
    '$rootScope', '$http', '$q', '$timeout', 'Database', 'DBUtil', 'Task', 'Loading', 'Log', 'messageBox', 'ExpoImpo', 'AppSetting','UserData', 
    function ($rootScope, $http, $q, $timeout, Database, DBUtil, Task, Loading, Log, messageBox, ExpoImpo, AppSetting, UserData){
    var proccess = [
        migrate,
        migrateLocalStorage,
        download,
    ];
    var errorList = [];
    function proccessError(errors, message) {
        return $q(function (resolve) {
            if (errors.length > 0) {
                errorList.push(errors);
                message += " with " + errors.length + " error(s).";
            }
            resolve(message);
        })
    }
    var fnVoid = function() {};
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
            showLogs: true,
            enableMigrations: true,
            dbSize: (10 * 1024 * 1024)
        });
        Database.initialize({
            tableName: 'task',
            columns: Task.populateFields({}, 0)
        }).then(function(instance){
            db = instance;
            // progressSyncModal(proccess).then(function (){
            //     if (errorList.length>0){
            //         ExpoImpo.download(errorList, "There are someone errors in the sync, do you wish download the tasks with error?");
            //     }
            //     if (window.cordova) {
            //         window.plugins.toast.show("Data was synced with successfull", 'long', 'top');
            //     }
            // }, function () {
            //     messageBox.alert('Error', 'Sync Error', $rootScope);
            // });
        }, function(e){
            messageBox.alert('Error','No was possible start the app',$rootScope);
        }).finally(function(){
            Loading.hide();
        });
    }

    function progressSyncSimple(data){
        scope = $rootScope.$new();
        scope.progress = 0;

        messageBox.alert("Sending Task " + data.title, [
            '<div class="center">',
                "<p>Sending Task for web app.</p>",
                '<div class="progress">',
                    '<div class="progress-item" style="width: {{progress}}%;">',
                        '<span></span>',
                        '<p class="percent">{{ progress }}%</p>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''), scope);

        return scope;
    }

    function progressSyncModal(data){
        var deferred = $q.defer();
        scope = $rootScope.$new();
        scope.message;
        
        scope.moduleProgress = 0;
        scope.moduleIndex = 0;
        scope.moduleTotal = data.length;

        scope.itemProgress = 0;
        scope.itemIndex = 0;
        scope.itemTotal = 0;

        var p = messageBox.show({
            title: "Syncronizing data",
            message: [
                '<div class="center">',
                '{{message}}',
                '<p>{{moduleIndex}}/{{moduleTotal}}</p>',
                '<div class="progress">',
                    '<div class="progress-item" style="width: {{moduleProgress}}%;">',
                        '<span></span>',
                        '<p class="percent">{{ moduleProgress }}%</p>',
                    '</div>',
                '</div>',
                '<p>{{itemIndex}}/{{itemTotal}}</p>',
                '<div class="progress">',
                    '<div class="progress-item" style="width: {{itemProgress}}%;">',
                        '<span></span>',
                        '<p>{{ itemProgress }}%</p>',
                    '</div>',
                '</div>',
                '</div>'
            ].join('')
        }, scope);

        function progress(index){
            if( index < data.length ){
                var increment = Math.ceil(index * 100 / scope.moduleTotal);
                scope.moduleProgress = increment;
                scope.moduleIndex = (index + 1);
                var current = data[index];
                deferred.notify(index);
                current(scope).then(function (success) {
                    Log.success("ProgressSyncSucess: " + success);
                }, function (error) {
                    Log.err("ProgressError:", error);
                }, function (row) {
                    scope.itemIndex = row.i;
                    scope.itemProgress = (row.t > scope.itemIndex ? Math.ceil(scope.itemIndex * 100 / row.t) : 100);
                    scope.itemTotal = (row.t > scope.itemIndex ? row.t : scope.itemIndex);
                    /**
                     * Pego o percentual do processo atual(processo pai) soma
                     * com o resultado:
                     * multiplica o percentual do item corrente com o percentual do processo, 
                     * divide pelo indice corrente, e divide por 100 para ter o percentual atual
                     */
                    var g = Math.round(increment + (((scope.itemProgress * scope.moduleProgress) / scope.moduleIndex) / 100) );
                    if (g < 100) scope.moduleProgress = g;
                }).finally(function() {
                    $timeout(function() {
                        scope.itemProgress = 0;
                        progress((index + 1));
                    },500);
                })
            } else{
                scope.itemProgress = 100;
                scope.moduleProgress = 100;
                $timeout(function() {
                    p.close();
                    return deferred.resolve();
                },500)
            }
        }

        progress(0);

        return deferred.promise;
    }
    /**
     * Run migrations for the local database  of the app
     */
    function migrate(scope) {
        scope.message = "Running Migrations!";
        var deferred = $q.defer();
        var listFails = [];

        $http.get('./migrations.json', {}).then(function (res) {
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
                            proccessError(listFails, "success run migrations.").then(deferred.resolve);
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
                    proccessError(listFails, "success migrate tasks.").then(deferred.resolve);
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
        if (!UserData.getToken() && !forceAuth){
            return $q(function (resolve, reject) { reject("No has auth user"); });
        }
        var deferred = $q.defer();

        $http.get(AppSetting.urlListServer()).then(function (res) {
            var listFails = [];
            var data = res.data;
            var total = data.length;
            function sync(index) {
                if (index < data.length) {
                    $timeout(function () {
                        var next = (index + 1);
                        var current = data[index];
                        deferred.notify({ i: next, t: total});
                        Task.findByReference(current._id).then(function(t){
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
                    deferred.notify({ i: index, t: total });
                    proccessError(listFails, "success dowload server tasks.").then(deferred.resolve);
                }
            }
            sync(0);
        },deferred.reject);
        
        return deferred.promise;
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
                $timeout(function() {
                    Task.saveSyncId(res.data.task._id, task.id).then(function(){
                        resolve(res.data.task);
                    }, function(e){
                        reject('No was possible save the task');
                    });
                },1000);
            }, function(e){
                reject(e.data.message);
            });
        });
    }
    
    return {
        initialize: initialize,
        syncOne: syncOne,
        download: download
    }
}])