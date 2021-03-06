/**
 * Created by jason on 9/8/14.
 */

'use strict';

angular.module('activities').controller('ActivitiesController', ['$scope', '$stateParams', '$timeout', '$location', 'Authentication', 'Activities', 'NutritionProfile', '$modal', 'ActivitiesDialogService', 'CoreUtilities',
    function($scope, $stateParams, $timeout, $location, Authentication, Activities, NutritionProfile, $modal, ActivitiesDialogService, CoreUtilities) {
        window.scope = $scope;

        $scope.user = Authentication.user;

        $scope.user = user;
        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        $scope.showPlanEditableErrorMsg = false;

        $scope.showInjuriesSection = false;
       // $scope.showNotesSection = true;
        $scope.dailyStepsEntered = false;
        $scope.injuriesVisible = false;
        $scope.isLoading = false;
        $scope.logNavPillSelected = 'activities';

        $scope.authentication = Authentication;


        $scope.activityTypeCategories = [
          'Endurance', 'Strength', 'Balance', 'Flexibility', 'DailySteps'
        ];

        $scope.getMobilePlanDateFormat = function(){
            return CoreUtilities.getMobilePlanDateFormat($scope);
        };



        $scope.planExistsInDb = false;
       // $scope.planDateParam = $routeParams.planDateForCreate;


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
            {id: 32, type: 3, name: 'Yoga'},
            {id: 33, type: 4, name: 'Daily Steps'}

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



        $scope.directionList = ['Ascending', 'Descending'];

//        $scope.activityFieldsList = ['planDate', 'steps', 'weight', 'duration', 'distance', 'averageHeartRate',
//            'activityType', 'averageSpeed', 'intensity', ];

        $scope.selectedDirection = 'Descending';

        $scope.calculateTotalCaloriesBurned = function(){
            var total = 0;

            for(var i = 0; i < $scope.plan.activities.length; i++){
                var activity = $scope.plan.activities[i];
                var calories = activity.caloriesBurned;

                total += calories;
            }

            if($scope.plan.dailySteps > 0) {
                var stepsCaloriesBurned = calculateCaloriesForSteps($scope.plan.dailySteps);

                $scope.plan.dailyStepsCaloriesBurned = stepsCaloriesBurned;

                total += stepsCaloriesBurned;
            }

            $scope.plan.totalCaloriesBurned = total || 0;
        };

        var calculateCaloriesForSteps = function(steps){
            if(steps > 0){
                var weight = $scope.nutritionProfile.weight;

                var caloriesBurnedInMile = 0.57 * weight;
                var stepsInMiles = steps / 2000;

                var caloriesBurned = stepsInMiles * caloriesBurnedInMile;

                return caloriesBurned;
            }
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
                    caloriesBurned = calculateCaloriesForSteps(activity.steps);
                }
            }

            activity.caloriesBurned = caloriesBurned;

            $scope.calculateTotalCaloriesBurned();
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

        $scope.dailyStepsChange = function(){
            //$scope.calculateTotalCaloriesBurned();

            $scope.saveActivityPlan();
        };



        $scope.create = function() {
            var planDateAsString = new Date($scope.plan.planDateNonUtc);
            var planDate = new Date(planDateAsString);
            var planDateToSave = new Date($scope.plan.planDateNonUtc);
            var planDateYear = planDateToSave.getFullYear();
            var planDateMonth = planDateToSave.getMonth();
            var planDateDay = planDateToSave.getDate();

            var planDateYear = planDateYear;
            var planDateMonth = planDateMonth;
            var planDateDay = planDateDay;

            var plan = new Activities({
                planDateForDB: planDateAsString,
                planDateAsMili: planDate.getTime(),
                planDateAsConcat: parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                totalCaloriesBurned: $scope.plan.totalCaloriesBurned,
                activities: $scope.plan.activities,
                notes: $scope.plan.notes,
                notesVisible: $scope.plan.notesVisible,
                injuries: $scope.plan.injuries,
                dailySteps: parseInt($scope.plan.dailySteps),
                dailyStepsCaloriesBurned: $scope.plan.dailyStepsCaloriesBurned
            });
            plan.$save(function(response) {
                plan.planDateNonUtc = response.planDateAsMili;
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

        $scope.deleteActivity = function(activity){
            if (confirm("Are you sure you want to delete this activity?")) {
                for (var i in $scope.plan.activities) {
                    if ($scope.plan.activities[i] === activity) {
                        $scope.plan.activities.splice(i, 1);
                    }
                }

                $scope.saveActivityPlan();
            }
        };

        $scope.deleteInjury = function(injury){
            if (confirm("Are you sure you want to delete this injury?")) {
                for (var i in $scope.plan.injuries) {
                    if ($scope.plan.injuries[i] === injury) {
                        $scope.plan.injuries.splice(i, 1);
                    }
                }

                $scope.saveActivityPlan();
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

        var addActivityToUserActivitiesList = function(activity){
//            if(!$scope.nutritionProfile.userActivities){
//                $scope.nutritionProfile.userActivities = [];
//            }
//
//            var activityExistsInProfile = false;
//            for(var a = 0; a < $scope.nutritionProfile.userActivities; a++){
//                var nutritionProfileActivity = $scope.nutritionProfile.userActivities[a];
//
//                if(nutritionProfileActivity._id === activity._id){
//                    activityExistsInProfile = true;
//                    break;
//                }
//            }
//            if(!activityExistsInProfile){
//                $scope.nutritionProfile.userActivities.push(activity._id);
//            }
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

                //check if need to add activity to user activities list
                addActivityToUserActivitiesList(activity);
            }

            if (!$scope.plan._id){
                $scope.create();
            }
            else{
                $scope.update();
            }

            $scope.calculateTotalCaloriesBurned();

        };

        $scope.deletePlan = function(plan){
            if (confirm("Are you sure you want to delete this plan?")) {
                plan.$delete(function () {
                    console.log("plan deleted");
                    $location.path('activities');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        $scope.update = function() {
            var plan = $scope.plan;

            var planDateAsString = new Date($scope.plan.planDateNonUtc).toUTCString();
            var planDate = new Date(planDateAsString);
            var planDateToSave = new Date($scope.plan.planDateNonUtc);
            var planDateYear = planDateToSave.getFullYear();
            var planDateMonth = planDateToSave.getMonth();
            var planDateDay = planDateToSave.getDate();

            plan.planDateYear = planDateYear;
            plan.planDateMonth = planDateMonth;
            plan.planDateDay = planDateDay;

            plan.dailySteps = parseInt($scope.plan.dailySteps);
           // plan.totalCaloriesBurned = plan.totalCaloriesBurned;
            //plan.dailyStepsCaloriesBurned = plan.dailyStepsCaloriesBurned;
            plan.planDateAsMili = planDate.getTime();
            plan.planDateAsConcat = parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay));

            plan.$update(function(response) {
                plan.planDateNonUtc = new Date(plan.planDateYear, plan.planDateMonth, plan.planDateDay);
                $scope.planExistsInDb = false;
                $scope.success = true;

                $timeout(function () {
                    $scope.success = false;
                }, 3000);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function() {
            $scope.isLoading = true;
            var now = new Date();
            $scope.todayDateAsConcat = getPlanDateAsConcat(now.getFullYear(), now.getMonth(), now.getDate());
            $scope.navPillSelected = 'history';

            $scope.activities = Activities.query(
                function(u, getResponseHeaders)
                {
                    $scope.isLoading = false;


                }
            );


        };

        $scope.getLocationsForInjuries = function(activity){
            var injuryLocationsTxt = '';

            for(var i = 0; i < activity.injuries.length; i++){
                var activityInjury = activity.injuries[i];

                if(activityInjury.injuryLocation){
                    if(i == 0){
                        injuryLocationsTxt = injuryLocationsTxt + '(' + activityInjury.injuryLocation;

                    }

                    else {
                        injuryLocationsTxt = injuryLocationsTxt + ', ' + activityInjury.injuryLocation;
                    }
                }
            }

            if(injuryLocationsTxt.length > 0){
                injuryLocationsTxt = injuryLocationsTxt + ')';
            }

            return injuryLocationsTxt;
        };

        var scrollToBottom = function(){
            $("html, body").animate({ scrollTop: $(document).height() }, 1000);
            $("#content").animate({ scrollTop: $('#content').height() + 700 }, 1000);
        };

        //todo: put in service
        var getPlanDateAsConcat = function(planDateYear, planDateMonth, planDateDay){
            planDateYear = parseInt(planDateYear);
            planDateMonth = parseInt(planDateMonth);
            planDateDay = parseInt(planDateDay);

            return parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay));
        };

        var processNewPlan = function(year, month, day, suppressAutoSave){
            if($stateParams.planDateForCreate) {
                var planDateForCreate = $stateParams.planDateForCreate;

                 year = planDateForCreate.substr(0, 4);
                 month = planDateForCreate.substr(4, 2);
                 day = planDateForCreate.substr(6, 2);

                $stateParams.planDateForCreate = "";
            }

            if(!year && !month && !day){
                var now = new Date();
                year = now.getFullYear();
                month = now.getMonth();
                day = now.getDate();
            }

            $scope.plan =  {data: null, activities: null, planDate: new Date(year, month, day), planDateNonUtc: new Date(year, month, day), planDateYear: year, planDateMonth: month, planDateDay: day, planDateAsConcat: getPlanDateAsConcat(year, month, day)};
            $scope.plan.activities = [];
            $scope.plan.notesVisible = false;
            $scope.plan.injuriesVisible = false;

            $scope.nutritionProfile = window.user.nutritionProfile;

            //$scope.nutritionProfile = NutritionProfile.get(function () {
//                $scope.calculateTotalCaloriesBurned();
//
//                if(!suppressAutoSave) {
//                    $scope.saveActivityPlan();
//                }
            //});

            $scope.calculateTotalCaloriesBurned();

            if(!suppressAutoSave) {
                $scope.saveActivityPlan();
            }

            if(localStorage.tour_current_step && !localStorage.tour_end) {
                tour.goTo(15);
            }
        };

        var processReturnedPlan = function(){
            $scope.plan.planDateNonUtc = new Date($scope.plan.planDateYear, $scope.plan.planDateMonth, $scope.plan.planDateDay);

            var year = $scope.plan.planDateNonUtc.getFullYear();
            var month = $scope.plan.planDateNonUtc.getMonth();
            var day = $scope.plan.planDateNonUtc.getDate();

            var now = new Date();

            if(year === now.getFullYear() && month === now.getMonth() && day === now.getDate()){
                $scope.navPillSelected = 'today';
            }
            else{
                $scope.navPillSelected = 'history';
            }


            $scope.isUserAdmin = $scope.plan.userRoles && $scope.plan.userRoles.indexOf('admin') !== -1 ? true : false;

            if($scope.plan.injuries && $scope.plan.injuries.length > 0){
                $scope.injuriesVisible = true;
                $scope.showInjuriesSection = true;
            }

            $scope.calculateTotalCaloriesBurned();
        };

        var getPlanFromDb = function(year, month, day, planDateAsConcat, suppressAutoSave){
            $scope.isLoading = true;

            $scope.nutritionProfile = window.user.nutritionProfile;

            if(planDateAsConcat){
                $scope.plan = Activities.get({
                    activityId: planDateAsConcat
                },function(plan){
                    if(!plan || (plan && !plan.planDateYear)) {
                        processNewPlan(year, month, day, suppressAutoSave);
                    }
                    processReturnedPlan();
                });
            }
            else if ($stateParams.activityId) {
                $scope.plan = Activities.get({
                    activityId: $stateParams.activityId
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

        $scope.planInputChange = function(planDateInput){
            var year = planDateInput.getFullYear();
            var month = planDateInput.getMonth();
            var day = planDateInput.getDate();

            var planDateAsConcat = getPlanDateAsConcat(year, month, day);

            window.location = '#!/activities/nav/' + planDateAsConcat + '/true';

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

            var planDateAsConcat = getPlanDateAsConcat(year, month, day);

            getPlanFromDb(year, month, day, planDateAsConcat, true);
        };



        $scope.findOne = function() {
            var now = new Date();
            $scope.todayDateAsConcat = getPlanDateAsConcat(now.getFullYear(), now.getMonth(), now.getDate());

            if ($stateParams.activityId) {
                getPlanFromDb();
            }
            else{
                processNewPlan();
            }

            $scope.isExercisesOpen = true;
        };

        $scope.getDesktopPlanDateFormat = function(){
            return CoreUtilities.getDesktopPlanDateFormat($scope);
        };

        $scope.findOneForNav = function(){
            var now = new Date();
            $scope.todayDateAsConcat = getPlanDateAsConcat(now.getFullYear(), now.getMonth(), now.getDate());

            if ($stateParams.planDateAsConcat) {
                var planDateAsConcat = $stateParams.planDateAsConcat;
                var year = planDateAsConcat.substr(0, 4);
                var month = planDateAsConcat.substr(4, 2);
                var day = planDateAsConcat.substr(6, 2);

                var planDate = new Date(year, month, day);

                year = planDate.getFullYear();
                month = planDate.getMonth();
                day = planDate.getDate();

                if(year === now.getFullYear() && month === now.getMonth() && day === now.getDate()){
                    $scope.navPillSelected = 'today';
                }
                else{
                    $scope.navPillSelected = 'history';
                }

                getPlanFromDb(year, month, day, planDateAsConcat, true);
            }

            $scope.isExercisesOpen = true;
        };

        $scope.createInjuryWithDialog = function(injury){

            var modalInstance = $modal.open({
                templateUrl: 'createInjuriesModalContent.html',
                controller: ActivitiesDialogService.CreateInjuriesInstanceCtrl,
                resolve: {
                    injury: function(){
                        return injury;
                    }
                }
            });

            modalInstance.result.then(function (selected) {
                var injuryModel = {
                    painLevel: selected.painLevel,
                    injuryNotes: selected.injuryNotes,
                    injuryLocation: selected.injuryLocation
                };

                if(selected.isUpdate){
                    for(var i = 0; i < $scope.plan.injuries.length; i++){
                        if($scope.plan.injuries[i]._id == selected._id){
                            var injuryToUpdate = $scope.plan.injuries[i];

                            injuryToUpdate.painLevel = injuryModel.painLevel;
                            injuryToUpdate.injuryNotes = injuryModel.injuryNotes;
                            injuryToUpdate.injuryLocation = injuryModel.injuryLocation;
                        }
                    }
                }
                else {
                    $scope.plan.injuries.push(injuryModel);
                }

                $scope.injuriesVisible = true;

                $scope.saveActivityPlan();
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.updateInjury = function(injury){
            $scope.createInjuryWithDialog(injury);
        };

        $scope.addInjury = function(){
            $scope.createInjuryWithDialog();
        };

        $scope.createInjuries = function(){
            $scope.showInjuriesSection = true;
            $scope.injuriesVisible = true;

            $scope.createInjuryWithDialog();
        };

        $scope.openNotesDialog = function () {
            var modalInstance = $modal.open({
                templateUrl: 'notesModalContent.html',
                controller: ActivitiesDialogService.NotesModalInstanceCtrl,

                resolve: {
                    parentScope: function () {
                        return $scope;
                    },
                    planNotes: function(){
                        return $scope.plan.notes
                    }
                }
            });

            modalInstance.result.then(function (notesToSave) {
                $scope.plan.notes = notesToSave;
                $scope.saveActivityPlan();
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.createActivityWithDialog = function(activity, dailySteps, showExerciseDetailsImmediately){
            var modalInstance = $modal.open({
                templateUrl: 'createExerciseModalContent.html',
                controller: ActivitiesDialogService.CreateExerciseInstanceCtrl,
                //size: size,
                resolve: {
                    activity: function(){
                        return activity
                    },
                    activityTypes: function () {
                        return $scope.activityTypes;
                    },
                    activityTypesDictionary: function () {
                        return $scope.activityTypesDictionary;
                    },
                    dailySteps: function () {
                        return dailySteps;
                    },
                    parentScope: function () {
                        return $scope;
                    },
                    showExerciseDetailsImmediately: function(){
                        return showExerciseDetailsImmediately;
                    },
                    hideDailyStepsSection: function(){
                        return $scope.plan.dailySteps > 0;
                    }
                }
            });

            modalInstance.result.then(function (selected) {
                if(selected.dailySteps){
                    $scope.plan.dailySteps = selected.dailySteps;
                   // $scope.calculateTotalCaloriesBurned();
                    $scope.saveActivityPlan();
                }
                else{
                    var newActivityModel = selected.activity;
                    if(newActivityModel.isUpdate){
                        for(var i = 0; i < $scope.plan.activities.length; i++){
                            if($scope.plan.activities[i]._id == newActivityModel._id){
                                $scope.plan.activities[i] = newActivityModel;
                            }
                        }
                    }
                    else {
                        $scope.plan.activities.push(newActivityModel);
                    }

                    $scope.calculateCalories(newActivityModel);

                    $scope.saveActivityPlan();
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };


        $scope.openStepsDialog = function () {
            var modalInstance = $modal.open({
                templateUrl: 'stepsModalContent.html',
                controller: ActivitiesDialogService.StepsModalInstanceCtrl,

                resolve: {
                    parentScope: function () {
                        return $scope;
                    },
                    dailySteps: function(){
                        return $scope.plan.dailySteps
                    }
                }
            });

            modalInstance.result.then(function (dailySteps) {
                $scope.plan.dailySteps = dailySteps;
                //$scope.calculateTotalCaloriesBurned();
                $scope.saveActivityPlan();
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

        //sorting code
        // data
        $scope.orderByField = 'planDateAsConcat';
        $scope.reverseSort = true;
        scope.plansCollection = [];



    }
]);