/**
 * Created by jason on 9/19/14.
 */
'use strict';

angular.module('bodyStats').controller('BodyStatsController', ['$scope', '$stateParams', '$timeout', '$location', 'Authentication', 'BodyStats', 'CoreUtilities',
    function($scope, $stateParams, $timeout, $location, Authentication, BodyStats, CoreUtilities) {
        window.scope = $scope;
        $scope.showPlanEditableErrorMsg = false;
        $scope.logNavPillSelected = 'weight';

        $scope.authentication = Authentication;


        $scope.directionList = ['Ascending', 'Descending'];
        $scope.selectedDirection = 'Descending';

        $scope.getMobilePlanDateFormat = function(){
            return CoreUtilities.getMobilePlanDateFormat($scope);
        };

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
//            var planDateAsString = $scope.plan.planDateNonUtc.toUTCString();
//            var planDate = new Date(planDateAsString);
//
//            var planSplit = planDate.toISOString().substr(0, 10).split('-');
//            var planDateYear = parseInt(planSplit[0]);
//            var planDateMonth = parseInt(planSplit[1]) - 1;
//            var planDateDay = parseInt(planSplit[2]);
            var planDateAsString = new Date($scope.plan.planDateNonUtc);
            var planDate = new Date(planDateAsString);
            var planDateToSave = new Date($scope.plan.planDateNonUtc);
            var planDateYear = planDateToSave.getFullYear();
            var planDateMonth = planDateToSave.getMonth();
            var planDateDay = planDateToSave.getDate();

            var planDateYear = planDateYear;
            var planDateMonth = planDateMonth;
            var planDateDay = planDateDay;

            var plan = new BodyStats({
                planDateForDB: planDateAsString,
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                planDateAsMili: planDate.getTime(),
                planDateAsConcat: parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),
                weight: $scope.plan.weight,
                bodyFatPercentage: $scope.plan.bodyFatPercentage
            });
            plan.$save(function(response) {
                plan.planDateNonUtc = new Date($scope.plan.planDateYear, $scope.plan.planDateMonth, $scope.plan.planDateDay)
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

            var planDateAsString = new Date($scope.plan.planDateNonUtc);
            var planDate = new Date(planDateAsString);
            var planDateToSave = new Date($scope.plan.planDateNonUtc);
            var planDateYear = planDateToSave.getFullYear();
            var planDateMonth = planDateToSave.getMonth();
            var planDateDay = planDateToSave.getDate();

            plan.planDateYear = planDateYear;
            plan.planDateMonth = planDateMonth;
            plan.planDateDay = planDateDay;

            plan.planDateAsMili = planDate.getTime();
            plan.planDateAsConcat = parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay));
            plan.weight = plan.weight;
            plan.bodyFatPercentage = plan.bodyFatPercentage;

            plan.$update(function(response) {
                plan.planDateNonUtc = new Date(plan.planDateYear, plan.planDateMonth, plan.planDateDay);
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

        var getPlanDateAsConcat = function(planDateYear, planDateMonth, planDateDay){
            planDateYear = parseInt(planDateYear);
            planDateMonth = parseInt(planDateMonth);
            planDateDay = parseInt(planDateDay);

            return parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay));
        };

        var processReturnedPlan = function(){
            $scope.plan.planDateNonUtc = new Date($scope.plan.planDateYear, $scope.plan.planDateMonth, $scope.plan.planDateDay);

            $scope.isUserAdmin = $scope.plan.userRoles && $scope.plan.userRoles.indexOf('admin') !== -1 ? true : false;
        };

        var processNewPlan = function(dateYear, dateMonth, dateDay, suppressAutoSave){
            if($stateParams.planDateForCreate) {
                var planDateForCreate = $stateParams.planDateForCreate;

                dateYear = planDateForCreate.substr(0, 4);
                dateMonth = planDateForCreate.substr(4, 2);
                dateDay = planDateForCreate.substr(6, 2);
            }
            else if(!dateYear && !dateMonth && !dateDay){
                var now = new Date();
                dateYear = now.getFullYear();
                dateMonth = now.getMonth();
                dateDay = now.getDate();
            }

            $scope.plan =  {weight: null, bodyFatPercentage: null, planDate: new Date(dateYear, dateMonth, dateDay), planDateNonUtc: new Date(dateYear, dateMonth, dateDay), planDateYear: dateYear, planDateMonth: dateMonth, planDateDay: dateDay, planDateAsConcat: getPlanDateAsConcat(dateYear, dateMonth, dateDay)};

            if(!suppressAutoSave) {
                $scope.saveBodyStatPlan();
            }
            //if(localStorage.tour_current_step && !localStorage.tour_end) {
            //    tour.goTo(15);
            //}
        };

        var getPlanFromDb = function(year, month, day, planDateAsConcat, suppressAutoSave){
            $scope.isLoading = true;

            if(planDateAsConcat){
                $scope.plan = BodyStats.get({
                    bodyStatId: planDateAsConcat
                },function(plan){
                    if(!plan || (plan && !plan.planDateYear)) {
                        processNewPlan(year, month, day, suppressAutoSave);
                    }
                    processReturnedPlan();
                });
            }
            else if ($stateParams.bodyStatId) {
                $scope.plan = BodyStats.get({
                    bodyStatId: $stateParams.bodyStatId
                }, function () {
                    processReturnedPlan();
                });
            }
            else if($stateParams.planDateForCreate){
                processNewPlan(year, month, day);
            }
            else{
                processNewPlan();
            }

            $scope.isLoading = false;

        };

        $scope.planInputChange = function(){
            var year = $scope.plan.planDateNonUtc.getFullYear();
            var month = $scope.plan.planDateNonUtc.getMonth();
            var day = $scope.plan.planDateNonUtc.getDate();

            var planDateAsConcat = getPlanDateAsConcat(year, month, day);

            getPlanFromDb(year, month, day, planDateAsConcat, true);

            $scope.opened = false;
        };

        $scope.toggleDayClick = function(direction){
            var year = $scope.plan.planDateNonUtc.getFullYear();
            var month = $scope.plan.planDateNonUtc.getMonth();
            var day = $scope.plan.planDateNonUtc.getDate();

            var planDate = new Date(year, month, day);

            if(direction == 'nextDay'){
                planDate = new Date(planDate.setDate(planDate.getDate() + 1));
            }
            else{
                planDate = new Date(planDate.setDate(planDate.getDate() - 1));
            }

            year = planDate.getFullYear();
            month = planDate.getMonth();
            day = planDate.getDate();

            $scope.plan.planDateNonUtc = new Date(year, month, day);

            //todo: put this in service
            var planDateAsConcat = getPlanDateAsConcat(year, month, day);

            getPlanFromDb(year, month, day, planDateAsConcat, true);
        };

        $scope.findOne = function() {
            if ($stateParams.bodyStatId) {
                $scope.plan = BodyStats.get({
                    bodyStatId: $stateParams.bodyStatId
                }, function (u, getResponseHeaders) {
                    processReturnedPlan();
                });
            }
            else{
                processNewPlan();
            }
        };

        $scope.findNavOne = function(){
            var now = new Date();
            $scope.todayDateAsConcat = getPlanDateAsConcat(now.getFullYear(), now.getMonth(), now.getDate());

            var planDateAsConcat = $stateParams.planDateAsConcat;
            var planDate = new Date(planDateAsConcat);

            var year = planDate.getFullYear();
            var month = planDate.getMonth();
            var day = planDate.getDate();

            //var planDateAsConcat = getPlanDateAsConcat(year, month, day);
            $scope.plan = BodyStats.get({
                bodyStatId: planDateAsConcat
            },function(plan){
                if(!plan || (plan && !plan.planDateYear)) {
                    processNewPlan(year, month, day, true);
                }
                processReturnedPlan();
            });
        };



        //sorting code
        // data
        $scope.orderByField = 'planDateAsConcat';
        $scope.reverseSort = true;
        scope.plansCollection = [];



    }
]);