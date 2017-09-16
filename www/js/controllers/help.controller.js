app.controller('HelpController', ["$scope", "$ionicModal", function ($scope, $ionicModal) {
    $scope.topics = [
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
        },
        {
            "id": 6,
            "name": 'Calender',
            "content": "Now have a home, with a calendar to filter task according the day selected."
        },
        {
            "id": 7,
            "name": "Manage Options <i class='button-icon icon ion-android-more-vertical'></i>",
            "content": "",
            "chidren": [
                {"title": "New", "content": "Button to add a new task, with 'title' and 'start_date' fields required"},
                {"title": "Graph", "content": "modal with the graph with list of 'status', 'stuation' and 'prority'"},
                {"title": "Export", "content": "Download the tasks(with filter too) in your app(.csv)"},
                {
                    "title": "Import", 
                    "content": [
                        "<h4>Upload and created tasks by a file .csv, see a file of example: </h4>",
                        "<table class='table-item'>",
                            "<tr>",
                                "<th>Title</th>",
                                "<th>Description</th>",
                                "<th>Priority</th>",
                                "<th>Situation</th>",
                                "<th>Status</th>",
                                "<th>Start</th>",
                                "<th>End</th>",
                            "</tr>",
                            "<tr>",
                                "<td colspan=\"7\"></td>",
                            "</tr>",
                        "</table>",
                        "<h4>See the list od values for situation, priority and status:</h4>",
                        "<table class='table-item'>",
                            "<tr>",
                                "<th>Situation</th>",
                                "<th>priority</th>",
                                "<th>Status</th>",
                            "</tr>",
                            "<tr>",
                                "<td>1 - Open</td>",
                                "<td>1 - Low</td>",
                                "<td>1 - Active</td>",
                            "</tr>",
                            "<tr>",
                                "<td>2 - Concluded</td>",
                                "<td>2 - Average</td>",
                                "<td>0 - Inactive</td>",
                            "</tr>",
                            "<tr>",
                                "<td>3 - Canceled</td>",
                                "<td>3 - High</td>",
                                "<td></td>",
                            "</tr>",
                            "<tr>",
                                "<td>4 - In process</td>",
                                "<td></td>",
                                "<td></td>",
                            "</tr>",
                            "<tr>",
                                "<td>5 - Expired</td>",
                                "<td></td>",
                                "<td></td>",
                            "</tr>",
                        "</table>",
                    ].join(' ')
                },
            ]
        }
    ];

    $scope.shownGroup = {};
    
    $scope.toggleGroup = function(index, level) {
        if ($scope.isGroupShown(index, level))
            $scope.shownGroup[level] = null;
        else
            $scope.shownGroup[level] = index;
    };
    $scope.isGroupShown = function(index, level) {
        return $scope.shownGroup[level] === index;
    };
}])