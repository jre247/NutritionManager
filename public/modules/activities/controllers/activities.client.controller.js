/**
 * Created by jason on 9/8/14.
 */

'use strict';

angular.module('activities').controller('ActivitiesController', ['$scope', '$stateParams', '$timeout', '$location', 'Authentication', 'Activities',
    function($scope, $stateParams, $timeout, $location, Authentication, Activities) {
        window.scope = $scope;
        $scope.showPlanEditableErrorMsg = false;
        $scope.isSortingEnabled = false;
        var sortingBtnTxtOptions = ['Enable Sorting', 'Disable Sorting'];
        $scope.sortingBtnTxt = sortingBtnTxtOptions[0];
        var isSortingEnabled = false;

        $scope.authentication = Authentication;


        $scope.activityTypes = [
            {id: 0, name: 'Cardiovascular'},
            {id: 1, name: 'Weight Lifting'},
            {id: 2, name: 'Stretching'},
            {id: 3, name: 'Yoga'},
            {id: 4, name: 'Meditation'}
        ];

        $scope.activityTypesDictionary = [
            'Cardiovascular',
            'Weight Lifting',
            'Stretching',
            'Yoga',
            'Meditation'
        ];

        $scope.toggleSorting = function(){
            if (!isSortingEnabled){
                $('.panel-group').find('.panel-default').removeClass('disabled');
                isSortingEnabled = true;
                $scope.sortingBtnTxt = sortingBtnTxtOptions[1];
            }
            else{
                $('.panel-group').find('.panel-default').addClass('disabled');
                isSortingEnabled = false;
                $scope.sortingBtnTxt = sortingBtnTxtOptions[0];
            }
        };

        $scope.setSorting = function(){
            if (!isSortingEnabled){
                $('.panel-group').find('.panel-default').addClass('disabled');
                isSortingEnabled = false;

            }

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

        $scope.sortableStartCallback = function(e, ui) {
            ui.item.data('start', ui.item.index());
        };
        $scope.sortableUpdateCallback = function(e, ui) {
            var start = ui.item.data('start'),
                end = ui.item.index();

            $scope.plan.activities.splice(end, 0,
                $scope.plan.activities.splice(start, 1)[0]);

            $scope.$apply();
        };

        $scope.sortableOptions = {
            start: $scope.sortableStartCallback,
            update: $scope.sortableUpdateCallback
        };

        $scope.create = function() {
            var plan = new Activities({
                planDate: $scope.plan.planDateNonUtc,
                activities: $scope.plan.activities
            });
            plan.$save(function(response) {
                plan.planDateNonUtc = response.planDateNonUtc;
                $location.path('activities/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            $scope.plan.planDate = '';
            $scope.plan.activities = [];
        };

        $scope.copyPlan = function(planCopyModel){
            var plan = new Activities({
                planDate: planCopyModel.planDate,
                activities: planCopyModel.activities
            });
            plan.$save(function(response) {
                $location.path('activities/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.createActivity = function(){
            var model = {
                name: '',
                activityType: 0,
                activityName: 'Cardiovascular',
                steps: 0,
                equipment: 0,
                duration: 0,
                averageSpeed: 0,
                reps: 0,
                sets: 0,
                weight: 0,
                isVisible: true,
                isEditable: true
            };

            $scope.plan.activities.push(model);

            $timeout(function(){$scope.setSorting();}, 100);
        };


        $scope.editActivity = function(activity){
            activity.isEditable = true;
            activity.isVisible = !activity.isVisible;
        };

        $scope.saveActivity = function(activity){
            activity.isEditable = false;
            activity.isVisible = !activity.isVisible;
        };



        $scope.deleteActivity = function(activity){
            if (confirm("Are you sure you want to delete this activity?")) {
                for (var i in $scope.plan.activities) {
                    if ($scope.plan.activities[i] === activity) {
                        $scope.plan.activities.splice(i, 1);
                    }
                }
            }
        };



        $scope.remove = function(plan) {
            if (plan) {
                plan.$remove();

                for (var i in $scope.activities) {
                    if ($scope.activities[i] === plan) {
                        $scope.activities.splice(i, 1);
                    }
                }
            } else {
                $scope.plan.$remove(function() {
                    $location.path('activities');
                });
            }
        };

        $scope.saveActivityPlan = function(){
            $scope.showPlanEditableErrorMsg = false;

            for(var i = 0; i < $scope.plan.activities.length; i++){
                var activity = $scope.plan.activities[i];

                activity.isEditable = false;
            }

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
                    $location.path('plans');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        $scope.update = function() {
            var plan = $scope.plan;

            plan.$update(function() {
                $scope.success = true;

                $timeout(function(){$scope.success = false;}, 3000);
                $timeout(function(){$scope.setSorting();}, 100);

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function() {
            $scope.activities = Activities.query(
                function(u, getResponseHeaders)
                {

                }
            );


        };

        $scope.findOne = function() {
            if ($stateParams.activityId) {
                $scope.plan = Activities.get({
                    activityId: $stateParams.activityId
                }, function (u, getResponseHeaders) {
                    if (!$scope.plan.planDateNonUtc){
                        $scope.plan.planDateNonUtc = $scope.plan.planDate;
                    }

                    $scope.isUserAdmin = $scope.plan.userRoles && $scope.plan.userRoles.indexOf('admin') !== -1 ? true : false;
                });
            }
            else{
                $scope.plan =  {data: null, activities: null, planDate: null, planDateNonUtc: null};
                $scope.plan.activities = [];
            }
        };


        $scope.toggleActivityVisibility = function(activity){
            activity.isVisible = !activity.activity;
        };


        var checkIfPlanEditable = function(){
            var isPlanEditable = false;

            for(var i = 0; i < $scope.plan.activities.length; i++){
                var planActivity = $scope.plan.activities[i];

                if (planActivity.isEditable){
                    isPlanEditable = true;
                    break;
                }
            }

            return isPlanEditable;
        };

        //sorting code
        // data
        $scope.orderByField = 'planDate';
        $scope.reverseSort = false;
        scope.plansCollection = [];



    }
]);