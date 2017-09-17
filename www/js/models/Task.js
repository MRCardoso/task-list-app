function Task()
{
    this.getTasks = function(id)
    {
        var data = angular.fromJson(localStorage.getItem('task'));
        angular.forEach(data, function(row, index)
        {
            data[index].id = index;
            data[index].isNewRecord = false;
        });
        if( id != undefined && data[id] != undefined)
            return data[id];
        return data || [];
    };

    this.items = this.getTasks();

    var fields = {
        title: '',
        description: '',
        priority: "1",// 1 - low | 2 - average | 3 high
        situation: "1", // 1 - open | 2 - concluded | 3 canceled | 4 in process | 5 expired
        status: true,
        start_date: new Date(),
        end_date: null,
        created: new Date()
    };

    this.remove = function(index)
    {
        if( this.items[index] != 'undefined')
        {
            this.items.splice(index, 1);
            store(this.items);
        }        
    };
    this.save = function(data, id)
    {
        data.start_date = validateDate(data.start_date);
        data.end_date = validateDate(data.end_date);

        if( id != undefined && this.items[id] != undefined )
            this.items[id] = data;
        else
            this.items.push(data);
            
        store(this.items);
    };

    this.populateFields = function(data)
    {
        return angular.extend({}, fields, data || {});
    };
    this.allOpened = function()
    {
        var openeds = this.getTasks().filter(function(row){ return row.situation == 1; });
        return openeds.length;
    };

    this.saveByExport = function(f)
    {
        var $this = this;
        return new Promise(function(resolve, reject)
        {
            console.log(f.name);
            if( /(\.csv$)/.test(f.name) )
            {
                var reader = new FileReader();
                // Closure to capture the file information.
                reader.onloadend = function(e) {
                    try{
                        var errors = [];
                        var success = false;
                        var csvArray = (e.target.result).split("\n").filter(function(r){ return r.length > 0; });
                        csvArray.shift();
                        
                        for (var i = 0; i < csvArray.length; i++)
                        {
                            row = csvArray[i].split(';');
                            console.log(row);

                            if( row.length != 7 )
                            {
                                errors.push("Line "+(i+1)+": Invalid length of the file");
                                continue;
                            }
                            if( row[0].trim() == "" ){
                                errors.push("Line "+(i+1)+": The field 'title' is required");
                                continue;
                            }
                            if( row[5].trim() == "" ){
                                errors.push("Line "+(i+1)+": The field 'start date' is required");
                                continue;
                            }

                            var rowData = {
                                "title": row[0].replace(/\r/ig, '\s'),
                                "description": row[1].replace(/\r/ig, '\s'),
                                "priority": row[2],
                                "situation": row[3],
                                "status": (row[4] === "true"),
                                "start_date": row[5],
                                "end_date": row[6].trim(),
                                "created": new Date(),
                            };
                            success = true;
                            $this.save(rowData, null);
                        }
                        
                        if( errors.length > 0 )
                        {
                            var message = errors.join("<br>");
                            if( success ){
                                reject("tasks imported with successful, however the lines were not be imported:<br>"+message);
                            }
                            throw message;
                        }
                        resolve("tasks imported with successful!!");
                    } catch(e){
                        reject("The import had errors: <br>" + e);
                    }
                };
                // Read in the image file as a data URL.
                reader.readAsText(f, 'ISO-8859-1');
            }
            else{
                reject("The extension this file is not a valid csv file!");
            }
        })
    };

    /**
    | --------------------------------------------------------------------
    | Create a file with Blob in csv format, an array with columns splited by ';'
    | --------------------------------------------------------------------
    */
    this.createFileDownload = function(tasks, $filter)
    {
        var charEncode = "\ufeff";
        var separator = ';'
        var arrayData = [
            charEncode+["Title","Description","Priority","Situation","Status","Start","End","Created"].join(separator)+"\n"
        ];

        angular.forEach(tasks, function(row,k){
            arrayData.push(charEncode+[
                row["title"].replace(/\n/ig, '\s'),
                row["description"].replace(/\n/ig, '\s'),
                row["priority"],
                row["situation"],
                row["status"],
                $filter('date')(row["start_date"], 'dd/MM/yyyy'),
                $filter('date')(row["end_date"], 'dd/MM/yyyy'),
                $filter('date')(row["created"], 'dd/MM/yyyy HH:mm:ss'),
            ].join(separator)+"\n");
        });

        var name = Date.now() + '.csv';
        var file = new Blob(arrayData, { type: "text/csv" });

        return {
            name: name,
            str: arrayData.join(''),
            file: file
        }
    }

    this.createChartData = function(tasks, appLabels){
        var values = {
            "status":{v:{}, name: "Status", data:[], labels:[], colors: []},
            "situation":{v:{}, name: "Situation", data:[], labels:[], colors: []},
            "priority":{v:{}, name: "Priority", data:[], labels:[], colors: []},
        };
        tasks.map(function(task)
        {
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

        return values;
    };

    function store(data)
    {
        localStorage.setItem('task', angular.toJson(data));
    }
    
    function generateKey()
    {
        var id = Math.floor(Math.random() * 100000);
        var ids = this.items.map(function(row){
            return row.id;
        });
        if( ids.indexOf(id) != -1 )
            generateKey();
        
        return id;
    }

    function validateDate(string)
    {
        if( string != null && typeof string == 'string' && string.trim().length == 10 )
        {
            var strDate = null;
            if( /([0-9]{2}\/[0-9]{2}\/[0-9]{4})/.test(string) )
            {
                var date = string.split('/');
                strDate = date[1]+"/"+date[0]+'/'+date[2];
            }
            else if( /([0-9]{4}\-[0-9]{2}\-[0-9]{2})/.test(string) )
            {
                var date = string.split('-');
                strDate = date[1]+"/"+date[2]+'/'+date[0];
            }
            console.log(strDate);            
            return new Date(strDate);
        }
        return string;
    }
}