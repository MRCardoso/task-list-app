app.service('Database', ['DatabaseConfig', 'Log', '$q', 'Loading', function(DatabaseConfig, Log, $q, Loading)
    {
        var db = null;
        var queryString = '';
        var prepareArray = [];

        /**
         * execute the query command sent in first argument
         * @param {string} sql the string with the query to be executed
         * @param {array} attributes the array of argument to be prepare and replaced in '?' character of the sql
         */
        function query(sql, attributes)
        {
            attributes = (attributes || []);
            return $q(function(resolve, reject){
                db.transaction(function (t){
                    t.executeSql(sql, attributes, function (tx, r) {
                        Log.success('Query: '+sql, [r, attributes], DatabaseConfig.showLogs);
                        return resolve(r);
                    }, function (tx, e) {
                        if( window.cordova ){
                            window.plugins.toast.show("The query had an error", 'long', 'top');
                        }
                        Log.DBException(e, sql, attributes, DatabaseConfig.showLogs);
                        reject(e);
                    });
                });
            });
        }

        /**
         * prepare the rules of the query to be executed
         * @param {object} conditions the rules use in the with in update, delete and select
         * @return Object {values:[], rules:{}}
         */
        function prepareConditions(conditions){
            var arrayList = {values: [], rules: []};
            for( var c in conditions ){
                var compare = '= ?';
                if(typeof conditions[c] == 'object'){
                    compare = conditions[c].operator;
                    switch(compare.toLowerCase()){
                        case 'in':
                        case 'not in':
                        case 'between':
                            value = conditions[c].value.map(function(op){ 
                                arrayList.values.push(op);
                                return '?';
                            }).join(compare.toLowerCase() =='between' ? ' AND ':',');
                            compare = ( compare.toLowerCase() =='between' ? (compare+' '+value): (compare+'('+value+')'));
                            break;
                        default: 
                            arrayList.values.push(conditions[c].value);
                            compare = compare+' ?';
                            break;
                    }
                }
                else{
                    arrayList.values.push(conditions[c]);
                }
                arrayList.rules.push(c+' '+compare);
            }
            return arrayList;
        }
        /**
         * prepare the field in create, insert, update, delete and select query
         * with the pattern of each sql command
         * @param {object} arrayField the list of the field to be add in the query
         * @param {string} type the type of query to prepare the sql standard with columns, rules, etc...
         * @param {object} conditions the rules use in the with in update, delete and select
         * @return Object {values:[], field:{}, conditions:{}}
         */
        function prepareFields(arrayField, type){
            var arrayList = {field: [], values: []};
            for(var i in arrayField)
            {
                arrayList.values.push(arrayField[i]);
                
                switch(type){
                    case 'create': 
                        arrayList.field.push(i+" "+arrayField[i]);
                        break;
                    case 'insert': 
                        arrayList.field.push(i);
                        break;
                    case 'update':
                        arrayList.field.push(i+" = ?");
                        break;
                }
            }
            return arrayList;
        }
        
        /**
         * Start the connection in the databse(WebSql or Sqlite)
         * @return Database
         */
        this.connect = function()
        {
            if( db == null )
            {
                if( window.sqlitePlugin ){
                    db = window.sqlitePlugin.openDatabase({name: 'taskList.db', location: 'default'});
                    Log.info('sqlite.connection', db, DatabaseConfig.showLogs);
                } else{
                    db = window.openDatabase("taskList.db", "1.0", "Teste Web SQL Database", 5*1024*1024);
                    Log.info('WebSql.connection', db, DatabaseConfig.showLogs);
                }
            }
            else{
                Log.info('cache.connection', db, DatabaseConfig.showLogs);
            }
            return this;
        };

        /**
         * @example Database.initialize({tableName:'dbz', columns: {id: 'INTEGER PRIMARY KEY AUTOINCREMENT'}});
         * @param {object} schema the data of the table to be create
         */
        this.initialize = function(schema)
        {
            var defer = $q.defer();
            if( db == null ){
                Log.info('connect.db', undefined, DatabaseConfig.showLogs);
                var instance = this.connect();
                var sql = "SELECT sql FROM sqlite_master WHERE tbl_name = '{tableName}' AND type = 'table'";
                sql = sql.replace('{tableName}', schema.tableName);
    
                query(sql).then(function(r){
                    if( r.rows.length  == 0 ){
                        Log.info('creating.db', schema, DatabaseConfig.showLogs);
                        instance.create(schema.tableName, schema.columns).then(function(){
                            return defer.resolve(instance);
                        }, function(e){
                            Log.DBException(e, schema, DatabaseConfig.showLog);
                            defer.reject(e);
                        });
                    }
                    else{
                        Log.info('loading.db', schema, DatabaseConfig.showLogs);
                        return defer.resolve(instance);
                    }
                }, function(e){
                    Log.DBException(e, sql);
                    defer.reject(e);
                });
            }
            else{
                Log.info('cached.db');
                defer.resolve(db);
            }
            
            return defer.promise;
        };

        /**
         * Create a table in local database
         * @example db.create('dbz', {personagem: 'TEXT'});
         * @param {string} tableName the name of the table to be create
         * @param {object} fields the object with the field of the table
         * @param {boolean} notExists set rule in create sql
         * @return Promise
         */
        this.create = function(tableName, fields, notExists){
            notExists = (angular.isUndefined(notExists) ? 'IF NOT EXISTS' : '');
            
            var fieldList = prepareFields(fields, 'create');
            var sql = "CREATE TABLE {notExist} {tableName} ({fields});"
                    .replace('{tableName}', tableName)
                    .replace('{notExist}', notExists)
                    .replace('{fields}', fieldList.field);

            return query(sql, []);
        };

        /**
         * @param {string} tableName the name of the table
         * @param {boolean} notExists with exists rule
         */
        this.drop = function(tableName, notExists){
            notExists = (angular.isUndefined(notExists) ? 'IF EXISTS ' : '');
            return query("DROP TABLE "+notExists+tableName, []);
        };

        /**
         * Insert a record in the specific table in local database
         * @example db.insert('dbz', {personagem: 'Kakaroto'});
         * @param {string} tableName the name of the table to be create
         * @param {object} fields the object with the field of the table
         * @return Promise
         */
        this.insert = function(tableName, fields){
            var fieldList = prepareFields(fields, 'insert');
            var sql = "INSERT INTO {tableName} ({fields}) values({values})";
            
            sql = sql.replace('{tableName}', tableName)
                    .replace('{fields}', fieldList.field.join(','))
                    .replace('{values}', fieldList.field.map(function(row){ return '?'}) );
            
            return query(sql, fieldList.values);
        };

        /**
         * Update the data of a specific table in local database
         * @example db.update('dbz', {personagem: 'Son Goku'}, {id:1});
         * @param {string} tableName the name of the table to be create
         * @param {object} values the fields to be updated
         * @param {object} condition the rules of the update a data
         * @return Promise
         */
        this.update = function(tableName, values, condition){
            var fieldList = prepareFields(values, 'update');
            var conditions = prepareConditions(condition);
            var sql = "UPDATE {tableName} SET {fields} WHERE {condition};";
            
            sql = sql.replace('{tableName}', tableName)
                    .replace('{fields}', fieldList.field.join(','))
                    .replace('{condition}', conditions.rules.join(" AND ") );
            
            return query(sql, fieldList.values.concat(conditions.values));
        };

        /**
         * Update the data of a specific table in local database
         * @example db.delete('dbz', {id:1});
         * @param {string} tableName the name of the table to be create
         * @param {object} condition the rules of the update a data
         * @return Promise
         */
        this.remove = function(tableName, condition){
            var fieldList = prepareConditions(condition);
            var sql = "DELETE FROM "+tableName;
            if( angular.isDefined(condition) ){
                sql += " WHERE "+(fieldList.rules.join(" AND "))+";";
            }
            return query(sql, fieldList.values);
        };
        
        /**
         * add the 'select' command in the query to be executed
         * @param {object} fields the list of the fields to be return in query
         * @return Database
         */
        this.select = function(fields){
            queryString = "SELECT "+fields.join(', ');
            return this;
        };
        
        /**
         * add the 'from' command in the query to be executed
         * @param {string} tableName the name of the table
         * @return Database
         */
        this.from = function(tableName){
            queryString += " FROM "+tableName;
            return this;
        };

        /**
         * add the 'where' command in the query to be executed
         * @param {object} condition the rules to be add in the query
         * @return Database
         */
        this.where = function(condition){
            var fieldList = prepareConditions(condition);
            queryString += (" WHERE "+fieldList.rules.join(" AND "));
            prepareArray = fieldList.values;

            return this;
        };

        /**
         * return all result of the query stored in 'queryString'
         * @return Promise
         */
        this.all = function(){
            return $q(function(resolve, reject){
                if(queryString == ''){
                    return reject('no query found');
                }
                
                query(queryString, prepareArray).then(function(r){
                    queryString = null;
                    prepareArray = [];
                    var data = [];
                    for (var i = 0; i < r.rows.length; i++){
                        data.push(r.rows.item(i));
                    }
                    resolve(data);
                }, function(e){
                    reject(e);
                });
            });
        };

        /**
         * return one result of the query stored in 'queryString'
         * @return Promise
         */
        this.one = function(){
            return $q(function(resolve, reject){
                if(queryString == ''){
                    return reject('no query found');
                }
                query(queryString+" LIMIT 1", prepareArray).then(function(r){
                    queryString = null;
                    prepareArray = [];
                    if( r.rows.length == 0 )
                        reject('no result found');
                    else
                        resolve(r.rows.item(0));
                }, function(e){
                    reject(e);
                });
            });
        };
    }])