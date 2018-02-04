angular.module('starter').factory('ExpoImpo', 
['$rootScope', 'messageBox', '$filter', 'Task', 'Log', '$cordovaFile', '$cordovaFileOpener2', '$q','BadgeHelper',
function($rootScope, messageBox, $filter, Task, Log, $cordovaFile, $cordovaFileOpener2, $q, BadgeHelper){
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
            Log.info('Date to be format: '+strDate);            
            return new Date(strDate);
        }
        return string;
    }
    /**
    | --------------------------------------------------------------------
    | Create a file with Blob in csv format, an array with columns splited by ';'
    | --------------------------------------------------------------------
    * @param {array} tasks
    */
    function createFileDownload(tasks)
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

    /**
     | --------------------------------------------------------------------
     | Create task by an excel file exported
     | --------------------------------------------------------------------
     * @param {*} f the file item
     */
    function saveByExport(f)
    {
        return $q(function(resolve, reject){
            Log.info(f.name);
            if( /(\.csv$)/.test(f.name) )
            {
                var reader = new FileReader();
                // Closure to capture the file information.
                reader.onloadend = function(e) {
                    try{
                        Log.info('file-im', e);
                        var errors = [];
                        var success = false;
                        var csvArray = (e.target.result).split("\n").filter(function(r){ return r.length > 0; });
                        csvArray.shift();
                        
                        for (var i = 0; i < csvArray.length; i++)
                        {
                            row = csvArray[i].split(';');
                            
                            if( row[7] != 'undefined')
                                row.splice(7, 1);
                            
                            if( row.length != 7 )
                            {
                                throw("Invalid length of the file");
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
                                "start_date": validateDate(row[5]),
                                "end_date": row[6] != '' ? validateDate(row[6]) : null,
                                "created": Date.now(),
                            };
                            success = true;
                            Task.save(rowData, undefined).then(function(){
                                Log.success('Task save successful');
                            }, function(e){
                                if( window.cordova ){
                                    window.plugins.toast.show("No was possible save the task", 'long', 'top');
                                }
                            });
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
                reader.readAsText(f, 'ISO-8859-1');// ,'UTF-8')
            }
            else{
                reject("The extension this file is not a valid csv file!");
            }
        })
    };
    /**
    | --------------------------------------------------------------------
    | Create a file with all tasks exists in your app
    | --------------------------------------------------------------------
    */
    function download(tasks)
    {
        var inApp = window.cordova;
        var data = createFileDownload(tasks);

        messageBox.confirm({
            "title": "Download Task",
            "message": "Download a file with all your tasks?",
            "success": function(e){
                if( inApp ){
                    Log.info('cordova.file:', cordova.file);
                    $cordovaFile
                    .writeFile(cordova.file.externalRootDirectory, data.name, data.str, true)
                    .then(function(success) {
                        Log.success("$cordovaFile.writeFile.success:", success);
                        var targetPath = success.target.localURL;
                        // var targetPath = cordova.file.externalRootDirectory + data.name;
                        messageBox.confirm({
                            "title": "Success",
                            "message": "Download successfully done",
                            "btnCancel": "Close",
                            "btnOk": "Open",
                            "classCancel": "button-blue-inverse",
                            "classOk": "button-balanced",
                            "success": function(e){
                                $cordovaFileOpener2.open(
                                    targetPath,
                                    'text/comma-separated-values'
                                ).then(function(event) {
                                    Log.success("$cordovaFileOpener2.open.success:", event);
                                }, function(err) {
                                    Log.err("$cordovaFileOpener2.open.err:", err);
                                    messageBox.alert('Fail', 'Not was possible to open the downloaded file!', $rootScope);
                                });
                            }
                        });
                    }, function(error) {
                        Log.err("$cordovaFile.writeFile.err:", error);
                        messageBox.alert('Fail', 'Do not was possible do the download!', $rootScope);
                    });
                } else{
                    var link = document.createElement("a");
                    link.download = data.name;
                    link.href = URL.createObjectURL(data.file);
                    link.click();
                }
            }
        },$rootScope);
    };

    /**
    | --------------------------------------------------------------------
    | Upload a file .json, with a list of tasks to be create in your app
    | --------------------------------------------------------------------
    */
    function upload()
    {
        messageBox.confirm({
            "title": "Import Tasks",
            "message": "Do you wish import a file with your tasks?",
            "success": function(e){
                var successFile = function(reason){
                    if( window.cordova ){
                        window.plugins.toast.show(reason, 'long', 'top');
                    }
                    BadgeHelper.redirectBadge();
                },
                errorFile = function(reason){
                    Log.err("$cordovaFile.writeFile.err: "+reason);
                    messageBox.alert('Validation Error', reason, $rootScope, [{
                        text: '<b>Ok</b>',
                        type: 'button-blue-inverse',
                        onTap: function(e){
                            BadgeHelper.redirectBadge();
                        }
                    }]);
                };
                if( 'fileChooser' in window)
                {
                    window.fileChooser.open(function(uri) {
                        Log.success("window.fileChooser.open.success: "+uri);
                        window.FilePath.resolveNativePath(uri, function(fileName){
                            Log.success("window.FilePath.resolveNativePath.success: "+fileName);
                            window.resolveLocalFileSystemURL(fileName, function (fileEntry)
                            {
                                Log.success("window.resolveLocalFileSystemURL.success: ", fileEntry);
                                fileEntry.file(function (file) {                                        
                                    saveByExport(file).then(successFile, errorFile);
                                });
                            });
                        });
                    });
                }
                else{
                    var element = document.getElementById('upload-file-item');
                    element.value = "";
                    element.click();
                    
                    element.onchange = function()
                    {
                        saveByExport(this.files[0]).then(successFile, errorFile);
                    };
                }
            }
        });
    };

    return {
        download: download,
        upload: upload
    }
}])