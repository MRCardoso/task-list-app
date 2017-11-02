app.controller('MediaController', ['$scope', '$cordovaCapture', 'messageBox','Log', '$cordovaSms', '$cordovaLocalNotification','$cordovaSQLite','$cordovaVibration','$cordovaTouchID',
function($scope, $cordovaCapture, messageBox,Log, $cordovaSms,$cordovaLocalNotification, $cordovaSQLite, $cordovaVibration,$cordovaTouchID) {
    $scope.listAudio = [];
    $scope.listImage = [];
    $scope.litVideo = [];
    $scope.captureAudio = function() {
        var options = { limit: 1, duration: 10 };

        $cordovaCapture.captureAudio(options).then(function(audioData) {
            // Success! Audio data is here
            Log.success("$cordovaCapture.captureAudio.success:", audioData);
            $scope.listAudio = audioData;
        }, function(err) {
            // An error occurred. Show a message to the user
            messageBox.alert('error', err.code, $scope);
            Log.err("$cordovaCapture.captureAudio.err:", err);
        });
    };

    $scope.captureImage = function() {
        var options = { limit: 1 };

        $cordovaCapture.captureImage(options).then(function(imageData) {
            // Success! Image data is here
            Log.success("$cordovaCapture.captureImage.success:", imageData);
            $scope.listImage = imageData;
        }, function(err) {
            // An error occurred. Show a message to the user
            messageBox.alert('error', err.code, $scope);
            Log.err("$cordovaCapture.captureImage.err:", err);
        });
    };

    $scope.captureVideo = function() {
        var options = { limit: 1 };

        $cordovaCapture.captureVideo(options).then(function(videoData) {
            // Success! Video data is here
            Log.success("$cordovaCapture.captureVideo.success:", videoData);
            $scope.litVideo = videoData;
        }, function(err) {
            // An error occurred. Show a message to the user
            messageBox.alert('error', err.code, $scope);
            Log.err("$cordovaCapture.captureVideo.err:", err);
        });
    };

    $scope.sendSMS = function()
    {
        var options = {
            replaceLineBreaks: false, // true to replace \n by a new line, false by default
            android: {
                intent: 'INTENT'  // send SMS with the native android SMS messaging
                //intent: '' // send SMS without open any other app
            }
        };
        $cordovaSms
            .send(this.phoneNumber, this.message, options)
            .then(function(s) {
                Log.success("$cordovaSms.success:", s);
            }, function(error) {
                // An error occurred
                Log.err("$cordovaSms.err:", error);
            });
    };
    $scope.notify = function(){
        var task = new Task();
        var opened = task.allOpened();
        $cordovaLocalNotification.schedule({
            id: 1,
            title: 'Tasks Open',
            text: 'Total of tasks '+opened,
            sound: 'file://soung/pieces.mp3',
            led: "6E9FDD",
            smallIcon: "file://img/logo.png",
            icon: "file://img/logo.png"
        }).then(function (result) {
            Log.success("$cordovaLocalNotification.success:", result);
            $cordovaVibration.vibrate(100);
        }, function(error) {
            // An error occurred
            Log.err("$cordovaLocalNotification.err:", error);
        });
    };

    $scope.$on('cordovaLocalNotification:trigger', function(event, notification, state) {
        Log.info("scheduled: ", notification);
    });
        
    $scope.openDB = function(){
        var db = $cordovaSQLite.openDB({ name: "tasklist.db", location: 'default' });
        Log.info('db:',db);
        db.sqlBatch([
            'CREATE TABLE IF NOT EXISTS DemoTable (name, score)',
            [ 'INSERT INTO DemoTable VALUES (?,?)', ['Alice', 101] ],
            [ 'INSERT INTO DemoTable VALUES (?,?)', ['Betty', 202] ],
        ], function() {
            Log.success('Populated database OK');
        }, function(error) {
            Log.err('SQL batch ERROR: ' + error.message);
        });
    };
    $scope.touch = function(){
        $cordovaTouchID.checkSupport().then(function() {
            $cordovaTouchID.authenticate("text").then(function() {
                Log.success('$cordovaTouchID:success');
            }, function (error) {
                Log.err('$cordovaTouchID.ERROR', error);
            });
        }, function (error) {
            Log.err('$cordovaTouchID.checkSupport.ERROR: ', error);
        });
    }
}]);