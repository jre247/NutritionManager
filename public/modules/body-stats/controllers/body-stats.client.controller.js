/**
 * Created by jason on 9/19/14.
 */
'use strict';

angular.module('bodyStats').controller('BodyStatsController', ['$scope', '$stateParams', '$timeout', '$location', 'Authentication', 'BodyStats',
    function($scope, $stateParams, $timeout, $location, Authentication, BodyStats) {
        window.scope = $scope;
        $scope.showPlanEditableErrorMsg = false;


        $scope.authentication = Authentication;


        $scope.directionList = ['Ascending', 'Descending'];
        $scope.selectedDirection = 'Descending';

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
            var planDateAsString = $scope.plan.planDateNonUtc.toUTCString();
            var planDate = new Date(planDateAsString);
            var planDateYear = planDate.getFullYear();
            var planDateMonth = planDate.getMonth();
            var planDateDay = planDate.getDate();

            var plan = new BodyStats({
                planDateForDB: planDateAsString,
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                planDateAsMili: planDate.getTime(),
                weight: $scope.plan.weight,
                bodyFatPercentage: $scope.plan.bodyFatPercentage
            });
            plan.$save(function(response) {
                plan.planDateNonUtc = response.planDateNonUtc;
                $location.path('body-stats/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            $scope.plan.planDate = '';
            $scope.plan.bodyFatPercentage = 0;
            $scope.plan.weight = 0;
        };


        $scope.remove = function(plan) {
            if (plan) {
                plan.$remove();

                for (var i in $scope.bodyStats) {
                    if ($scope.bodyStats[i] === plan) {
                        $scope.bodyStats.splice(i, 1);
                    }
                }
            } else {
                $scope.plan.$remove(function() {
                    $location.path('body-stats');
                });
            }
        };

        $scope.saveBodyStatPlan = function(){
            $scope.showPlanEditableErrorMsg = false;

            if (!$scope.plan._id){
                $scope.create();
            }
            else{
                $scope.update();
            }

        };

        $scope.deletePlan = function(plan){
            if (confirm("Are you sure you want to delete this plan?")) {
                plan.$delete(function () {
                    console.log("plan deleted");
                    $location.path('body-stats');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        $scope.update = function() {
            var plan = $scope.plan;

            var planDateAsString = new Date($scope.plan.planDateNonUtc).toUTCString();
            var planDate = new Date(planDateAsString);
            var planDateYear = planDate.getFullYear();
            var planDateMonth = planDate.getMonth();
            var planDateDay = planDate.getDate();


            plan.planDateYear = planDateYear;
            plan.planDateMonth = planDateMonth;
            plan.planDateDay = planDateDay;
            plan.planDateAsMili = planDate.getTime();
            plan.weight = plan.weight;
            plan.bodyFatPercentage = plan.bodyFatPercentage;

            plan.$update(function() {
                $scope.success = true;

                $timeout(function(){$scope.success = false;}, 3000);


            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function() {
            $scope.bodyStats = BodyStats.query(
                function(u, getResponseHeaders)
                {

                }
            );


        };

        $scope.findOne = function() {
            if ($stateParams.bodyStatId) {
                $scope.plan = BodyStats.get({
                    bodyStatId: $stateParams.bodyStatId
                }, function (u, getResponseHeaders) {
                    if (!$scope.plan.planDateNonUtc){
                        $scope.plan.planDateNonUtc = $scope.plan.planDate;
                    }

                    $scope.isUserAdmin = $scope.plan.userRoles && $scope.plan.userRoles.indexOf('admin') !== -1 ? true : false;


                });
            }
            else{
                $scope.plan =  {weight: null, bodyFatPercentage: null, planDate: new Date(), planDateNonUtc: new Date()};


            }
        };



        //sorting code
        // data
        $scope.orderByField = 'planDateAsMili';
        $scope.reverseSort = true;
        scope.plansCollection = [];



    }
]);