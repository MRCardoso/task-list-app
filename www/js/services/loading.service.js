app.factory('Loading', ['$ionicLoading', function($ionicLoading){
    function show(){
        return $ionicLoading.show({
            // template: '<p>Loading...</p><ion-spinner icon="dots"></ion-spinner>',
            template: '<p>Loading...</p><ion-spinner icon="bubbles"></ion-spinner>',
            showBackdrop: true,
        });
    }
    function hide(){
        return $ionicLoading.hide();
    }
    return {
        show: show,
        hide: hide
    }
}])