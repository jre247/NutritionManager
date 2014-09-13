/**
 * Created by jason on 9/8/14.
 */

'use strict';

angular.module('activities').controller('ActivitiesController', ['$scope', '$stateParams', '$timeout', '$location', 'Authentication', 'Activities', 'NutritionProfile',
    function($scope, $stateParams, $timeout, $location, Authentication, Activities, NutritionProfile) {
        window.scope = $scope;
        $scope.showPlanEditableErrorMsg = false;
        $scope.isSortingEnabled = false;
        var sortingBtnTxtOptions = ['Enable Sorting', 'Disable Sorting'];
        $scope.sortingBtnTxt = sortingBtnTxtOptions[0];
        var isSortingEnabled = false;

        $scope.authentication = Authentication;
        $scope.nutritionProfile = NutritionProfile.get();

        $scope.activityTypeCategories = [
          'Endurance', 'Strength', 'Balance', 'Flexibility'
        ];


        $scope.activityTypes = [
            {id: 0, type: 0, name: 'Ballet'},
            {id: 1, type: 0, name: 'Baseball'},
            {id: 2, type: 0, name: 'Basketball'},
            {id: 3, type: 0, name: 'Biking'},
            {id: 4, type: 0, name: 'Boxing'},
            {id: 5, type: 0, name: 'Canoeing, Kayaking, or other Rowing'},
            {id: 6, type: 0, name: 'Crossfit'},
            {id: 7, type: 0, name: 'Diving'},
            {id: 8, type: 0, name: 'Football'},
            {id: 9, type: 0, name: 'Hiking'},
            {id: 10, type: 0, name: 'Hockey'},
            {id: 11, type: 0, name: 'Jumping rope'},
            {id: 12, type: 0, name: 'Martial Arts'},
            {id: 13, type: 2, name: 'Meditation'},
            {id: 14, type: 1, name: 'Powerlifting'},
            {id: 15, type: 1, name: 'Rock Climbing'},
            {id: 16, type: 0, name: 'Running'},
            {id: 17, type: 0, name: 'Skateboarding'},
            {id: 18, type: 0, name: 'Skating (Ice or Roller)'},
            {id: 19, type: 0, name: 'Skiing or Snowboarding'},
            {id: 20, type: 0, name: 'Soccer'},
            {id: 21, type: 0, name: 'Stairmaster'},
            {id: 22, type: 3, name: 'Stretching'},
            {id: 23, type: 0, name: 'Surfing'},
            {id: 24, type: 0, name: 'Swimming'},
            {id: 25, type: 0, name: 'Tai Chi'},
            {id: 26, type: 0, name: 'Tennis or other Racket sport'},
            {id: 27, type: 0, name: 'Volleyball'},
            {id: 28, type: 0, name: 'Walking'},
            {id: 29, type: 0, name: 'Water Aerobics'},
            {id: 30, type: 1, name: 'Weight Lifting'},
            {id: 31, type: 0, name: 'Wrestling'},
            {id: 32, type: 3, name: 'Yoga'}

        ];

        $scope.activityTypesDictionary = [];
        for(var i = 0; i < $scope.activityTypes.length; i++) {
            var activityTypeDictModel = {
                name: $scope.activityTypes[i].name,
                type: $scope.activityTypes[i].type
            };

            $scope.activityTypesDictionary.push(activityTypeDictModel);
        }

        $scope.environments = [
            {id: 0, name: 'Outdoors'},
            {id: 1, name: 'Indoors'}
        ];

        $scope.intensityList = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
        ];

        $scope.directionList = ['Ascending', 'Descending'];

//        $scope.activityFieldsList = ['planDate', 'steps', 'weight', 'duration', 'distance', 'averageHeartRate',
//            'activityType', 'averageSpeed', 'intensity', ];

        $scope.selectedDirection = 'Ascending';

        $scope.calculateTotalCaloriesBurned = function(){
            var total = 0;

            for(var i = 0; i < $scope.plan.activities.length; i++){
                var activity = $scope.plan.activities[i];
                var calories = activity.caloriesBurned;

                total += calories;
            }

            $scope.plan.totalCaloriesBurned = total;
        };

        //formulate for calculating calories burned for men:
        // [(Age x 0.2017) — (Weight x 0.09036) + (Heart Rate x 0.6309) — 55.0969] x Time / 4.184.
        //formulate for calculating calories burned for women:
        // [(Age x 0.074) — (Weight x 0.05741) + (Heart Rate x 0.4472) — 20.4022] x Time / 4.184.
        $scope.calculateCalories = function(activity){
            var age = $scope.nutritionProfile.age;
            var weight = $scope.nutritionProfile.weight;
            var heightFeet = $scope.nutritionProfile.heightFeet;
            var heightInches = $scope.nutritionProfile.heightInches;
            var totalHeight = (heightFeet * 12) + heightInches;
            var gender = $scope.nutritionProfile.sex;

            var averageHeartRate = parseInt(activity.averageHeartRate);
            var duration = parseInt(activity.duration);

            var caloriesBurned = 0;

            if(duration > 0) {
                if (!averageHeartRate){
                    averageHeartRate = 120;
                }

                if (gender === 'Male') {
                    caloriesBurned = (((age * 0.2017) - (weight * 0.09036) + (averageHeartRate * 0.6309) - 55.0969) * duration) / 4.184;
                }
                else {
                    caloriesBurned = (((age * 0.074) - (weight * 0.05741) + (averageHeartRate * 0.4472) - 20.4022) * duration) / 4.184;

                }
            }
            else{
                if(!averageHeartRate || averageHeartRate <= 0){
                    var steps = activity.steps;
                    if(steps > 0) {
                        var caloriesBurnedInMile = 0.57 * weight;
                        var stepsInMiles = steps / 2000;

                        caloriesBurned = stepsInMiles * caloriesBurnedInMile;
                    }
                }
            }

            activity.caloriesBurned = caloriesBurned;

            $scope.calculateTotalCaloriesBurned();
        };

        $scope.isActivityEndurance = function(activity){
            var activityTypeId = activity.activityType;

            var type = $scope.activityTypesDictionary[activityTypeId].type;

            return type === 0;
        };

        $scope.isActivityDistanceRelated = function(activity){
            var activityTypeId = activity.activityType;

            var type = $scope.activityTypesDictionary[activityTypeId].name;

            return type === 'Running' || type === 'Walking';
        };

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
            var planDateAsString = $scope.plan.planDateNonUtc.toUTCString();
            var planDate = new Date(planDateAsString);
            var planDateYear = planDate.getFullYear();
            var planDateMonth = planDate.getMonth();
            var planDateDay = planDate.getDate();

            var plan = new Activities({
                planDateForDB: planDateAsString,
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                totalCaloriesBurned: $scope.plan.totalCaloriesBurned,
                activities: $scope.plan.activities
            });
            plan.$save(function(response) {
                plan.planDateNonUtc = response.planDateNonUtc;
                $location.path('activities/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            $scope.plan.planDate = '';
            $scope.plan.totalCaloriesBurned = 0;
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
                activityType: 28,
                activityName: 'Walking',
                steps: 0,
                intensity: 1,
                distance: 0,
                equipment: 0,
                duration: 0,
                averageHeartRate: 0,
                caloriesBurned: 0,
                averageSpeed: 0,
                reps: 0,
                sets: 0,
                weight: 0,
                isVisible: true,
                isEditable: true
            };

            $scope.plan.activities.push(model);

            $scope.calculateCalories(model);

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

                var isStrengthActivity = $scope.activityTypesDictionary[activity.activityType].type === 1;

                if (isStrengthActivity){
                    activity.steps = 0;
                    activity.averageSpeed = 0;
                    activity.distance = 0;
                }
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

            var planDateAsString = $scope.plan.planDateNonUtc.toUTCString();
            var planDate = new Date(planDateAsString);
            var planDateYear = planDate.getFullYear();
            var planDateMonth = planDate.getMonth();
            var planDateDay = planDate.getDate();

            plan.planDateYear = planDateYear;
            plan.planDateMonth = planDateMonth;
            plan.planDateDay = planDateDay;

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

                    $scope.calculateTotalCaloriesBurned();

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