angular.module('starter')
.service('ProccessSync', ['$rootScope', '$q', '$timeout', 'Log', 'messageBox', 'ExpoImpo', function ($rootScope, $q, $timeout, Log, messageBox, ExpoImpo){
    var $this = this;
    var errorList = [];
    /*
    | -------------------------------------------------------------------------------
    | Open a popup 'show' with progress of the syncrony of the requires module
    | -------------------------------------------------------------------------------
    */
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
                increment = (increment == 0 ? 1 : increment);
                scope.moduleProgress = increment;
                scope.moduleIndex = (index + 1);
                var current = data[index];
                var fnName = current.name;
                deferred.notify(index);
                current(scope).then(function (success) {
                    $this.proccessUpdate(fnName);
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
                    var g = scope.itemProgress;
                    if (scope.moduleTotal > 1){
                        g = Math.round(increment + (((scope.itemProgress * scope.moduleProgress) / scope.moduleIndex) / 100));
                    }
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
                    if (errorList.length > 0) {
                        var ers = errorList;
                        errorList = [];
                        return deferred.reject(ers);
                    }
                    return deferred.resolve();
                },500)
            }
        }

        progress(0);

        return deferred.promise;
    }
    
    this.progressSyncSimple = function(data) {
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
    /*
    | -------------------------------------------------------------------------------
    | Start call of the continuos proccesses of the app 
    | -------------------------------------------------------------------------------
    */
    this.proccessStart = function (proccess) {
        if (proccess.length == 0) {
            return;
        }
        progressSyncModal(proccess).then(function () {
            if (window.cordova) {
                window.plugins.toast.show("Data was synced with successfull", 'long', 'top');
            }
        }, function (errors) {
            errorList = [];
            ExpoImpo.download(errors, "There are someone errors in the sync, do you wish download the tasks with error?");
        });
    };
    /*
    | -------------------------------------------------------------------------------
    | resolve the proccess item with a message(inject and push error when exists)
    | -------------------------------------------------------------------------------
    */
    this.proccessFinish = function (errors, message) {
        return $q(function (resolve) {
            if (errors.length > 0) {
                errorList.push(errors);
                message += " with " + errors.length + " error(s).";
            }
            resolve(message);
        })
    };
    /*
    | -------------------------------------------------------------------------------
    | Update the last data of sync the proccess of the app
    | -------------------------------------------------------------------------------
    */
    this.proccessUpdate = function (name) { /* NOT Implement by default */ };
}])