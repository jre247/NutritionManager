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

        $scope.authentication = Authentication;
        $scope.meals = [];

        $scope.allFoods = Foods.query();
        $scope.allFoodsInitial = [];

        $scope.nutritionProfile = NutritionProfile.get();

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
            var planDateAsString = new Date($scope.plan.planDateNonUtc).toUTCString();
            var planDate = new Date(planDateAsString);
            var planDateYear = planDate.getFullYear();
            var planDateMonth = planDate.getMonth();
            var planDateDay = planDate.getDate();

			var plan = new Plans({
				//planDate: planDateAsString,
                planDateForDB: planDateAsString,
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                notes: $scope.plan.notes,
                planDateAsMili: planDate.getTime(),
                planDateAsConcat: parseInt(planDate.getFullYear() + '' + (planDate.getMonth() < 10 ? '0' + planDate.getMonth() : planDate.getMonth()) + '' + (planDate.getDate() < 10 ? '0' + planDate.getDate() : planDate.getDate())),
                meals: $scope.plan.meals
			});
            plan.$save(function(response) {
                plan.planDateNonUtc = new Date(response.planDateNonUtc);
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
            var planDateYear = planDate.getFullYear();
            var planDateMonth = planDate.getMonth();
            var planDateDay = planDate.getDate();

            var plan = new Plans({
                planDateForDB: planCopyModel.planDate,
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

        $scope.createMeal = function(){
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

            scrollToBottom();

            $scope.createFoodWithDialog(meal, null, true);
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



        $scope.createFood = function(meal){
            var defaultFood = $scope.allFoods[0];

           // var selectedFood = $scope.allFoods[0];
            //selectedFood.foodId = defaultFood.foodId;

//            var model = {
//                name: defaultFood.name,
//                type: defaultFood.type,
//                servings: 1,
//                calories: defaultFood.calories,
//                grams: defaultFood.grams,
//                protein: defaultFood.protein,
//                carbohydrates: defaultFood.carbohydrates,
//                fat: defaultFood.fat,
//                sodium: defaultFood.sodium,
//                fiber: defaultFood.fiber,
//                transfat: defaultFood.transfat,
//                saturatedFat: defaultFood.saturatedFat,
//                sugar: defaultFood.sugar,
//                cholesterol: defaultFood.cholesterol,
//                vitaminA: defaultFood.vitaminA,
//                vitaminC: defaultFood.vitaminC,
//                calcium: defaultFood.calcium,
//                iron: defaultFood.iron,
//                foodId: defaultFood.foodId,
//                selectedFood: $scope.allFoods[0],
//                isEditable: true
//            };
            var selectedFood = {
                _id: defaultFood.foodId,
                name: '',
                calories: 0,
                servings: 0,
                grams: 0,
                carbohydrates: 0,
                protein: 0,
                fat: 0,
                sodium: 0
            };

            var model = {
                foodId: defaultFood.foodId,
                selectedFood: selectedFood,
                name: '',
                calories: 0,
                servings: 0,
                grams: 0,
                carbohydrates: 0,
                protein: 0,
                fat: 0,
                sodium: 0,
                isEditable: true
            };

            meal.foods.push(model);

            //foodServingsChange()
            //CoreUtilities.doMealTotaling(meal);
            //CoreUtilities.calculatePlanTotalMacros($scope.plan);

            //calculate changed deficit
            //$scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);
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

            var planDateAsString = new Date($scope.plan.planDateNonUtc).toUTCString();
            var planDate = new Date(planDateAsString);
            var planDateYear = planDate.getFullYear();
            var planDateMonth = planDate.getMonth();
            var planDateDay = planDate.getDate();

            plan.planDateYear = planDateYear;
            plan.planDateMonth = planDateMonth;
            plan.planDateDay = planDateDay;
            plan.planDateAsMili = planDate.getTime();
            plan.planDateAsConcat = parseInt(planDate.getFullYear() + '' + (planDate.getMonth() < 10 ? '0' + planDate.getMonth() : planDate.getMonth()) + '' + (planDate.getDate() < 10 ? '0' + planDate.getDate() : planDate.getDate()));

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
                $scope.plan =  {data: null, meals: null, notes: null, planDate: new Date(), planDateNonUtc: new Date() };
                $scope.plan.meals = [];

                //todo use ngRouter instead of this horrible method for extracting url param
                setPlanDateFromUrlParam();

                $scope.allFoods = Foods.query(function(){
                    window.setTimeout(function(){
                        $scope.createMeal();
                    }, 400);

                });

                fillActivityPlan();
            }


		};

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
        $scope.orderByField = 'planDateAsMili';
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

            for(i = 0; i < 5; i++){
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
                    controller: ModalInstanceCtrl,
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
                controller: SuggestionsModalInstanceCtrl,
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
                controller: CreateFoodModalInstanceCtrl,

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
                    }
                }
            });

            modalInstance.result.then(function (selected) {
                meal.isEditable = false;
                var food = selected.foodToAdd;
                var isUpdate = selected.isUpdate;
                food.servings = selected.servings;

                food.isEditable = false;

                if(isUpdate) {
                    if(selected.oldFood._id !== food._id) {
                        food.selectedFood = {
                            _id: food._id,
                            name: food.name,
                            calories: food.calories,
                            carbohydrates: food.carbohydrates,
                            protein: food.protein,
                            fat: food.fat,
                            sodium: food.sodium,
                            grams: food.grams,
                            cholesterol: food.cholesterol,
                            saturatedFat: food.saturatedFat,
                            sugar: food.sugar,
                            fiber: food.fiber
                        };
                    }

                    for(var m = 0; m < meal.foods.length; m++){
                        if (meal.foods[m]._id === selected.oldFood._id){
                            meal.foods[m] = food;
                            break;
                        }
                    }
                }
                else {
                    food.selectedFood = {
                        _id: food._id,
                        name: food.name,
                        calories: food.calories,
                        carbohydrates: food.carbohydrates,
                        protein: food.protein,
                        fat: food.fat,
                        sodium: food.sodium,
                        grams: food.grams,
                        cholesterol: food.cholesterol,
                        saturatedFat: food.saturatedFat,
                        sugar: food.sugar,
                        fiber: food.fiber
                    };

                    meal.foods.push(food);
                }

                $scope.foodServingsChange(food, meal);

                if(isCreateMeal) {
                    meal.type = selected.mealType;
                    scrollToBottom();
                }

                //if(isMobileDevice){
                    $scope.savePlan(true);
                //}
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openNotesDialog = function (notes) {
            var modalInstance = $modal.open({
                templateUrl: 'notesModalContent.html',
                controller: NotesModalInstanceCtrl,

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


var CreateFoodModalInstanceCtrl = function ($scope, $modalInstance, parentScope, meal, food, CoreUtilities, isCreateMeal, mealTypes) {
    $scope.foodToAdd = food;
    $scope.parentScope = parentScope;
    $scope.meal = meal;
    $scope.isUpdate = food !== 'undefined' && food !== null && food !== 'null' && food !== undefined;
    $scope.servings = 1;
    window.scope = $scope;
    $scope.showFoodDetails = $scope.isUpdate ? true : false;
    $scope.foods = [];
    $scope.foodSearchTxt = null;
    $scope.CoreUtilities = CoreUtilities;
    $scope.skipFoods = 0;
    $scope.findFoodsByFirstLetter = false;
    $scope.mealTypes = mealTypes;
    $scope.showCreateMealSection = isCreateMeal;


    if($scope.foodToAdd) {
        $scope.caloriesDisplay = $scope.foodToAdd.selectedFood ? $scope.foodToAdd.selectedFood.calories : $scope.foodToAdd.calories;
    }

    $scope.nextFoods = function(){
        $scope.skipFoods += 8;

        $scope.updateFoodList();
    };

    $scope.prevFoods = function(){
        $scope.skipFoods -= 8;

        $scope.updateFoodList();
    };

    $scope.clearFoodInput = function(){
        $scope.selected.foodSearchTxt = '';
        $scope.foodInputChange();
    };

    $scope.selected = {
        showFoodDetails: $scope.showFoodDetails,
        foodToAdd: $scope.foodToAdd,
        oldFood: food,
        isUpdate: $scope.isUpdate,
        servings: $scope.servings,
        foodSearchTxt: $scope.foodSearchTxt,

        caloriesDisplay: $scope.caloriesDisplay,
        proteinDisplay: $scope.proteinDisplay,
        fatDisplay: $scope.fatDisplay,
        carbsDisplay: $scope.carbsDisplay,
        gramsDisplay: $scope.gramsDisplay,
        sodiumDisplay: $scope.sodiumDisplay,
        fiberDisplay: $scope.fiberDisplay,
        cholesterolDisplay: $scope.cholesterolDisplay,
        sugarDisplay: $scope.sugarDisplay,
        saturatedFat: $scope.saturatedFat,

        mealTypes: $scope.mealTypes


    };

    $scope.changeFood = function(){
        $scope.showFoodDetails = false;
        $scope.findFoodsByFirstLetter = false;
    };

    CoreUtilities.getFoods('null').then(function(data){
        $scope.foods = data;
    });

    $scope.calculateCaloriesDisplay = function(){
        var caloriesDisplay = 0, proteinDisplay = 0, fatDisplay = 0, sodiumDisplay = 0, gramsDisplay = 0,
            carbsDisplay = 0, saturatedFatDisplay = 0, cholesterolDisplay = 0, fiberDisplay = 0, sugarDisplay = 0;

        if($scope.selected.foodToAdd && $scope.selected.servings > 0) {

            caloriesDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.calories : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.calories;
            proteinDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.protein : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.protein;
            fatDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.fat : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.fat;
            sodiumDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.sodium : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.sodium;
            gramsDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.grams : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.grams;
            carbsDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.carbohydrates : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.carbohydrates;
            saturatedFatDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.saturatedFat : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.saturatedFat;
            cholesterolDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.cholesterol : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.cholesterol;
            sodiumDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.sodium : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.sodium;
            fiberDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.fiber : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.fiber;
            sugarDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.sugar : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.sugar;

        }

        $scope.selected.caloriesDisplay = caloriesDisplay % 1 != 0 ? caloriesDisplay.toFixed(1) : caloriesDisplay;
        $scope.selected.proteinDisplay = proteinDisplay % 1 != 0 ? proteinDisplay.toFixed(1) : proteinDisplay;
        $scope.selected.fatDisplay = fatDisplay % 1 != 0 ? fatDisplay.toFixed(1) : fatDisplay;
        $scope.selected.sodiumDisplay = sodiumDisplay % 1 != 0 ? sodiumDisplay.toFixed(1) : sodiumDisplay;
        $scope.selected.gramsDisplay = gramsDisplay % 1 != 0 ? gramsDisplay.toFixed(1) : gramsDisplay;
        $scope.selected.carbsDisplay = carbsDisplay % 1 != 0 ? carbsDisplay.toFixed(1) : carbsDisplay;
        $scope.selected.saturatedFatDisplay = saturatedFatDisplay % 1 != 0 ? saturatedFatDisplay.toFixed(1) : saturatedFatDisplay;
        $scope.selected.cholesterolDisplay = cholesterolDisplay % 1 != 0 ? cholesterolDisplay.toFixed(1) : cholesterolDisplay;
        $scope.selected.sodiumDisplay = sodiumDisplay % 1 != 0 ? sodiumDisplay.toFixed(1) : sodiumDisplay;
        $scope.selected.fiberDisplay = fiberDisplay % 1 != 0 ? fiberDisplay.toFixed(1) : fiberDisplay;
        $scope.selected.sugarDisplay = sugarDisplay % 1 != 0 ? sugarDisplay.toFixed(1) : sugarDisplay;
    };

    $scope.foodSelectionChange = function(food){
        $scope.selected.foodToAdd = food;
        $scope.showFoodDetails = true;

        $scope.skipFoods = 0;
        $scope.findFoodsByFirstLetter = false;

        $scope.calculateCaloriesDisplay();

        showMacrosChart();
    };

    $scope.foodInputChange = function(){
        $scope.skipFoods = 0;
        $scope.findFoodsByFirstLetter = false;

        $scope.updateFoodList();
    };

    $scope.updateFoodList = function(){
        if($scope.findFoodsByFirstLetter){
            $scope.findFoodsByLetter();
        }
        else {
            var foodSearchTxt = $scope.selected.foodSearchTxt;
            //$scope.calculateCaloriesDisplay();
            if (!foodSearchTxt) {
                foodSearchTxt = 'null';
            }

            CoreUtilities.getFoods(foodSearchTxt, $scope.skipFoods).then(function (data) {
                $scope.foods = data;
            });
        }
    };

    $scope.findFoodsByLetter = function(letter){
       //
        $scope.findFoodsByFirstLetter = true;


        if(letter){
            $scope.selected.foodSearchTxt = letter;
            $scope.skipFoods = 0;
        }

        CoreUtilities.getFoods($scope.selected.foodSearchTxt, $scope.skipFoods, true).then(function(data){
            $scope.foods = data;
        });
    };


    $scope.servingsChange = function(){
        $scope.calculateCaloriesDisplay();
    };

    if($scope.isUpdate){
        $scope.selected.servings = food.servings;

        $scope.calculateCaloriesDisplay();

    };



    $scope.ok = function () {
        $modalInstance.close($scope.selected);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    var showMacrosChart = function() {
        var config = {};
        config.bindto = "#foodMacrosChart";
        config.data = {};
        config.data.json = {};
        config.data.json.Protein = parseInt($scope.selected.proteinDisplay);
        config.data.json.Carbs = parseInt($scope.selected.carbsDisplay);
        config.data.json.Fat = parseInt($scope.selected.fatDisplay);
        config.axis = {"y":{"label":{"text":"Macros","position":"outer-middle"}}};
        config.data.types={"Protein":"pie", "Carbs": "pie", "Fat": "pie"};
        config.size = {width: 217, height: 214};
        $scope.chart = c3.generate(config);
    };

    if(!isCreateMeal && food) {
        window.setTimeout(function () {
            showMacrosChart()
        }, 100);
    }
};

var NotesModalInstanceCtrl = function ($scope, $modalInstance, parentScope, planNotes) {
    $scope.notesToSave = null;
    $scope.parentScope = parentScope;
    $scope.notesToSave = planNotes;

    $scope.selected = {
        notesToSave: $scope.notesToSave
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.notesToSave);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};


var ModalInstanceCtrl = function ($scope, $modalInstance, parentScope, dialogMealsDetailed, dialogMealsShort) {
    $scope.selectedMealTypes = dialogMealsDetailed[0];
    $scope.dialogMealsDetailed = dialogMealsDetailed;
    $scope.dialogMealsShort = dialogMealsShort;
    $scope.copyPlanDate = new Date();
    $scope.parentScope = parentScope;

    var selectedMealsDefault = [];
    for(var i = 0; i < $scope.dialogMealsShort.length; i++) {
        selectedMealsDefault.push($scope.dialogMealsShort[i].id);
    }
    $scope.selectedMealsDefault = selectedMealsDefault;

    $scope.dialogOpenCopyPlanDate = function($event, datepicker) {

        //if (!$scope[datepicker]) {
            $event.preventDefault();
            $event.stopPropagation();
       // }

        $scope.parentScope.opened = false;
        $scope[datepicker] = false;

        $scope[datepicker] = true;
    };

    $scope.copyPlanDateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.initDate = new Date('2016-15-20');


    $scope.copyPlanDateChange = function(){
      alert("changed!");
    };

    $scope.selected = {
        meals: $scope.selectedMealsDefault,
        planDate: $scope.copyPlanDate
    };

    $scope.selectAllMeals = function(){
        for (var i = 0; i < dialogMealsShort.length; i++){
            var isFound = false;

            for(var j = 0; j < $scope.selected.meals.length; j++){
                if ($scope.selected.meals[j] === dialogMealsShort[i].id){
                    isFound = true;
                    break;
                }
            }

            if(!isFound) {
                $scope.selected.meals.push(dialogMealsShort[i].id);
            }
        }

       // $scope.selected.meals = dialogMealsShort;
    };

    $scope.ok = function () {
        var selectedMeals = $scope.selected.meals;

        if (typeof selectedMeals[0] === "string"){
            var selectedMealsDetailed = [];

            for (var i = 0; i < selectedMeals.length; i++){
                for (var j = 0; j < dialogMealsDetailed.length; j++) {
                    if (selectedMeals[i] === dialogMealsDetailed[j]._id) {
                        selectedMealsDetailed.push(dialogMealsDetailed[j]);
                    }
                }
            }

            $scope.selected.meals = selectedMealsDetailed;
        }

        $modalInstance.close($scope.selected);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

var SuggestionsModalInstanceCtrl = function ($scope, $modalInstance, parentScope, $timeout, suggestedFoods, mealForSuggestion, CoreUtilities) {
    $scope.parentScope = parentScope;
    $scope.suggestedFoods = suggestedFoods;
    $scope.mealForSuggestion = mealForSuggestion;
    $scope.selectedFood = $scope.suggestedFoods[0];
    $scope.CoreUtilities = CoreUtilities;



    $scope.selectedFoodClick = function(suggestedFood){
        $scope.selectedFood = suggestedFood;
    };

    $scope.ok = function () {
        $scope.selectedFood.IsSuggested = true;
        $scope.selectedFood.servings = 1;
        $scope.selectedFood.isEditable = false;
        $scope.selectedFood.foodId = $scope.selectedFood._id;

        for(var j = 0; j < $scope.parentScope.allFoods.length; j++){
            if($scope.parentScope.allFoods[j]._id === $scope.selectedFood.foodId){
                var newSelectedFood = $scope.parentScope.allFoods[j];

                $scope.selectedFood.selectedFood =
                {
                    calcium: newSelectedFood.calcium,
                    calories: newSelectedFood.calories,
                    carbohydrates: newSelectedFood.carbohydrates,
                    cholesterol: newSelectedFood.cholesterol,
                    fat: newSelectedFood.fat,
                    fiber: newSelectedFood.fiber,
                    foodId: newSelectedFood._id,
                    grams: newSelectedFood.grams,
                    iron: newSelectedFood.iron,
                    name: newSelectedFood.name,
                    protein: newSelectedFood.protein,
                    saturatedFat: newSelectedFood.saturatedFat,
                    sodium: newSelectedFood.sodium,
                    sugar: newSelectedFood.sugar,
                    transfat: newSelectedFood.transfat,
                    type: newSelectedFood.type,
                    vitaminA: newSelectedFood.vitaminA,
                    vitaminC: newSelectedFood.vitaminC
                };
            }
        }

        var isFoodFoundInMeal = false;

        for(var m = 0; m < mealForSuggestion.foods.length; m++){
            var foodId = mealForSuggestion.foods[m]._id;

            if(foodId === $scope.selectedFood._id){
                isFoodFoundInMeal = true;
                mealForSuggestion.foods[m].servings += 1;
                mealForSuggestion.foods[m].calories += mealForSuggestion.foods[m].calories;
                mealForSuggestion.foods[m].IsSuggested = true;

                $timeout(function(){mealForSuggestion.foods[m].IsSuggested = false;}, 4000);
                break;
            }
        }

        if(!isFoodFoundInMeal) {
            mealForSuggestion.foods.push($scope.selectedFood);
        }


        $timeout(function(){$scope.selectedFood.IsSuggested = false;}, 4000);

        $timeout(function(){$scope.parentScope.savePlan();}, 4000);

        $modalInstance.close(mealForSuggestion);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

