function Task()
{
    this.getTasks = function(id)
    {
        var data = angular.fromJson(localStorage.getItem('task'));
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
    this.allOpened = function(tasks)
    {
        var tasks = tasks == undefined ? this.getTasks() : tasks; 
        var openeds = tasks.filter(function(row){ return row.situation == 1; });
        return openeds.length;
    }

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
}