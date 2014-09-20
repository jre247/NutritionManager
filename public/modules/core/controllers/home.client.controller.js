'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Activities', 'CoreService', 'NutritionProfile', '$interval',
	function($scope, Authentication, Activities, CoreService, NutritionProfile, $interval) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        window.scope = $scope;

        var additionalCaloriesExpended = 300;
        $scope.activityPlan = null;
        $scope.nutritionPlan = null;

        $scope.nutritionProfile = NutritionProfile.get(function () {
            $scope.bmr = calculateBmr();

            $scope.getDailyDashboardData();

            $scope.getWeeklyDashboardData();
        });

        $scope.weeklyDashboardView = 'charts';

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

        var todaysDate = (new Date()).toUTCString();
        var dt = new Date(todaysDate);
        var year = dt.getFullYear();
        var month = dt.getMonth();
        var day = dt.getDate();

        var planDate = month + '_' + day + '_' + year;

        $scope.activityTypesDictionary = [];
        for(var i = 0; i < $scope.activityTypes.length; i++) {
            var activityTypeDictModel = {
                name: $scope.activityTypes[i].name,
                type: $scope.activityTypes[i].type
            };

            $scope.activityTypesDictionary.push(activityTypeDictModel);
        }

        $scope.getWeeklyDashboardData = function(){
            var dWeeklyPlanDate = new Date();
            var dayOfWeek = dWeeklyPlanDate.getDay();

            var year = dWeeklyPlanDate.getFullYear();
            var month = dWeeklyPlanDate.getMonth();
            var day = dWeeklyPlanDate.getDate();

            day = day - dayOfWeek;

            var startWeeklyDt = new Date((new Date(year, month, day)).toUTCString());
            var startWeeklyYear = startWeeklyDt.getFullYear();
            var startWeeklyMonth = startWeeklyDt.getMonth();
            var startWeeklyDay = startWeeklyDt.getDate();

            var fullWeeklyDate = startWeeklyMonth + '_' + startWeeklyDay + '_' + startWeeklyYear;

            CoreService.getWeeklyDashboardData(fullWeeklyDate).then(function(data){
                if (data.weeklyNutritionPlan !== 'null'){

                    var weeklyNutritionPlanList = [];

                    var weeklyNutritionPlan = data.weeklyNutritionPlan;

                    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

                    var macrosForDaysArray = [];
                    var weeklyProteinTotal = 0;
                    var weeklyCarbsTotal = 0;
                    var weeklyFatTotal = 0;
                    var weeklyCaloriesTotal = 0;
                    var weeklyDeficitTotal = 0;

                    for(var i = 0; i < weeklyNutritionPlan.length; i++){
                        var planDateInfo = weeklyNutritionPlan[i];
                        var dPlanDate = new Date(planDateInfo.planDateYear, planDateInfo.planDateMonth, planDateInfo.planDateDay);
                        var planDateDayOfWeek = days[dPlanDate.getDay()];
                        var nDayOfWeek = dPlanDate.getDay();

                        for (var nMeal = 0; nMeal < planDateInfo.meals.length; nMeal++){
                            doMealTotaling(planDateInfo.meals[nMeal]);
                        }

                        calculatePlanTotalMacros(planDateInfo);

                        var macroModel = {
                            protein: planDateInfo.totalPlanProteinAsPercent,
                            carbs: planDateInfo.totalPlanCarbsAsPercent,
                            fat: planDateInfo.totalPlanFatAsPercent,
                            calories: planDateInfo.totalPlanCalories,
                            deficit: planDateInfo.deficit
                        };

                        macrosForDaysArray.push(macroModel);

                        if(planDateInfo.deficit === 0) {
                            planDateInfo.deficit = $scope.calculateDeficit(planDateInfo, data.activityPlan)
                        }

                        var weeklyPlanModel = {
                            dayOfWeek: planDateDayOfWeek,
                            dateDay: planDateInfo.planDateDay,
                            dateMonth: planDateInfo.planDateMonth,
                            dateYear: planDateInfo.planDateYear,
                            nDayOfWeek:nDayOfWeek,
                            totalCalories: planDateInfo.totalPlanCalories,
                            totalProtein: planDateInfo.totalPlanProteinAsPercent,
                            totalCarbs: planDateInfo.totalPlanCarbsAsPercent,
                            totalFat: planDateInfo.totalPlanFatAsPercent,
                            deficit: planDateInfo.deficit
                        };



                        weeklyNutritionPlanList.push(weeklyPlanModel);
                    }

                    for(var i = 0; i < macrosForDaysArray.length; i++){
                        weeklyProteinTotal += macrosForDaysArray[i].protein;
                        weeklyCarbsTotal += macrosForDaysArray[i].carbs;
                        weeklyFatTotal += macrosForDaysArray[i].fat;
                        weeklyCaloriesTotal += macrosForDaysArray[i].calories;
                        weeklyDeficitTotal += macrosForDaysArray[i].deficit;
                    }

                    $scope.weeklyProteinAverage = weeklyProteinTotal / macrosForDaysArray.length;
                    $scope.weeklyCarbsAverage = weeklyCarbsTotal / macrosForDaysArray.length;
                    $scope.weeklyFatAverage = weeklyFatTotal / macrosForDaysArray.length;
                    $scope.weeklyCaloriesAverage = weeklyCaloriesTotal / macrosForDaysArray.length;
                    $scope.weeklyDeficitAverage = weeklyDeficitTotal / macrosForDaysArray.length;

                    $scope.weeklyNutritionPlanList = weeklyNutritionPlanList;

                    $scope.weeklyNutritionPlanList.sort(function compare(a,b) {
                        if (a.nDayOfWeek < b.nDayOfWeek)
                            return -1;
                        if (a.nDayOfWeek > b.nDayOfWeek)
                            return 1;
                        return 0;
                    });

                    //$scope.weeklyMacrosDatapoints = getWeeklyMacrosChartData();
                    //$scope.weeklyCaloriesDatapoints = getWeeklyCaloriesChartData();
                    getWeeklyMacrosChartData();

                    showWeeklyCaloriesDeficitChart();

                    showAverageWeeklyMacrosChart();

                }

            });
        };

        $scope.getDailyDashboardData = function() {
            CoreService.getDailyDashboardData(planDate).then(function(data){
                if (data.nutritionPlan !== 'null'){
                    var plan = data.nutritionPlan;
                   for (var nMeal = 0; nMeal < plan.meals.length; nMeal++){
                        doMealTotaling(plan.meals[nMeal]);
                   }

                   calculatePlanTotalMacros(plan);

                   $scope.nutritionPlan = plan;

                  // $scope.bmr = calculateBmr();
                }

                if(data.activityPlan !== 'null'){
                    $scope.activityPlan = data.activityPlan;
                    $scope.totalCaloriesBurned = $scope.activityPlan.totalCaloriesBurned + additionalCaloriesExpended;
                }
                else{
                    $scope.totalCaloriesBurned = additionalCaloriesExpended;
                }




                showDailyMacrosChart();


            });
        };

        var showWeeklyCaloriesDeficitChart = function() {
            var caloriesList = [];
            var deficitList = [];
            var datesList = [];

            for(var i = 0; i < $scope.weeklyNutritionPlanList.length; i++){
                var dayItem = $scope.weeklyNutritionPlanList[i];

                var dayDate = dayItem.dateYear + '-' + dayItem.dateMonth + '-' + dayItem.dateDay;

                caloriesList.push(dayItem.totalCalories);
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

        var showDailyMacrosChart = function() {
            var config = {};
            config.bindto = '#dailyMacrosChart';
            config.data = {};
            config.data.json = {};
            config.data.json.protein = parseInt($scope.nutritionPlan.totalPlanProteinAsPercent);
            config.data.json.carbs = parseInt($scope.nutritionPlan.totalPlanCarbsAsPercent);
            config.data.json.fat = parseInt($scope.nutritionPlan.totalPlanFatAsPercent);
            config.axis = {"y":{"label":{"text":"Daily Macros","position":"outer-middle"}}};
            config.data.types={"protein":"pie", "carbs": "pie", "fat": "pie"};
            config.size = {width: 220, height: 220};
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

                var dayDate = dayItem.dateYear + '-' + dayItem.dateMonth + '-' + dayItem.dateDay;

                proteinList.push(parseInt(dayItem.totalProtein));
                carbsList.push(parseInt(dayItem.totalCarbs));
                fatList.push(parseInt(dayItem.totalFat));
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

        $scope.calculateDeficit = function(nutritionPlan, activityPlan){
            if(nutritionPlan) {
                var caloriesOut = additionalCaloriesExpended + $scope.bmr;

                if (activityPlan){
                    caloriesOut += activityPlan.totalCaloriesBurned;

                }

                var caloriesIn = nutritionPlan.totalPlanCalories;

                return -(caloriesIn - caloriesOut);
            }
        };

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
        var calculateBmr = function(){
            var age = $scope.nutritionProfile.age;
            var weightInLbs = $scope.nutritionProfile.weight;
            var heightFeet = $scope.nutritionProfile.heightFeet;
            var heightInches = $scope.nutritionProfile.heightInches;
            var totalHeight = (heightFeet * 12) + heightInches;
            var gender = $scope.nutritionProfile.sex;

            //convert weight from lbs to kg:
            // kg = (weight in lbs) * .454
            var weightInKg = weightInLbs * .454;

            //convert height from inches to cms
            //height in cms = (height in inches * 2.54)
            var heightInCms = totalHeight * 2.54

            var bmr = 0;

            //BMR for Men = 66.47 + (13.75 x weight in kg.) + (5 x height in cm) - (6.75 x age in years)
            if(gender == "Male"){
                bmr = 66.47 + (13.75 * weightInKg) + (5 * heightInCms) - (6.75 * age);
            }
            //BMR for Women = 655 + (9.6 x weight in kg.) + (1.8 x height in cm) - (4.7 x age in years).
            else{
                bmr = 655.09 + (9.56 * weightInKg) + (1.84 * heightInCms) - (4.67 * age);
            }

            return bmr;
        };




	}


]);

