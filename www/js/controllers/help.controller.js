app.controller('HelpController', ["$scope", "$ionicModal", "$ionicSlideBoxDelegate", function ($scope, $ionicModal, $ionicSlideBoxDelegate)
{
    $scope.topics = [
        {src: 'img/help/home.jpg', text: "Home, a calendar to filter all tasks in the selected day."},
        {src: 'img/help/task-option.jpg', text: "Menu task, create, update, view, remove, import, export, grap"},
        {src: 'img/help/task-filter.jpg', text: "Filter a specific task"},
        {src: 'img/help/task-create.jpg', text: "Create a new task, with title and start date required"},
        {src: 'img/help/task-view.jpg', text: "Choose a task and click on it to go the view page"},
        {src: 'img/help/task-edit.jpg', text: "Choose a task and drag to right to show edit button"},
        {src: 'img/help/task-grap.jpg', text: "A graph of 'status', 'stuation' and 'prority' for all tasks"},
        {src: 'img/help/task-delete.jpg', text: "Click at the toggle in the bottom on left, select the task, confirm and delete"},
        {src: 'img/help/task-delete-all.jpg', text: "Click in the trash icon, in the bottom on right, confirm and delete all tasks"},
        {src: 'img/help/task-download.jpg', text: "Download the tasks(with filter too) in your app(.csv)"},
        {src: 'img/help/task-download-done.jpg', text: "After download tasks is possible open the file, if you have the 'Excel' app"},
        {src: 'img/help/task-import.jpg', text: "Upload to create tasks by a file .csv"},
        {src: 'img/help/task-file.jpg', text: "See a example of the csv file"},
    ];

    $scope.showGallery = function(index)
    {
        $scope.activeSlide = 0;
        $ionicModal.fromTemplateUrl('templates/home/gallery.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };
       
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove();
    };
}])