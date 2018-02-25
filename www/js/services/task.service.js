angular.module('starter')
.factory('TaskServer', ['$resource', 'AppSetting', function ($resource, AppSetting) {
    return $resource(AppSetting.urlSync(), null, {
        'update': { method: 'PUT' },
        'patch': { method: 'PATCH' },
    });
}])
    .service('Task', ['$q', '$http', '$injector', '$timeout', 'Database', 'TaskServer', function ($q, $http, $injector, $timeout,Database, TaskServer)
{
    var fields = {
        id: ['INTEGER PRIMARY KEY AUTOINCREMENT', null],
        // id_task_reference: ['INT', null],
        title: ['TEXT NOT NULL',''],
        description: ['TEXT',''],
        // 1 - low | 2 - average | 3 high
        priority: ['INT', '1'],
        // 1 - open | 2 - concluded | 3 canceled | 4 in process | 5 expired
        situation: ['INT', '1'],
        status: ['BOOLEAN NOT NULL', true],
        start_date: ['INT NOT NULL', new Date()],
        end_date: ['INT', null],
        created: ['INT NOT NULL', Date.now()],
    };
    
    var db = null;
    var DB = function (){
        if(!db){
            db = Database.connect();
        }
        return db;
    };

    /**
     * @param {object} data the list of data to be replace by default values in the fields
     * @param {int} index the index os the each item in 'field' variable(0 or 1)
     */
    this.populateFields = function(data, index)
    {
        var defaults = {};
        for(var f in fields){
            defaults[f] = fields[f][index];
        }
        
        return angular.extend({}, defaults, data || {});
    };

    /**
     * validate the required tasks
     * @param {object} task the item with data to be validate
     */
    this.validate = function(task) {
        if( task.title == '' || task.title == null ){
            if( window.cordova ) $window.plugins.toast.show("The field title is required!", 'long', 'top');
            else alert("The field title is required!");
            return false;
        }
        if( task.start_date == '' || task.start_date == null ){
            if( window.cordova ) $window.plugins.toast.show("The field start date is required!", 'long', 'top');
            else alert("The field start date is required!");
            return false;
        }
        return true;
    };

    /**
     * prepare the field for standard for app
     * @param {object} task the item with data to be validate 
     */
    this.prepare = function (original){
        /**
         * Bug no android 4, dava erro no ng-model para data
         * nao era atualizado data com new Date()
         */
        var task = angular.copy(original);
        task.priority = String(task.priority);
        task.situation = String(task.situation);
        task.status = (task.status == 'true' ? true: false);
        task.start_date = new Date(task.start_date);
        
        if( task.end_date != null )
            task.end_date = new Date(task.end_date);
        
        return task;
    }

    /**
     * Create an object in format for chart.js to display the situation, priority and status in a graph
     * @param {array} tasks all tasks created
     * @param {object} appLabels the labels for situation, priority and status
     */
    this.createChartData = function(appLabels){
        var defer = $q.defer();
        
        this.find().then(function(tasks){
            var options = {
                thickness: 10,
                duration: 8000,
                legend: {
                    display: true,
                    position: 'bottom'
                }
            };
            var values = {
                "status":{v:{}, name: "Status", data:[], labels:[], colors: []},
                "situation":{v:{}, name: "Situation", data:[], labels:[], colors: []},
                "priority":{v:{}, name: "Priority", data:[], labels:[], colors: []},
            };
            tasks.map(function(task)
            {
                task.status = (task.status == 'true' ? true : false);
                for( var i in values)
                {
                    var item = Number(task[i]);
                    if( values[i]['v'][item] == undefined )
                        values[i]['v'][item] = 1;
                    else
                        values[i]['v'][item] += 1;
                }
            });
            angular.forEach(values, function(value, key)
            {
                var instanceLabel = appLabels[key];
                if( instanceLabel != undefined)
                {
                    angular.forEach(instanceLabel, function(row,k){
                        values[key].labels.push(row.name);
                        values[key].colors.push(row.color);
                        values[key].data.push(value.v[k]);
                    })
                }
            });
    
            return defer.resolve({charts: values, options: options});
        }, function(e){
            defer.reject(e);
        });

        return defer.promise;
    };

    /**
     * Create or Update a task, with id is sent the task is updated
     * @example Task.save({title: 'test',start_date: Date.now()}, $state.params.taskId);
     * @param original the databinding of the form
     * @param id the id of the task
     * @return Promise
     */
    this.save = function(original, id){
        // copiado atributos originais, para o databinding não ser atualizado nesta edição
        var data = angular.copy(original);
        data.start_date = data.start_date.getTime();
        if( data.end_date != null )
            data.end_date = data.end_date.getTime();
            
        if( angular.isUndefined(id) ){
            return DB().insert('task', data);
        } else{
            delete data.id;
            return DB().update('task', data, {id: id});
        }
    };

    /**
     * Delete a record in task table
     * @example Task.remove($state.params.taskId);
     * @param {string} id the id of the task to be deleted
     */
    this.remove = function(id){
        var $this = this;
        return $q(function(resolve,reject){
            $this.findReferences({ id: id }).then(function (references) {
                var listIds = references.filter(function(r) {
                    return r.id_task_reference != null;
                }).map(function (r) {
                    return r.id_task_reference;
                });

                DB().remove('task', { id: id }).then(function (result) {
                    if (listIds.length > 0) {
                        $injector.get('TaskSync').remove(listIds);
                    }
                    resolve(result);
                }, reject);
            });
        })
    };
    /**
     * get all records in the task table
     * @example Task.find();
     * @param fields the list of column in the select
     * @param conditions the rules to filter the select
     * @return Promise
     */
    this.find = function(fields, conditions){
        fields = angular.isUndefined(fields) ? ['*'] : fields;
        var query = DB().select(fields).from('task');
        if( angular.isDefined(conditions) )
            query.where(conditions);
        
        return query.all();
    };
    /**
     * get one record in the task table find by id
     * @example Task.findOne(1);
     * @param id the id of the task
     * @return Promise
     */
    this.findOne = function(id){
        return DB().select(['*'])
            .from('task')
            .where({id: id})
            .one();
    };
    /**
     * Gets all tasks with situation 1(open)
     * @example Task.opened();
     * @param id the id of the task
     * @return Promise
     */
    this.opened = function(){
        return DB()
            .select(['count(id) total'])
            .from('task')
            .where({situation: 1})
            .one();
    };

    /**
     * Update the id of task in server, to link the task of the app with web
     * @example Task.saveSyncId(id_server,id_local);
     * @param {string} id_task_reference the _id of the web app store in mongodb
     * @param {int} id the id of the task in local db
     * @return Promise
     */
    this.saveSyncId = function(id_task_reference, id){
        return db.update('task', {id_task_reference: id_task_reference}, {id: id});
    };

    /**
     * Create a task in app, by a object comes from api of the web app
     * @example Task.saveByServer(Object with data}); the id reference is in '_id'
     * @param {object} data the object with data of the task to be save
     * @return Promise
     */
    this.saveByServer = function(data){
        var $this = this;
        var itens = {
            id_task_reference: data.id_task_reference,
            title: data.title,
            description: data.description,
            priority: data.priority,
            situation: data.situation,
            status: data.status,
            created: new Date(data.created),
            start_date: new Date(data.start_date),
            end_date: (data.end_date != null ? new Date(data.end_date) : null)
        };
        return $q(function(resolve,reject) {
            $this.findOneReference(data.id_task_reference).then(function (t) {
                $this.save(itens, t.id).then(resolve, reject);
            }, function (err) {
                $this.save(itens).then(resolve, reject);
            });
        });
    };

    /**
     * Load a task by id task reference created in web app
     * @example Task.findByReference(id_server); the id reference is in '_id'
     * @param {stirng} id_task_reference the _id of the web app store in mongodb
     * @return Promise
     */
    this.findOneReference = function(id_task_reference){
        return DB().select(['*'])
            .from('task')
            .where({id_task_reference: id_task_reference})
            .one();
    };

    /**
     * List all id reference from task table when the id reference is not null
     * @example Task.findReferences(); the id reference is in '_id'
     * @return Promise
     */
    this.findReferences = function(params){
        var condition = { id_task_reference: { operator: '<>', value: ""} };
        if (angular.isDefined(params)){
            condition = angular.extend(condition,params);
        }
        return DB().select(['id_task_reference'])
            .from('task')
            .where(condition)
            .all();
    };
    
    /**
     * remove a or many tasks by your id_task_reference
     * @example Task.removeReferences(id_server|[id_server]); the id reference is in '_id'
     * @param {stirng|array} references the _id of the web app store in mongodb
     * @return Promise
     */
    this.removeReferences = function (references)
    {
        if (references == null){
            return $q(function (resolve, reject) { reject("invalid id of task reference from delete!") });
        }
        var id = references;
        if (typeof references == 'object' && 'length' in references){
            id = { operator: "IN", value: references };
        }
        return DB().remove('task', { id_task_reference: id });
    };

    /**
    * --------------------------------------------------------------------
    * Insert/update a task with the server
    * --------------------------------------------------------------------
    * @param {object} data the task to be update/create in server
    * @returns Promise
    */
    this.syncServer = function(data){
        var task;
        var $this = this;
        var itens = {
            title: data.title,
            description: data.description,
            priority: data.priority,
            situation: data.situation,
            status: data.status,
            created: data.created,
            startDate: data.start_date,
            endDate: data.end_date
        };
        if (data.id_task_reference){
            task = TaskServer.update({ taskId: data.id_task_reference }, itens);
        } else{
            task = TaskServer.save(itens);
        }
        return $q(function(resolve, reject) {
            task.$promise.then(function (response) {
                $timeout(function() {
                    $this.saveSyncId(response.module._id, data.id).then(function () {
                        resolve(response.module);
                    }, function (e) {
                        reject('No was possible save the task');
                    });
                },1000);
            }, function (err) {
                reject(err.data.message);
            });  
        });
    };
}]);