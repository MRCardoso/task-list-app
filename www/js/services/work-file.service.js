angular.module('starter').service('WorkFile', ["$cordovaFile", "Log", function ($cordovaFile, Log)
{
    var $this = this;
    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    function savebase64AsImageFile(folderpath, filename, content, contentType) {
        // Convert the base64 string in a Blob
        var DataBlob = b64toBlob(content, contentType);
        window.resolveLocalFileSystemURL(folderpath, function (dir) {
            console.log("Access to the directory granted succesfully");
            dir.getFile(filename, { create: true }, function (file) {
                console.log("File created succesfully.");
                file.createWriter(function (fileWriter) {
                    console.log("Writing content to file");
                    fileWriter.write(DataBlob);
                }, function () {
                    alert('Unable to save file in path ' + folderpath);
                });
            });
        });
    }
    this.downloadImage = function (name, base64) {
        if (window.cordova) {
            Log.info('cordova.file', cordova.file);
            base64 = base64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
            savebase64AsImageFile(cordova.file.externalRootDirectory, name, base64, "image/jpeg");
        } else {
            Log.info("Não implementado Cordova plugin para device");
        }
    };
}]);