app
.directive('mcCalendar', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/home/calendar.html',
        scope: {},
        controller: function($scope){
            $scope.date = $scope.$parent.$parent.date;
            $scope.days = [
                {id: 1, 'day': 'Sun'},
                {id: 2, 'day': 'Mon'},
                {id: 3, 'day': 'Tue'},
                {id: 4, 'day': 'Wed'},
                {id: 5, 'day': 'Thu'},
                {id: 6, 'day': 'Fri'},
                {id: 7, 'day': 'Sat'},
            ];

            $scope.selectDate = function(d, el)
            {
                $scope.$parent.$parent.date = d;
                angular.element(document.querySelector('#table-calendar td.line-selected')).removeClass('line-selected');
                angular.element(el.target).addClass('line-selected');
            }
            $scope.previous = function(){
                $scope.date = new Date($scope.date.getFullYear(), $scope.date.getMonth()-1);
            };
            $scope.next = function(){
                $scope.date = new Date($scope.date.getFullYear(), $scope.date.getMonth()+1);
            };
            $scope.$watch('date', function(d){
                $scope.monthDays = generateCalendar($scope.date);
            });

            function generateCalendar(date)
            {
                y = date.getFullYear(), m = date.getMonth();
                var firstDay = new Date(y, m, 1), lastDay = new Date(y, m + 1, 0);
                var firstWeekDay = firstDay.getDay(), lastWeekDay = lastDay.getDay();
                var weekDays = [], arrayDays = [];
                var week = 1, day = 1;
                
                if( firstWeekDay > 0 )
                {
                    for(var i = 1; i<=firstDay.getDay();i++)
                    {
                        var d = new Date(y,m, firstDay.getDate()-firstWeekDay);
                        weekDays.push({d:d, current: false});
                        firstWeekDay--;            
                    }
                }
                for(var i = 1; i<= lastDay.getDate(); i++ ) { 
                    weekDays.push({d: new Date(y,m,i), current: true}); 
                }

                if( lastWeekDay != 6 )
                {
                    var k = lastDay.getDate();
                    for(var i = 6; i>lastDay.getDay();i--)
                    {            
                        var d = new Date(y,m, ++k);
                        weekDays.push({d:d, current: false});
                    }
                }
                
                for(var i in weekDays)
                {
                    if( arrayDays[day] == undefined ) arrayDays[day] = [];
                    var current = new Date();
                    arrayDays[day].push({
                        d: weekDays[i].d,
                        isCurrentMonth: weekDays[i].current,
                        isCurrentDay: (
                            current.getDate() == weekDays[i].d.getDate()
                            && current.getMonth() == weekDays[i].d.getMonth()
                            && current.getFullYear() == weekDays[i].d.getFullYear()
                        )
                    });
                    if( week >= 7){
                        week = 0;
                        day++; 
                    }
                    week++;
                }

                return arrayDays;
            }
        }
    }
})