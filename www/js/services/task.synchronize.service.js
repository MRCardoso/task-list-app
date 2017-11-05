app.factory('TaskSync', ['Database', 'Task', 'Loading', 'messageBox','$rootScope', function(Database, Task, Loading, messageBox, $rootScope){
    /**
     * Start the database local when not created
     */
    function initialize()
    {
        Loading.show();
        Database.initialize({
            tableName: 'task',
            columns: Task.populateFields({}, 0)
        }).then(function(instance){
            db = instance;
        }, function(e){
            messageBox.alert('Error','No was possible start the app',$rootScope);
        }).finally(function(){
            Loading.hide();
        });
    }

    /**
     * Make download of the tasks with the server(not implemented)
     */
    function download(){}
    /**
     * Make uploaf of the tasks with the server(not implemented)
     */
    function sync(){}
    
    return {
        initialize: initialize
    }
}])