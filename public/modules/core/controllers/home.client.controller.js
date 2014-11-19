'use strict';


angular.module('core').controller('HomeController', ['$scope', '$stateParams', 'Authentication', 'Activities', 'CoreService', 'NutritionProfile', 'Progress', 'ThermometerChartService', '$modal', 'CoreDialogsService', '$location', 'CoreUtilities',
	function($scope, $stateParams, Authentication, Activities, CoreService, NutritionProfile, Progress, ThermometerChartService, $modal, CoreDialogsService, $location, CoreUtilities) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        window.scope = $scope;

        var additionalCaloriesExpended = 300;
        $scope.activityPlan = null;
        $scope.nutritionPlan = null;

        $scope.nutritionProfileParameters = {
            showSubmitButton: false
        };

        var startTour = function(){
            $scope.openTourDialog();
        };

        $scope.openTourDialog = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'startTourDialog.html',
                controller: CoreDialogsService.StartTourDialogCtrl,
                //size: size,
                resolve: {
                    parentScope: function () {
                        return $scope;
                    }
                }
            });

            modalInstance.result.then(function (planCopyModel) {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.dateFormatOptions = {
            weekday: "long", year: "numeric", month: "short",
            day: "numeric"
        };

        $scope.showTargetsNav = true;
        $scope.mobileTargetsClick = function(){
            $scope.showTargetsNav = false;
            showDailyMacrosChartForMobile();
            showTargetMacrosChartForMobile();
            buildThermometerChart(false, '.budgetChartForMobile');

        };
        $scope.homeNavClick = function(){
            $scope.showTargetsNav = true;

        };


        var createNutritionProfileWithDialog = function(){
            var modalInstance = $modal.open({
                templateUrl: 'createNutritionProfileModalContent.html',
                controller: CoreDialogsService.CreateNutritionProfileInstanceCtrl,
                resolve: {
                    parent: function(){
                        return $scope;
                    }
                }
            });

            modalInstance.result.then(function (selected) {
                var nutritionProfile = new NutritionProfile({
                    proteinPercentageTarget: selected.nutritionProfile.proteinPercentageTarget,
                    carbohydratesPercentageTarget: selected.nutritionProfile.carbohydratesPercentageTarget,
                    fatPercentageTarget: selected.nutritionProfile.fatPercentageTarget,
                    deficitTarget: selected.nutritionProfile.deficitTarget,
                    age: selected.nutritionProfile.age,
                    sex: selected.nutritionProfile.sex,
                    weight: selected.nutritionProfile.weight,
                    heightFeet: selected.nutritionProfile.heightFeet,
                    heightInches: selected.nutritionProfile.heightInches,
                    restingHeartRate: selected.nutritionProfile.restingHeartRate,
                    bodyFatPercentage: selected.nutritionProfile.bodyFatPercentage
                });
                nutritionProfile.$save(function(response) {
                    $scope.nutritionProfile = response;
                    startTour();
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };


        $scope.nutritionProfile = NutritionProfile.get(function (data) {
            if(data.age && data.heightFeet && data.sex) {
                $scope.bmr = CoreUtilities.calculateBmr($scope.nutritionProfile);

                $scope.getDailyDashboardData();

                $scope.getWeeklyDashboardData();
            }
            else{
                createNutritionProfileWithDialog();
            }
        });


        $scope.weeklyDashboardView = 'charts';
        $scope.dailyDashboardView = 'dailyCharts';

        //TODO: move into service
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

        var getPlanDateAsConcat = function(planDateYear, planDateMonth, planDateDay){
            planDateYear = parseInt(planDateYear);
            planDateMonth = parseInt(planDateMonth);
            planDateDay = parseInt(planDateDay);

            return parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay));
        };

        var setDashboardDateFromUrl = function(){
            var dateParam = $stateParams.dashboardDate;
            var sDateParam = dateParam.toString();
            var year = sDateParam.substr(0, 4);
            var month = sDateParam.substr(4, 2);
            var day = sDateParam.substr(6, 2);
            $scope.planDate = new Date(year, month, day);
            $scope.planDateForDb = month + '_' + day + '_' + year;
            $scope.planDateForCreate = getPlanDateAsConcat(year, month, day);
            //$scope.planDateForDb = getPlanDateAsConcat(planDateYear, planDateMonth, planDateDay);
            $scope.planDateDisplay = ($scope.planDate.getMonth() + 1) + '/' + $scope.planDate.getDate() + '/' + $scope.planDate.getFullYear();
        };

        var initializePlanDate = function(){
            if($stateParams.dashboardDate) {
                setDashboardDateFromUrl();
            }
            else {
                var todaysDate = (new Date()).toUTCString();
                var dt = new Date(todaysDate);
                var year = dt.getFullYear();
                var month = dt.getMonth();
                var day = dt.getDate();

                $scope.planDate = new Date(todaysDate);
                $scope.planDateForDb = month + '_' + day + '_' + year;
                $scope.planDateForCreate = getPlanDateAsConcat(year, month, day);
                $scope.planDateDisplay = (month + 1) + '/' + day + '/' + year;
            }
        };

        initializePlanDate();

        //TODO: move into service
        $scope.activityTypesDictionary = [];
        for(var i = 0; i < $scope.activityTypes.length; i++) {
            var activityTypeDictModel = {
                name: $scope.activityTypes[i].name,
                type: $scope.activityTypes[i].type
            };

            $scope.activityTypesDictionary.push(activityTypeDictModel);
        }

        $scope.openPlanDate = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.planDateOpened = true;
        };


        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.initDate = new Date('2016-15-20');

        //initialize weekly plan dates to send to DB
        var dWeeklyPlanDate = new Date();
        var dayOfWeek = dWeeklyPlanDate.getDay();
        var year = dWeeklyPlanDate.getFullYear();
        var month = dWeeklyPlanDate.getMonth();
        var day = dWeeklyPlanDate.getDate();
        day = day - dayOfWeek;
        var startWeeklyDt = new Date((new Date(year, month, day)).toUTCString());
        var endWeeklyDt;

        var checkIfChangeWeeklyData = function(){
            var endWeeklyYear = endWeeklyDt.getFullYear();
            var endWeeklyMonth = endWeeklyDt.getMonth();
            var endWeeklyDay = endWeeklyDt.getDate();
            var endWeeklyDateMili = (new Date(endWeeklyYear, endWeeklyMonth, endWeeklyDay)).getTime();

            var startWeeklyYear = startWeeklyDt.getFullYear();
            var startWeeklyMonth = startWeeklyDt.getMonth();
            var startWeeklyDay = startWeeklyDt.getDate();
            var startWeeklyDateMili = (new Date(startWeeklyYear, startWeeklyMonth, startWeeklyDay)).getTime();

            var currentWeeklyYear = $scope.planDate.getFullYear();
            var currentWeeklyMonth = $scope.planDate.getMonth();
            var currentWeeklyDay = $scope.planDate.getDate();

            var currentWeeklyDateMili = (new Date(currentWeeklyYear, currentWeeklyMonth, currentWeeklyDay)).getTime();

            var currentExceedsEndDt = currentWeeklyDateMili > endWeeklyDateMili;

            var currentBelowStartDt = false;
            if(!currentExceedsEndDt){
                currentBelowStartDt = currentWeeklyDateMili < startWeeklyDateMili;
            }

            if(currentExceedsEndDt || currentBelowStartDt){
                setNewWeeklyStartDt();
            }

            return currentExceedsEndDt || currentBelowStartDt;
        };

        var setNewWeeklyStartDt = function(){
            var dayOfWeek = $scope.planDate.getDay();
            var year = $scope.planDate.getFullYear();
            var month = $scope.planDate.getMonth();
            var day = $scope.planDate.getDate();
            day = day - dayOfWeek;
            startWeeklyDt = new Date((new Date(year, month, day)).toUTCString());
        };

        $scope.planDateChanged = function(){
            $scope.planDateForDb = $scope.planDate.getMonth() + '_' + $scope.planDate.getDate() + '_' + $scope.planDate.getFullYear();
            $scope.planDateDisplay = ($scope.planDate.getMonth() + 1) + '/' + $scope.planDate.getDate() + '/' + $scope.planDate.getFullYear();
            $scope.planDateForCreate = getPlanDateAsConcat($scope.planDate.getFullYear(), $scope.planDate.getMonth(), $scope.planDate.getDate());

            $scope.getDailyDashboardData(true);

            var reloadWeeklyData = checkIfChangeWeeklyData();

            if(reloadWeeklyData){
                $scope.getWeeklyDashboardData();
            }
        };

        $scope.nextDayClick = function(isMobile){
            $scope.planDate = new Date($scope.planDate.setDate($scope.planDate.getDate() + 1));
            $scope.planDateForDb = $scope.planDate.getMonth() + '_' + $scope.planDate.getDate() + '_' + $scope.planDate.getFullYear();
            $scope.planDateForCreate = getPlanDateAsConcat($scope.planDate.getFullYear(), $scope.planDate.getMonth(), $scope.planDate.getDate());
            $scope.planDateDisplay = ($scope.planDate.getMonth() + 1) + '/' + $scope.planDate.getDate() + '/' + $scope.planDate.getFullYear();

            $scope.getDailyDashboardData(true, isMobile);

            var reloadWeeklyData = checkIfChangeWeeklyData();

            if(reloadWeeklyData){
                $scope.getWeeklyDashboardData();
            }
        };

        $scope.prevDayClick = function(isMobile){
            $scope.planDate = new Date($scope.planDate.setDate($scope.planDate.getDate() - 1));
            $scope.planDateForDb = $scope.planDate.getMonth() + '_' + $scope.planDate.getDate() + '_' + $scope.planDate.getFullYear();
            $scope.planDateForCreate = getPlanDateAsConcat($scope.planDate.getFullYear(), $scope.planDate.getMonth(), $scope.planDate.getDate());
            $scope.planDateDisplay = ($scope.planDate.getMonth() + 1) + '/' + $scope.planDate.getDate() + '/' + $scope.planDate.getFullYear();

            $scope.getDailyDashboardData(true, isMobile);

            var reloadWeeklyData = checkIfChangeWeeklyData();

            if(reloadWeeklyData){
                $scope.getWeeklyDashboardData();
            }
        };

        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];



        $scope.getWeeklyDashboardData = function()
        {

            var startWeeklyYear = startWeeklyDt.getFullYear();
            var startWeeklyMonth = startWeeklyDt.getMonth();
            var startWeeklyDay = startWeeklyDt.getDate();

            $scope.weeklyDateDisplay = (startWeeklyMonth + 1) + '/' + startWeeklyDay;

            endWeeklyDt = new Date(startWeeklyYear, startWeeklyMonth, startWeeklyDay);
            endWeeklyDt.setDate(endWeeklyDt.getDate() + 6);

            var startDateFormatted = startWeeklyYear + '_' + startWeeklyMonth + '_' + startWeeklyDay;
            var endDateFormatted = endWeeklyDt.getFullYear() + '_' + endWeeklyDt.getMonth() + '_' + endWeeklyDt.getDate();

            $scope.progress = Progress.query({
                    startDate: startDateFormatted,
                    endDate: endDateFormatted
                },
                function(u, getResponseHeaders)
                {


                    if(u.length > 0) {
                        $scope.weeklyNutritionPlanList = u;
                        var weeklyProteinTotal = 0;
                        var weeklyCarbsTotal = 0;
                        var weeklyFatTotal = 0;
                        var weeklyCaloriesTotal = 0;
                        var weeklyDeficitTotal = 0;

                        var len = $scope.weeklyNutritionPlanList.length;

                        for (var w = 0; w < len; w++) {
                            var item = $scope.weeklyNutritionPlanList[w];

                            var dPlanDate = new Date(item.planDateYear, item.planDateMonth, item.planDateDay);
                            var planDateDayOfWeek = days[dPlanDate.getDay()];
                            item.dayOfWeek = planDateDayOfWeek;


                            weeklyProteinTotal += item.totalPlanProteinAsPercent;
                            weeklyCarbsTotal += item.totalPlanCarbsAsPercent;
                            weeklyFatTotal += item.totalPlanFatAsPercent;
                            weeklyCaloriesTotal += item.totalPlanCalories;
                            weeklyDeficitTotal += item.deficit;
                        }

                        $scope.weeklyProteinAverage = weeklyProteinTotal / len;
                        $scope.weeklyCarbsAverage = weeklyCarbsTotal / len;
                        $scope.weeklyFatAverage = weeklyFatTotal / len;
                        $scope.weeklyCaloriesAverage = weeklyCaloriesTotal / len;
                        $scope.weeklyDeficitAverage = weeklyDeficitTotal / len;

                        getWeeklyMacrosChartData();

                        showWeeklyCaloriesDeficitChart();

                        showAverageWeeklyMacrosChart();
                    }
                    else{
                        $scope.weeklyNutritionPlanList = null;
                    }
                }
            );
        };

        var buildThermometerChart = function(isUpdate, isMobile){
            var chartElement;

            if(isMobile){
                chartElement = '.budgetChartForMobile';
            }
            else{
                chartElement = '.budgetChart';
            }

            var caloriesIn = parseFloat($scope.nutritionPlan.totalPlanCalories.toFixed(0));
            var deficitTarget = $scope.nutritionProfile.deficitTarget;

            $scope.deficit = CoreUtilities.calculateDeficit($scope.nutritionPlan, $scope.activityPlan, $scope.nutritionProfile);

            var goalCalories = parseFloat((($scope.deficit - deficitTarget) + caloriesIn).toFixed(0));
            $scope.goalCalories = goalCalories;
            ThermometerChartService.buildThermometerChart(caloriesIn, goalCalories, chartElement, isUpdate);
        };



        $scope.getDailyDashboardData = function(isUpdate, isMobile) {


            CoreService.getDailyDashboardData($scope.planDateForDb).then(function(data){

                var dPlanDate = new Date($scope.planDate.getFullYear(), $scope.planDate.getMonth(), $scope.planDate.getDate());
                var planDateDayOfWeek = days[dPlanDate.getDay()];
                $scope.planDayOfWeek = planDateDayOfWeek;

                if (data.nutritionPlan){
                    var plan = data.nutritionPlan;
                   for (var nMeal = 0; nMeal < plan.meals.length; nMeal++){
                        doMealTotaling(plan.meals[nMeal]);
                   }

                   calculatePlanTotalMacros(plan);

                   $scope.nutritionPlan = plan;

                   $scope.isUserAdmin = $scope.nutritionPlan.userRoles && $scope.nutritionPlan.userRoles.indexOf('admin') !== -1 ? true : false;

                }
                else{
                    $scope.nutritionPlan = null;
                }

                if(data.activityPlan){
                    $scope.activityPlan = data.activityPlan;

                    if($scope.activityPlan.dailySteps > 0){
                        var dailyStepsModel = {
                            name: 'Daily Steps',
                            steps: $scope.activityPlan.dailySteps,
                            activityType: 33,
                            caloriesBurned: $scope.activityPlan.dailyStepsCaloriesBurned
                        };

                        $scope.activityPlan.activities.push(dailyStepsModel);
                    }

                    if($scope.nutritionProfile.isAdvancedNutrientTargets) {
                        $scope.totalCaloriesBurned = $scope.activityPlan.totalCaloriesBurned + additionalCaloriesExpended;
                    }
                    else{
                        var bmr = CoreUtilities.calculateBmr($scope.nutritionProfile);
                        $scope.totalCaloriesBurned = CoreUtilities.calculateCaloriesOut($scope.nutritionProfile, bmr) - bmr;
                    }
                }
                else{
                    $scope.activityPlan = null;

                    if($scope.nutritionProfile.isAdvancedNutrientTargets) {
                        $scope.totalCaloriesBurned = additionalCaloriesExpended;
                    }
                    else{
                        var bmr = CoreUtilities.calculateBmr($scope.nutritionProfile);
                        $scope.totalCaloriesBurned = CoreUtilities.calculateCaloriesOut($scope.nutritionProfile, bmr) - bmr;
                    }
                }


                if($scope.nutritionPlan) {
                    if(isMobile){
                        showDailyMacrosChartForMobile();


                    }
                    else{
                        showDailyMacrosChart();
                    }



                    buildThermometerChart(isUpdate, isMobile);
                }

                if(!data.dailyBodyStats){
                    $scope.showEnterDailyWeight = true;
                }
                else{
                    $scope.showEnterDailyWeight = false;

                    $scope.dailyBodyStats = data.dailyBodyStats;
                }

                if(localStorage.tour_current_step) {
                    var tourStep = parseInt(localStorage.tour_current_step);
                    tour.goTo(tourStep);
                }
            });
        };

        var showWeeklyCaloriesDeficitChart = function() {
            var caloriesList = [];
            var deficitList = [];
            var datesList = [];

            for(var i = 0; i < $scope.weeklyNutritionPlanList.length; i++){
                var dayItem = $scope.weeklyNutritionPlanList[i];

                var dayDate = dayItem.planDateYear + '-' + (dayItem.planDateMonth + 1) + '-' + dayItem.planDateDay;

                caloriesList.push(dayItem.totalPlanCalories);
                deficitList.push(parseInt(dayItem.deficit));
                datesList.push(dayDate);
            }

            var config = {};
            config.bindto = '#weeklyCaloriesChart';
            config.data = {};
            config.data.json = {};
            config.data.json.calories = caloriesList;
            config.data.json.deficit = deficitList;
            config.axis = {
                "x":
                    {
                        type: 'category',
                        categories: datesList
                    },
                "y":
                    {
                        "label":
                            {
                                "text":"",
                                "position":"outer-middle"
                            }
                    }
            };
            config.data.types={"calories":"bar", "deficit": "bar"};
            config.size = {width: 450, height: 220};
            $scope.chart = c3.generate(config);
        };

        //TODO: move into service
        var showDailyMacrosChart = function() {
            var config = {};
            config.bindto = '#dailyMacrosChart';
            config.data = {};
            config.data.json = {};
            config.data.json.protein = $scope.nutritionPlan.totalPlanProteinAsPercent;
            config.data.json.carbs = $scope.nutritionPlan.totalPlanCarbsAsPercent;
            config.data.json.fat = $scope.nutritionPlan.totalPlanFatAsPercent;
            config.axis = {"y":{"label":{"text":"Daily Macros","position":"outer-middle"}}};
            config.data.types={"protein":"pie", "carbs": "pie", "fat": "pie"};
            config.size = {width: 190, height: 190};
           // config.size = {width: 220, height: 220};
            $scope.chart = c3.generate(config);
        };

        var showDailyMacrosChartForMobile = function(){
            //todo: don't duplicate this code here - it's basically the same as above
            var config = {};
            config.bindto = '#dailyMacrosChartForMobile';
            config.data = {};
            config.data.json = {};
            config.data.json.protein = $scope.nutritionPlan.totalPlanProteinAsPercent;
            config.data.json.carbs = $scope.nutritionPlan.totalPlanCarbsAsPercent;
            config.data.json.fat = $scope.nutritionPlan.totalPlanFatAsPercent;
            config.axis = {"y":{"label":{"text":"Daily Macros","position":"outer-middle"}}};
            config.data.types={"protein":"pie", "carbs": "pie", "fat": "pie"};
            config.size = {width: 180, height: 180};
            // config.size = {width: 220, height: 220};
            $scope.chart = c3.generate(config);
        };

        var showTargetMacrosChartForMobile = function(){
            //todo: don't duplicate this code here - it's basically the same as above
            var config = {};
            config.bindto = '#targetMacrosChartForMobile';
            config.data = {};
            config.data.json = {};
            config.data.json.protein = $scope.nutritionProfile.proteinPercentageTarget;
            config.data.json.carbs = $scope.nutritionProfile.carbohydratesPercentageTarget;
            config.data.json.fat = $scope.nutritionProfile.fatPercentageTarget;
            config.axis = {"y":{"label":{"text":"Daily Macros","position":"outer-middle"}}};
            config.data.types={"protein":"pie", "carbs": "pie", "fat": "pie"};
            config.size = {width: 180, height: 180};
            // config.size = {width: 220, height: 220};
            $scope.chart = c3.generate(config);
        };

        var showAverageWeeklyMacrosChart = function() {
            var config = {};
            config.bindto = '#weeklyAverageMacrosChart';
            config.data = {};
            config.data.json = {};
            config.data.json.protein = parseInt($scope.weeklyProteinAverage);
            config.data.json.carbs = parseInt($scope.weeklyCarbsAverage);
            config.data.json.fat = parseInt($scope.weeklyFatAverage);
            config.axis = {"y":{"label":{"text":"Weekly Macros","position":"outer-middle"}}};
            config.data.types={"protein":"pie", "carbs": "pie", "fat": "pie"};
            config.size = {width: 220, height: 220};
            $scope.chart = c3.generate(config);
        };

        var getWeeklyMacrosChartData = function() {
            var fatList = [];
            var carbsList = [];
            var proteinList = [];
            var datesList = [];

            for(var i = 0; i < $scope.weeklyNutritionPlanList.length; i++){
                var dayItem = $scope.weeklyNutritionPlanList[i];

                var dayDate = dayItem.planDateYear + '-' + (dayItem.planDateMonth + 1) + '-' + dayItem.planDateDay;

                proteinList.push(parseInt(dayItem.totalPlanProteinAsPercent));
                carbsList.push(parseInt(dayItem.totalPlanCarbsAsPercent));
                fatList.push(parseInt(dayItem.totalPlanFatAsPercent));
                datesList.push(dayDate);
            }

            var config = {};
            config.bindto = '#weeklyMacrosChart';
            config.data = {};
            config.data.json = {};
            config.data.json.Protein = proteinList;
            config.data.json.Carbs = carbsList;
            config.data.json.Fat = fatList;
            config.axis = {
                "x":
                {
                    type: 'category',
                    categories: datesList
                },
                "y":
                {
                    "label":
                    {
                        "text":"",
                        "position":"outer-middle"
                    }
                }
            };
            config.data.types={"Protein":"line", "Carbs": "line", "Fat": "line"};
            config.size = {width: 450, height: 220};
            $scope.chart = c3.generate(config);
        };

        //TODO: move into service
//        $scope.calculateDeficit = function(nutritionPlan, activityPlan){
//            if(nutritionPlan) {
//                var caloriesOut = additionalCaloriesExpended + $scope.bmr;
//
//                if (activityPlan){
//                    caloriesOut += activityPlan.totalCaloriesBurned;
//
//                }
//
//                var caloriesIn = nutritionPlan.totalPlanCalories;
//
//                return -(caloriesIn - caloriesOut);
//            }
//        };

        //TODO: move into service
        var doMealTotaling = function(meal){
            var carbsTotal = 0, fatTotal = 0, proteinTotal = 0, caloriesTotal = 0, sodiumTotal = 0;

            for(var i = 0; i < meal.foods.length; i++){
                var foodCarbs = meal.foods[i].carbohydrates;

                carbsTotal += foodCarbs;
                fatTotal += meal.foods[i].fat;
                proteinTotal += meal.foods[i].protein;
                caloriesTotal += meal.foods[i].calories;
                sodiumTotal += meal.foods[i].sodium;
            }

            meal.totalCarbohydrates = carbsTotal;
            meal.totalProtein = proteinTotal;
            meal.totalCalories = caloriesTotal;
            meal.totalFat = fatTotal;
            meal.totalSodium = sodiumTotal;
        };

        //TODO: move into service
        var calculatePlanTotalMacros = function(plan){
            var carbsTotal = 0, fatTotal = 0, proteinTotal = 0, caloriesTotal = 0;

            for (var i = 0; i < plan.meals.length; i++){
                carbsTotal += plan.meals[i].totalCarbohydrates;
                fatTotal += plan.meals[i].totalFat;
                proteinTotal += plan.meals[i].totalProtein;
                caloriesTotal += plan.meals[i].totalCalories;
            }

            plan.totalPlanCarbs = carbsTotal;
            plan.totalPlanFat = fatTotal;
            plan.totalPlanProtein = proteinTotal;
            plan.totalPlanCalories = caloriesTotal;

            //calculate totals as percent
            var macroTotals = carbsTotal + fatTotal + proteinTotal;
            plan.totalPlanCarbsAsPercent = (carbsTotal / macroTotals) * 100;
            plan.totalPlanFatAsPercent = (fatTotal / macroTotals) * 100;
            plan.totalPlanProteinAsPercent = (proteinTotal / macroTotals) * 100;
        };

        //BMR for Men = 66 + (13.8 x weight in kg.) + (5 x height in cm) - (6.8 x age in years)
        //BMR for Women = 655 + (9.6 x weight in kg.) + (1.8 x height in cm) - (4.7 x age in years).
//        var calculateBmr = function(){
//            var age = $scope.nutritionProfile.age;
//            var weightInLbs = $scope.nutritionProfile.weight;
//            var heightFeet = $scope.nutritionProfile.heightFeet;
//            var heightInches = $scope.nutritionProfile.heightInches;
//            var totalHeight = (heightFeet * 12) + heightInches;
//            var gender = $scope.nutritionProfile.sex;
//
//            //convert weight from lbs to kg:
//            // kg = (weight in lbs) * .454
//            var weightInKg = weightInLbs * .454;
//
//            //convert height from inches to cms
//            //height in cms = (height in inches * 2.54)
//            var heightInCms = totalHeight * 2.54
//
//            var bmr = 0;
//
//            //BMR for Men = 66.47 + (13.75 x weight in kg.) + (5 x height in cm) - (6.75 x age in years)
//            if(gender == "Male"){
//                bmr = 66.47 + (13.75 * weightInKg) + (5 * heightInCms) - (6.75 * age);
//            }
//            //BMR for Women = 655 + (9.6 x weight in kg.) + (1.8 x height in cm) - (4.7 x age in years).
//            else{
//                bmr = 655.09 + (9.56 * weightInKg) + (1.84 * heightInCms) - (4.67 * age);
//            }
//
//            return bmr;
//        };




	}


]);

