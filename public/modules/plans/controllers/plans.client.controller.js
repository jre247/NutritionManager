'use strict';

angular.module('plans').controller('PlansController', ['$scope', '$stateParams', '$location', '$timeout', 'Authentication', '$modal', '$log', 'Plans', 'Foods', 'NutritionProfile', 'Progress', 'PlansService', 'CoreUtilities',
	function($scope, $stateParams, $location, $timeout, Authentication, $modal, $log, Plans, Foods, NutritionProfile, Progress, PlansService, CoreUtilities) {
		window.scope = $scope;
        window.plans = $scope.plans;
        $scope.showPlanEditableErrorMsg = false;
        $scope.showTotalsAsPercent = true;
        $scope.isSortingEnabled = false;
        var sortingBtnTxtOptions = ['Enable Sorting', 'Disable Sorting'];
        $scope.sortingBtnTxt = sortingBtnTxtOptions[0];
        var isSortingEnabled = false;
        $scope.isLoading = false;

        $scope.currentDeficit = 0;
        $scope.authentication = Authentication;
        $scope.meals = [];

        //$scope.allFoods = Foods.query();
        //TODO: put this in server controller and attach to req obj
        CoreUtilities.getUserFoods(user._id, 'null', 0, false).then(function(data){
            $scope.allFoods = data;
        });

        $scope.allFoodsInitial = [];



        $scope.foodTypes = [
            {id: 1, type: 'Fruit'},
            {id: 2, type: 'Starch'},
            {id: 3, type: 'Meat'},
            {id: 4, type: 'Liquid'},
            {id: 5, type: 'Vegetable'},
            {id: 6, type: 'Dessert'},
            {id: 7, type: 'Yogurt'},
            {id: 8, type: 'Pizza'},
            {id: 9, type: 'Butter/Oil'},
            {id: 10, type: 'Tofu'},
            {id: 11, type: 'Beans'},
            {id: 12, type: 'Alcohol'},
            {id: 13, type: 'Nuts'}
        ];

        $scope.mealTypes = [
            {id: 1, name: 'Breakfast'},
            {id: 2, name: 'Lunch'},
            {id: 3, name: 'Dinner'},
            {id: 4, name: 'Snack'}
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

            $scope.plan.meals.splice(end, 0,
                $scope.plan.meals.splice(start, 1)[0]);

            $scope.$apply();
        };

        $scope.sortableOptions = {
            start: $scope.sortableStartCallback,
            update: $scope.sortableUpdateCallback
        };

		$scope.create = function() {
            var planDateAsString = new Date($scope.plan.planDateNonUtc);
            var planDate = new Date(planDateAsString);
//            var planSplit = planDate.toISOString().substr(0, 10).split('-');
//            var planDateYear = parseInt(planSplit[0]);
//            var planDateMonth = parseInt(planSplit[1]) - 1;
//            var planDateDay = parseInt(planSplit[2]);

            var planDateToSave = new Date($scope.plan.planDateNonUtc);
            var planDateYear = planDateToSave.getFullYear();
            var planDateMonth = planDateToSave.getMonth();
            var planDateDay = planDateToSave.getDate();

			var plan = new Plans({
				//planDate: planDateAsString,
                planDateForDB: planDateAsString,
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                notes: $scope.plan.notes,
                planDateAsMili: planDate.getTime(),
                planDateAsConcat: parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),
                meals: $scope.plan.meals
			});
            plan.$save(function(response) {
                plan.planDateNonUtc = new Date(response.planDateAsMili);
				$location.path('plans/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			$scope.plan.planDate = '';
            $scope.plan.meals = [];
		};



        $scope.copyPlan = function(planCopyModel){
            var planDateAsString = planCopyModel.planDate.toUTCString();
            var planDate = new Date(planDateAsString);
            var planSplit = planDate.toISOString().substr(0, 10).split('-');
            var planDateYear = parseInt(planSplit[0]);
            var planDateMonth = parseInt(planSplit[1]) - 1;
            var planDateDay = parseInt(planSplit[2]);

            var plan = new Plans({
                planDateForDB: planCopyModel.planDate,
                planDateAsConcat: parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                meals: planCopyModel.meals
            });
            plan.$save(function(response) {
                $location.path('plans/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.createMeal = function(createFoodByDefault, noScrollToBottom){
            var model = {
                name: '',
                type: 1,
                foods: [],
                totalCalories: 0,
                totalCarbohydrates: 0,
                totalFat: 0,
                totalProtein: 0,
                isEditable: true,
                isVisible: true
            };

            $timeout(function(){$scope.setSorting();}, 100);


            $scope.plan.meals.push(model);

            var meal = $scope.plan.meals[$scope.plan.meals.length - 1];

            if(!noScrollToBottom) {
                scrollToBottom();
            }

            if(createFoodByDefault) {
                $scope.createFoodWithDialog(meal, null, true);
            }
            //$scope.createFood(meal);

            //sortableEle.refresh();
        };

        var scrollToBottom = function(){
            $("html, body").animate({ scrollTop: $(document).height() }, 1000);
            $("#content").animate({ scrollTop: $('#content').height() + 700 }, 1000);
        };

        $scope.editMeal = function(meal){
            meal.isEditable = true;
            meal.isVisible = !meal.isVisible;
        };

        $scope.saveMeal = function(meal){
            meal.isEditable = false;
            meal.isVisible = !meal.isVisible;
        };



        $scope.deleteMeal = function(meal, isMobileDevice){
            if (confirm("Are you sure you want to delete this meal?")) {
                for (var i in $scope.plan.meals) {
                    if ($scope.plan.meals[i] === meal) {
                        $scope.plan.meals.splice(i, 1);
                    }
                }

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);

                if(isMobileDevice){
                    $scope.savePlan(true);
                }
            }
        };

        $scope.collapseAllMeals = function(plan){
            for(var i = 0; i < plan.meals.length; i++){
                var meal = plan.meals[i];
                meal.isVisible = false;
            }
        };

        $scope.saveFood = function(food){
            food.isEditable = false;
        };

        $scope.editFoodClick = function(food){
            for(var i = 0; i < $scope.plan.meals.length; i++){
                for(var j = 0; j < $scope.plan.meals[i].foods.length; j++){
                    $scope.plan.meals[i].foods[j].isEditable = false;
                }
            }

            food.isEditable = true;


            setSelectedFood(food);
        };

        var setSelectedFood = function(food){
            if (!food.selectedFood._id){
                for(var i = 0; i < $scope.allFoods.length; i++){
                    if (food.selectedFood.foodId === $scope.allFoods[i]._id){
                        food.selectedFood = $scope.allFoods[i];
                        break;
                    }
                }
            }
        };

        $scope.editFood = function(food){
            food.isEditable = true;

            setSelectedFood(food);
        };

        $scope.deleteFood = function(food, meal, isMobileDevice){
            if (confirm("Are you sure you want to delete this food?")) {
                for (var nMeal = 0; nMeal < $scope.plan.meals.length; nMeal++) {
                    if ($scope.plan.meals[nMeal] === meal) {
                        for (var nFood = 0; nFood < meal.foods.length; nFood++) {
                            if (meal.foods[nFood] === food) {
                                meal.foods.splice(nFood, 1);
                            }
                        }
                    }
                }

                CoreUtilities.doMealTotaling(meal);

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);

                if(isMobileDevice){
                    $scope.savePlan(true);
                }
            }

        };

		$scope.remove = function(plan) {
			if (plan) {
                plan.$remove();

				for (var i in $scope.plans) {
					if ($scope.plans[i] === plan) {
						$scope.plans.splice(i, 1);
					}
				}
			} else {
				$scope.plan.$remove(function() {
					$location.path('plans');
				});
			}
		};

        $scope.savePlan = function(){
          $scope.showPlanEditableErrorMsg = false;

          for(var i = 0; i < $scope.plan.meals.length; i++){
              var meal = $scope.plan.meals[i];

              meal.isEditable = false;

              for (var j = 0; j < meal.foods.length; j++){
                  var food = meal.foods[j];

                  food.isEditable = false;
              }
          }

          if (!$scope.plan._id){
              $scope.create();
          }
            else{
              $scope.update();
          }

            //callback();
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

//            var planDateAsString = new Date($scope.plan.planDateNonUtc).toUTCString();
//            var planDate = new Date(planDateAsString);
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

            plan.planDateYear = planDateYear;
            plan.planDateMonth = planDateMonth;
            plan.planDateDay = planDateDay;

            plan.planDateForDBAsDate = $scope.plan.planDateNonUtc;
            plan.planDateAsMili = planDate.getTime();
            plan.planDateAsConcat = parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),

            plan.$update(function() {
				//$location.path('plans/' + plan._id);
                for (var i = 0; i < $scope.plan.meals.length; i++){
                    for (var j = 0; j < $scope.plan.meals[i].foods.length; j++){
                        $scope.plan.meals[i].foods[j].name = $scope.plan.meals[i].foods[j].selectedFood.name;
                        $scope.plan.meals[i].foods[j].type = $scope.plan.meals[i].foods[j].selectedFood.type;
                        $scope.plan.meals[i].foods[j].foodId = $scope.plan.meals[i].foods[j].selectedFood.foodId;
                    }

                    CoreUtilities.doMealTotaling($scope.plan.meals[i]);
                }

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);

                $scope.success = true;
                $timeout(function () {
                    $scope.success = false;
                }, 2500);


                $timeout(function(){$scope.setSorting();}, 100);

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
            $scope.isLoading = true;

			$scope.plans = Plans.query(
                function(u, getResponseHeaders)
                {
                    for(var i = 0; i < $scope.plans.length; i++) {
                        for (var nMeal = 0; nMeal < $scope.plans[i].meals.length; nMeal++){
                            CoreUtilities.doMealTotaling($scope.plans[i].meals[nMeal]);
                        }

                        CoreUtilities.calculatePlanTotalMacros($scope.plans[i]);

                        var planModel = {
                            planDateNonUtc: $scope.plans[i].planDateNonUtc || $scope.plans[i].planDate,
                            planDateAsMili: $scope.plans[i].planDateAsMili,
                            planDateAsConcat: $scope.plans[i].planDateAsConcat,
                            calories: $scope.plans[i].totalPlanCalories,
                            protein: $scope.plans[i].totalPlanProtein,
                            carbs: $scope.plans[i].totalPlanCarbs,
                            fat: $scope.plans[i].totalPlanFat,
                            _id: $scope.plans[i]._id
                        };

                        $scope.plansCollection.push(planModel);
                    }

                    $scope.isLoading = false;

//                    $scope.plansCollection.sort(function compare(a,b) {
//                        if (a.planDateAsConcat < b.planDateAsConcat)
//                            return -1;
//                        if (a.planDateAsConcat > b.planDateAsConcat)
//                            return 1;
//                        return 0;
//                    });


                }
            );


		};

        var setCurrentDeficit = function(){
            var now = new Date(new Date($scope.plan.planDateNonUtc).toUTCString());
            var startDateFormatted = now.getFullYear() + '_' + now.getMonth() + '_' + now.getDate();
            var endDateFormatted = startDateFormatted;

            $scope.progress = Progress.get({
                    progressId: startDateFormatted
                },
                function(u)
                {
                    $scope.currentDeficit = u.deficit;
                }
            );
        };

		$scope.findOne = function() {
            $scope.nutritionProfile = NutritionProfile.get(function(){
                if ($stateParams.planId) {
                    $scope.plan = Plans.get({
                        planId: $stateParams.planId
                    }, function (u, getResponseHeaders) {
                        if (!$scope.plan.planDateNonUtc){
                            $scope.plan.planDateNonUtc = $scope.plan.planDate;
                        }

                        setCurrentDeficit();

                        $scope.isUserAdmin = $scope.plan.userRoles && $scope.plan.userRoles.indexOf('admin') !== -1 ? true : false;

                        setPlanMealsTotals();

                        fillActivityPlan();
                    });
                }
                else{
                    var now = new Date();
                    $scope.plan =  {data: null, meals: null, notes: null, planDate: new Date(), planDateNonUtc: now, planDateYear: now.getFullYear(), planDateMonth: now.getMonth(), planDateDay: now.getDate()  };
                    $scope.plan.meals = [];

                    $scope.plan.totalPlanCalories = 0;
                    $scope.plan.totalPlanCarbsAsPercent = 0;
                    $scope.plan.totalPlanFatAsPercent = 0;
                    $scope.plan.totalPlanProteinAsPercent = 0;

                    //todo use ngRouter instead of this horrible method for extracting url param
                    setPlanDateFromUrlParam();

                    createDefaultMealsTemplate();

                    fillActivityPlan();

                    $scope.plan.moveArrowImgLeft = false;
                }
            });


		};

        var createDefaultMealsTemplate = function(){
            //create meal template based on what user specified in their nutrition profile
            if($scope.nutritionProfile.templateMeals && $scope.nutritionProfile.templateMeals.length > 0){
                for(var t = 0; t < $scope.nutritionProfile.templateMeals.length; t++){
                    var templateMealItem = $scope.nutritionProfile.templateMeals[t];

                    $scope.createMeal(null, true);

                    $scope.plan.meals[t].isEditable = false;
                    $scope.plan.meals[t].type = $scope.mealTypes[templateMealItem.id - 1].id;
                }
            }
            //create breakfast, lunch, and dinner as default empty meals for plan
            else {
                $scope.createMeal(null, true);
                $scope.createMeal(null, true);
                $scope.createMeal(null, true);

                $scope.plan.meals[0].isEditable = false;
                $scope.plan.meals[1].type = $scope.mealTypes[1].id;
                $scope.plan.meals[1].isEditable = false;
                $scope.plan.meals[2].isEditable = false;
                $scope.plan.meals[2].type = $scope.mealTypes[2].id;
            }
        };

        var interval;
        $scope.$watch('plan.meals.length', function(){
            if($scope.plan && $scope.plan.meals) {
                if ($scope.plan.meals.length == 0) {

                    interval = window.setInterval(function () {
                        $scope.$apply(function(){
                            $scope.plan.moveArrowImgLeft = !$scope.plan.moveArrowImgLeft;
                        });

                    }, 500);


                }
                else {
                    clearInterval(interval);
                }
            }
        });

        var setPlanMealsTotals = function(){
            for (var i = 0; i < $scope.plan.meals.length; i++) {
                var carbsTotal = 0, proteinTotal = 0, caloriesTotal = 0, fatTotal = 0, sodiumTotal = 0;

                for (var j = 0; j < $scope.plan.meals[i].foods.length; j++) {
                    $scope.plan.meals[i].foods[j].name = $scope.plan.meals[i].foods[j].selectedFood.name;
                    $scope.plan.meals[i].foods[j].type = $scope.plan.meals[i].foods[j].selectedFood.type;
                    $scope.plan.meals[i].foods[j].foodId = $scope.plan.meals[i].foods[j].selectedFood.foodId;

                    var carbs = $scope.plan.meals[i].foods[j].carbohydrates;

                    carbsTotal += carbs;
                    sodiumTotal += $scope.plan.meals[i].foods[j].sodium;
                    proteinTotal += $scope.plan.meals[i].foods[j].protein;
                    fatTotal += $scope.plan.meals[i].foods[j].fat;
                    caloriesTotal += $scope.plan.meals[i].foods[j].calories;
                }

                $scope.plan.meals[i].totalCarbohydrates = carbsTotal;
                $scope.plan.meals[i].totalCalories = caloriesTotal;
                $scope.plan.meals[i].totalProtein = proteinTotal;
                $scope.plan.meals[i].totalFat = fatTotal;
                $scope.plan.meals[i].totalSodium = sodiumTotal;

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);
            }
        };

        var setPlanDateFromUrlParam = function(){
            var urlSplit = $location.path().split('/');
            if(urlSplit.length >= 3){
                var dateParam;

                if(urlSplit.length == 4) {
                    dateParam = urlSplit[3];
                }
                else{
                    dateParam = urlSplit[2];
                }

                if(dateParam.indexOf('_') !== -1){
                    var dateParamSplit = dateParam.split('_');

                    var dateDay = parseInt(dateParamSplit[1]);
                    var dateYear = parseInt(dateParamSplit[2]);
                    var dateMonth = parseInt(dateParamSplit[0]);

                    $scope.plan.planDate = new Date(dateYear, dateMonth, dateDay);
                    $scope.plan.planDateNonUtc = new Date(dateYear, dateMonth, dateDay);
                }
            }
        };

        var fillActivityPlan = function(){
            var planDate = new Date($scope.plan.planDateNonUtc);
            var year = planDate.getFullYear();
            var month = planDate.getMonth();
            var day = planDate.getDate();

            var planDateForDb =  month + '_' + day + '_' + year;

            PlansService.getActivityByDate(planDateForDb).then(function(data) {
                $scope.activityPlan = data;
            });

//            $scope.activityPlan = Activities.get({
//                activityDate: planDateForDb
//                ,dateRange: planDateForDb
//            }, function (u, getResponseHeaders) {
//                var test = 'test';
//
//            });
        };



        $scope.foodSelectionChange = function(food, meal){
            food.type = food.selectedFood.type;
            food.calories = food.servings * food.selectedFood.calories;
            food.fat = food.servings * food.selectedFood.fat;
            food.protein = food.servings * food.selectedFood.protein;
            food.carbohydrates = food.servings * food.selectedFood.carbohydrates;
            food.grams = food.servings * food.selectedFood.grams;
            food.sodium = food.servings * food.selectedFood.sodium;
            food.fiber = food.servings * food.selectedFood.fiber;
            food.sugar = food.servings * food.selectedFood.sugar;
            food.saturatedFat = food.servings * food.selectedFood.saturatedFat;
            food.vitaminA = food.servings * food.selectedFood.vitaminA;
            food.vitaminC = food.servings * food.selectedFood.vitaminC;
            food.calcium = food.servings * food.selectedFood.calcium;
            food.iron = food.servings * food.selectedFood.iron;
            food.transfat = food.servings * food.selectedFood.transfat;
            food.cholesterol = food.servings * food.selectedFood.cholesterol;
            food.name = food.selectedFood.name;
            food.selectedFood.foodId = food.selectedFood._id;
            food.type = food.selectedFood.type;

            food.servingDescription1 = food.selectedFood.servingDescription1;
            food.servingDescription2 = food.selectedFood.servingDescription2;
            food.servingGrams1 = food.selectedFood.servingGrams1;
            food.servingGrams2 = food.selectedFood.servingGrams2;
            food.servingType = food.selectedFood.servingType;

            food.foodId = food.selectedFood._id;

            CoreUtilities.doMealTotaling(meal);

            CoreUtilities.calculatePlanTotalMacros($scope.plan);

            //calculate changed deficit
            $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);
        };

        $scope.foodServingsChange = function(food, meal){

            if(food.servings !== "" && food.servings !== undefined && food.servings !== "undefined") {
                var servings = parseFloat(food.servings);

                food.calories = servings * food.selectedFood.calories;
                food.fat = servings * food.selectedFood.fat;
                food.protein = servings * food.selectedFood.protein;
                food.carbohydrates = servings * food.selectedFood.carbohydrates;
                food.sodium = servings * food.selectedFood.sodium;
                food.grams = servings * food.selectedFood.grams;

                CoreUtilities.doMealTotaling(meal);

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);
            }
        };

        $scope.toggleTotalsAsPercent = function(){
          $scope.showTotalsAsPercent = !$scope.showTotalsAsPercent;
        };

        $scope.toggleMealVisibility = function(meal){
            meal.isVisible = !meal.isVisible;
        };

        $scope.getMealTypeName = function(type){
            var mealTypeName;

            for (var i = 0; i < $scope.mealTypes.length; i++){
                var mealType = $scope.mealTypes[i];

                if (mealType.id == type){
                    mealTypeName = mealType.name;
                    break;
                }
            }

            return mealTypeName;
        };


        var checkIfPlanEditable = function(){
            var isPlanEditable = false;

            for(var i = 0; i < $scope.plan.meals.length; i++){
                for (var j = 0; j < $scope.plan.meals[i].foods.length; j++){
                    var planMeal = $scope.plan.meals[i];
                    var mealFood = planMeal.foods[j];

                    if (planMeal.isEditable || mealFood.isEditable){
                        isPlanEditable = true;
                        break;
                    }


                }
            }

            return isPlanEditable;
        };

        //sorting code
        // data
        $scope.orderByField = 'planDateAsConcat';
        $scope.reverseSort = true;
        scope.plansCollection = [];

        $scope.setSorting = function(){
            if (!isSortingEnabled){
                $('.panel-group').find('.panel-default').addClass('disabled');
                isSortingEnabled = false;
            }
        };

        var getSuggestedFoods = function(){
            var proteinTarget = $scope.nutritionProfile.proteinPercentageTarget;
            var carbsTarget = $scope.nutritionProfile.carbohydratesPercentageTarget;
            var fatTarget = $scope.nutritionProfile.fatPercentageTarget;
            var planTotalCalories = $scope.plan.totalPlanCalories;

            var currentDeficit = $scope.currentDeficit;
            var deficitTarget = $scope.nutritionProfile.deficitTarget;
            var currentCaloriesIn = $scope.plan.totalPlanCalories;

            var caloriesTarget = (currentDeficit - deficitTarget) + currentCaloriesIn;

            var suggestedFoodsAry = [];

            for (var i = 0; i < $scope.allFoods.length; i++) {
                var foodToCheck = $scope.allFoods[i];
                var score = 0;

                if(foodToCheck.type !== '12' &&
                  foodToCheck.type !== '6') {
                    var macrosTotal = ($scope.plan.totalPlanFat + foodToCheck.fat) +
                        ($scope.plan.totalPlanProtein + foodToCheck.protein) +
                        ($scope.plan.totalPlanCarbs + foodToCheck.carbohydrates);

                    var newProteinTarget = (($scope.plan.totalPlanProtein + foodToCheck.protein) / macrosTotal) * 100;
                    var newCarbsTarget = (($scope.plan.totalPlanCarbs + foodToCheck.carbohydrates) / macrosTotal) * 100;
                    var newFatTarget = (($scope.plan.totalPlanFat + foodToCheck.fat) / macrosTotal) * 100;
                    var newCaloriesTarget = planTotalCalories + foodToCheck.calories;

                    var caloriesTargetDiff = (caloriesTarget - newCaloriesTarget) / caloriesTarget;
                    var proteinTargetDiff = (proteinTarget - newProteinTarget) / proteinTarget;
                    var carbsTargetDiff = (carbsTarget - newCarbsTarget) / carbsTarget;
                    var fatTargetDiff = (fatTarget - newFatTarget) / fatTarget;

                    if (caloriesTargetDiff < 0) {
                        caloriesTargetDiff = -caloriesTargetDiff;
                    }
                    if (proteinTargetDiff < 0) {
                        proteinTargetDiff = -proteinTargetDiff;
                    }
                    if (carbsTargetDiff < 0) {
                        carbsTargetDiff = -carbsTargetDiff;
                    }
                    if (fatTargetDiff < 0) {
                        fatTargetDiff = -fatTargetDiff;
                    }

                    score = (caloriesTargetDiff * 3) + proteinTargetDiff + carbsTargetDiff + fatTargetDiff;

                    foodToCheck.score = score;

                    suggestedFoodsAry.push(foodToCheck);
                }
            }

            suggestedFoodsAry.sort(function compare(a,b) {
                if (a.score < b.score)
                    return -1;
                if (a.score > b.score)
                    return 1;
                return 0;
            });

            var suggestedFoodsTop5 = [];

            var length = suggestedFoodsAry.length > 5 ? 5 : suggestedFoodsAry.length;
            for(i = 0; i < length; i++){
                var suggestedFood = suggestedFoodsAry[i];

                suggestedFoodsTop5.push(suggestedFood);
            }

            return suggestedFoodsTop5;


        };


        //dialog code
        $scope.openCopyPlanDialog = function (size) {
            var isPlanEditable = checkIfPlanEditable();

            if (!isPlanEditable) {
                $scope.showPlanEditableErrorMsg = false;

                var modalInstance = $modal.open({
                    templateUrl: 'myModalContent.html',
                    controller: PlansService.ModalInstanceCtrl,
                    //size: size,
                    resolve: {
                        dialogMealsShort: function () {
                            var mealsAry = [];

                            for (var i = 0; i < $scope.plan.meals.length; i++) {
                                var mealModel = {};
                                mealModel.id = $scope.plan.meals[i]._id;
                                mealModel.selected = true;

                                var mealType = $scope.mealTypes[$scope.plan.meals[i].type - 1];

                                if (mealType && mealType.id >= 0) {
                                    mealModel.type = mealType.name;
                                }
                                else {
                                    mealModel.type = 'N/A';
                                }

                                mealsAry.push(mealModel);
                            }

                            return mealsAry;
                        },
                        dialogMealsDetailed: function () {
                            return $scope.plan.meals;
                        },
                        parentScope: function () {
                            return $scope;
                        }
                    }
                });

                modalInstance.result.then(function (planCopyModel) {
                    //$scope.dialogSelectedMealType = selectedItem;
                    $scope.copyPlan(planCopyModel);

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }
            else{
                $scope.showPlanEditableErrorMsg = true;
            }
        };

        $scope.openSuggestionsDialog = function (meal) {
            var modalInstance = $modal.open({
                templateUrl: 'suggestionsModalContent.html',
                controller: PlansService.SuggestionsModalInstanceCtrl,
                //size: size,
                resolve: {

                    suggestedFoods: function () {
                        //figure out which foods to add to suggested foods based on nutrition profile targets
                        return getSuggestedFoods();
                    },
                    mealForSuggestion: function(){
                        return meal;
                    },
                    parentScope: function () {
                        return $scope;
                    },
                    CoreUtilities: function(){
                        return CoreUtilities;
                    }
                }
            });

            modalInstance.result.then(function (mealForSuggestion) {
                //$scope.dialogSelectedMealType = selectedItem;
                // $scope.copyPlan(planCopyModel);
                meal = mealForSuggestion;

                CoreUtilities.doMealTotaling(meal);

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.createFoodWithDialog = function(meal, food, isCreateMeal, isMobileDevice){
            var modalInstance = $modal.open({
                templateUrl: 'createFoodModalContent.html',
                controller: PlansService.CreateFoodModalInstanceCtrl,

                resolve: {
                    parentScope: function () {
                        return $scope;
                    },
                    meal: function(){
                        return meal
                    },
                    food: function(){
                        return food;
                    },
                    CoreUtilities: function(){
                        return CoreUtilities;
                    },
                    isCreateMeal: function(){
                        return isCreateMeal;
                    },
                    mealTypes: function(){
                        return $scope.mealTypes;
                    },
                    userFoods: function(){
                        return $scope.allFoods;
                    }
                }
            });

            var checkIfIncrementingServings = function(meal, food){
                var isServingsUpdated = false;

                //check if just incrementing servings of food since list already has this food
                for(var m = 0; m < meal.foods.length; m++){
                    if (meal.foods[m]._id === food._id){
                        meal.foods[m].servings += meal.foods[m].servings;
                        isServingsUpdated = true;
                        break;
                    }
                }

                return isServingsUpdated;
            };

            var instantiateNewFood = function(foodDetails, servingType, servings){
                var food = {
                    _id: foodDetails._id,
                    name: foodDetails.name,
                    calories: foodDetails.calories,
                    carbohydrates: foodDetails.carbohydrates,
                    protein: foodDetails.protein,
                    fat: foodDetails.fat,
                    sodium: foodDetails.sodium,
                    grams: foodDetails.grams,
                    cholesterol: foodDetails.cholesterol,
                    saturatedFat: foodDetails.saturatedFat,
                    sugar: foodDetails.sugar,
                    fiber: foodDetails.fiber,
                    servingGrams2: foodDetails.servingGrams2,
                    servingGrams1: foodDetails.servingGrams1,
                    servingDescription1: foodDetails.servingDescription1,
                    servingDescription2: foodDetails.servingDescription2,
                    servingType: servingType,
                    servings: servings,
                    isEditable: false
                };

                return food;
            };

            modalInstance.result.then(function (selected) {
                meal.isEditable = false;
                var foodDetails = selected.foodToAdd;
                var isUpdate = selected.isUpdate;

                var food = instantiateNewFood(foodDetails, selected.servingType, selected.servings);

                var selectedFoodDefault = instantiateNewFood(foodDetails, selected.servingType, 1);

                food.selectedFood = foodDetails.selectedFood ? foodDetails.selectedFood : selectedFoodDefault;

                if(isUpdate) {
                    var isServingsUpdated = false;

                    if(selected.oldFood._id !== food._id){
                        isServingsUpdated = checkIfIncrementingServings(meal, food);
                    }

                    if(!isServingsUpdated) {
                        for (var m = 0; m < meal.foods.length; m++) {
                            if (meal.foods[m]._id === selected.oldFood._id) {
                                meal.foods[m] = food;
                                break;
                            }
                        }
                    }
                }
                else {
                    var isServingsUpdated = checkIfIncrementingServings(meal, food);

                    if(!isServingsUpdated) {
                        meal.foods.push(food);
                    }
                }

                $scope.foodServingsChange(food, meal);

                if(isCreateMeal) {
                    meal.type = selected.mealType;
                    scrollToBottom();
                }

                //if(isMobileDevice){
                    $scope.savePlan();
                //}
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openNotesDialog = function (notes) {
            var modalInstance = $modal.open({
                templateUrl: 'notesModalContent.html',
                controller: PlansService.NotesModalInstanceCtrl,

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
                $scope.savePlan();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
	}
]);

