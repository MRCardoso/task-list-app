app.service('Log', function(){
    this.info = function(string, json){
        console.log('%c '+string, 'color: #5E8FCD');
        if(json!=undefined){
            console.log(json);
            console.log('%c '+string, 'color: #5E8FCD');
        }
    };
    this.success = function(string, json){
        console.log('%c '+string, 'color: #29B36E');
        if(json!=undefined){
            console.log(json);
            console.log('%c '+string, 'color: #29B36E');
        }
    };
    this.err = function(string, json){
        console.log('%c '+string, 'color: #e42112');
        if(json!=undefined){
            console.log(json);
            console.log('%c '+string, 'color: #e42112');
        }
    };
})