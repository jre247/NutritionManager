/**
 * Created by jason on 9/8/14.
 */

'use strict';

angular.module('activities').controller('ActivitiesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Activities',
    function($scope, $stateParams, $location, Authentication, Activities) {
        window.scope = $scope;

        $scope.authentication = Authentication;

        //sorting code
        // data
        $scope.orderByField = 'activityDate';
        $scope.reverseSort = false;

        //datepicker code
        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        $scope.initDate = new Date('2016-15-20');

        $scope.create = function() {
            var activity = new Activities({
                name: $scope.activity.name,
                steps: $scope.activity.steps,
                activityType: $scope.activity.activityType,
                equipment: $scope.activity.equipment,
                duration: $scope.activity.duration,
                averageSpeed: $scope.activity.averageSpeed,
                reps: $scope.activity.reps,
                weight: $scope.activity.weight,
                activityDate: $scope.activity.activityDateNonUtc
            });
            activity.$save(function(response) {
                $location.path('activities');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

//            $scope.activity.name = '';
//            $scope.activity..steps = '';
//            $scope.activity..activityType = '';
//            $scope.activity..equipment = '';
//            $scope.activity..duration = '';
//            $scope.activity..averageSpeed = '';
//            $scope.activity..reps = '';
//            $scope.activity..weight = '';
//            $scope.activity..activityDate = '';

        };

        $scope.saveActivity = function(){
            if (!$scope.activity._id){
                $scope.create();
            }
            else{
                $scope.update();
            }

        };

        $scope.update = function() {
            var activity = $scope.activity;

            activity.$update(function() {
                $location.path('activities');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function(activity) {
            if (confirm("Are you sure you want to delete this activity?")) {
                if (activity) {
                    activity.$remove();

                    for (var i in $scope.activities) {
                        if ($scope.activities[i] === activity) {
                            $scope.activities.splice(i, 1);
                        }
                    }
                } else {
                    $scope.activity.$remove(function () {
                        $location.path('activities');
                    });
                }
            }
        };

        $scope.find = function() {
            $scope.activities = Activities.query();


        };

        $scope.findOne = function() {
            if ($stateParams.activityId) {
                $scope.activity = Activities.get({
                    activityId: $stateParams.activityId
                }, function (u, getResponseHeaders) {
                    if (!$scope.activity.activityDateNonUtc){
                        $scope.activity.activityDateNonUtc = $scope.activity.activityDate;
                    }

                });
            }
            else{
                $scope.activity =  {data: null, steps: null};
               // $scope.activ.meals = [];
            }
        };



    }
]);