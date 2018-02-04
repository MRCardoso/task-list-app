app.controller('HelpController', ["$scope", "$ionicModal", "$ionicSlideBoxDelegate", function ($scope, $ionicModal, $ionicSlideBoxDelegate)
{
    $scope.topics = [
        {src: 'img/help/home.jpg', text: "Home, a calendar to filter all tasks in the selected day."},
        {src: 'img/help/task.jpg', text: "Menu task, management of tasks, create edit, delete, export, import, view graphic with situations, priority and status, is possible filter a specific task"},
        {src: 'img/help/task-delete-check.jpg', text: "Click at the toggle in the bottom on left, select the tasks and click again in the toggle."},
        {src: 'img/help/task-delete.jpg', text: "Click in 'ok' to delete the selected tasks, or 'cancel' to abort"},
        {src: 'img/help/task-option.jpg', text: "In the icon on top at right the are actions, create, import, export a graphic"},
        {src: 'img/help/task-create.jpg', text: "Create a new task, with title and start date required"},
        {src: 'img/help/task-grap.jpg', text: "A graph of 'status', 'stuation' and 'prority' for all tasks"},
        {src: 'img/help/task-download.jpg', text: "Download the tasks(with filter too) in your app(.csv)"},
        {src: 'img/help/task-download-done.jpg', text: "After download tasks is possible open the file, if you have the 'Excel' app"},
        {src: 'img/help/task-import.jpg', text: "Upload to create tasks by a file .csv"},
        {src: 'img/help/task-file.jpg', text: "See a example of the csv file"},
        {src: 'img/help/task-edit.jpg', text: "Choose a task and drag to right to show edit button"},
        {src: 'img/help/task-update.jpg', text: "Update the data of a task, in eye icon is possible go to the view of the this task"},
        {src: 'img/help/task-view.jpg', text: "In menu taks, choose a task and click on it to go the view page, in pencil icon is possible go to the edit of the this task"},
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