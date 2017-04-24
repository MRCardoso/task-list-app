app.controller('HelpController', ["$scope", "$ionicModal", function ($scope, $ionicModal) {
    $scope.topics = [
        {
            "id": 1,
            "name": "Create task",
            "content": "In 'Manage Task' click on the button '+ New', fill the required fields 'title' and 'start_date', next in save button"
        },
        {
            "id": 2,
            "name": "Update/view task",
            "content": "In the list of task, at the side each one record, have the buttons 'view' and 'edit', but they are hidden, to show they, drag the wished record  for left."
        },
        {
            "id": 3,
            "name": "Delete task",
            "content": "In the list of task, at the side each one record, have the button 'delete',but he is hide, to show he, active the button in the bottom of the page."
        },
        {
            "id": 4,
            "name": "Search task",
            "content": "In the list of task, have the search input, that you can search by whatever word contained into the title or description of the task."
        },
        {
            "id": 5,
            "name": 'Badge',
            "content": "Now have badge in the icon of the app, that shows the total of tasks 'opened' on the moment."
        }
    ];
}])