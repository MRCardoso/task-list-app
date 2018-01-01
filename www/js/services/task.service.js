angular.module('starter').service('Task', ['$q','$http','Database', function($q, $http, Database)
{
    var fields = {
        id: ['INTEGER PRIMARY KEY AUTOINCREMENT', null],
        id_task_reference: ['INT', null],
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
        db = Database.connect();
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
    this.prepare = function(task){
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
            return db.insert('task', data);
        } else{
            delete data.id;
            return db.update('task', data, {id: id});
        }
    };

    /**
     * Delete a record in task table
     * @example Task.remove($state.params.taskId);
     * @param {string} id the id of the task to be deleted
     */
    this.remove = function(id){
        return DB().remove('task', {id:id});
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
    
    this.downOld = function(){
        $http.get('./task-list-old-storage.json').then(function(r){            
            localStorage.setItem('task', angular.toJson(r.data));
        }, function(e){
            console.log(e);
        })
    }
}]);