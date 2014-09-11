'use strict';

angular.module('plans').controller('PlansController', ['$scope', '$stateParams', '$location', '$timeout', 'Authentication', '$modal', '$log', 'Plans', 'Foods', 'NutritionProfile',
	function($scope, $stateParams, $location, $timeout, Authentication, $modal, $log, Plans, Foods, NutritionProfile) {
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

        $scope.nutritionProfile = NutritionProfile.get();

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
			var plan = new Plans({
				planDate: $scope.plan.planDateNonUtc,
                meals: $scope.plan.meals
			});
            plan.$save(function(response) {
                plan.planDateNonUtc = response.planDateNonUtc;
				$location.path('plans/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			$scope.plan.planDate = '';
            $scope.plan.meals = [];
		};

        $scope.copyPlan = function(planCopyModel){
            var plan = new Plans({
                planDate: planCopyModel.planDate,
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

            $scope.createFood(meal);

            //sortableEle.refresh();
        };

        $scope.editMeal = function(meal){
            meal.isEditable = true;
            meal.isVisible = !meal.isVisible;
        };

        $scope.saveMeal = function(meal){
            meal.isEditable = false;
            meal.isVisible = !meal.isVisible;
        };



        $scope.deleteMeal = function(meal){
            if (confirm("Are you sure you want to delete this meal?")) {
                for (var i in $scope.plan.meals) {
                    if ($scope.plan.meals[i] === meal) {
                        $scope.plan.meals.splice(i, 1);
                    }
                }

                calculatePlanTotalMacros($scope.plan);
            }
        };

        $scope.createFood = function(meal){
            var defaultFood = $scope.allFoods[0];

           // var selectedFood = $scope.allFoods[0];
            //selectedFood.foodId = defaultFood.foodId;

            var model = {
                name: defaultFood.name,
                type: defaultFood.type,
                servings: 1,
                calories: defaultFood.calories,
                grams: defaultFood.grams,
                protein: defaultFood.protein,
                carbohydrates: defaultFood.carbohydrates,
                fat: defaultFood.fat,
                sodium: defaultFood.sodium,
                fiber: defaultFood.fiber,
                transfat: defaultFood.transfat,
                saturatedFat: defaultFood.saturatedFat,
                sugar: defaultFood.sugar,
                cholesterol: defaultFood.cholesterol,
                vitaminA: defaultFood.vitaminA,
                vitaminC: defaultFood.vitaminC,
                calcium: defaultFood.calcium,
                iron: defaultFood.iron,
                foodId: defaultFood.foodId,
                selectedFood: $scope.allFoods[0],
                isEditable: true
            };

            meal.foods.push(model);

            //foodServingsChange()
            doMealTotaling(meal);
            calculatePlanTotalMacros($scope.plan);
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

        $scope.deleteFood = function(food, meal){
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

                doMealTotaling(meal);

                calculatePlanTotalMacros($scope.plan);
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

        $scope.savePlan = function(callback){
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

            plan.$update(function() {
				//$location.path('plans/' + plan._id);
                for (var i = 0; i < $scope.plan.meals.length; i++){
                    for (var j = 0; j < $scope.plan.meals[i].foods.length; j++){
                        $scope.plan.meals[i].foods[j].name = $scope.plan.meals[i].foods[j].selectedFood.name;
                        $scope.plan.meals[i].foods[j].type = $scope.plan.meals[i].foods[j].selectedFood.type;
                        $scope.plan.meals[i].foods[j].foodId = $scope.plan.meals[i].foods[j].selectedFood.foodId;
                    }

                    doMealTotaling($scope.plan.meals[i]);
                }

                calculatePlanTotalMacros($scope.plan);

                $scope.success = true;

                $timeout(function(){$scope.success = false;}, 3000);
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
                            doMealTotaling($scope.plans[i].meals[nMeal]);
                        }

                        calculatePlanTotalMacros($scope.plans[i]);

                        var planModel = {
                            planDateNonUtc: $scope.plans[i].planDateNonUtc || $scope.plans[i].planDate,
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

		$scope.findOne = function() {
            if ($stateParams.planId) {
                $scope.plan = Plans.get({
                    planId: $stateParams.planId
                }, function (u, getResponseHeaders) {
                    if (!$scope.plan.planDateNonUtc){
                        $scope.plan.planDateNonUtc = $scope.plan.planDate;
                    }

                    $scope.isUserAdmin = $scope.plan.userRoles && $scope.plan.userRoles.indexOf('admin') !== -1 ? true : false;

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

                        calculatePlanTotalMacros($scope.plan);
                    }
                });
            }
            else{
                $scope.plan =  {data: null, meals: null};
                $scope.plan.meals = [];
            }
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

            doMealTotaling(meal);

            calculatePlanTotalMacros($scope.plan);
        };

        $scope.foodServingsChange = function(food, meal){

            food.calories = food.servings * food.selectedFood.calories;
            food.fat = food.servings * food.selectedFood.fat;
            food.protein = food.servings * food.selectedFood.protein;
            food.carbohydrates = food.servings * food.selectedFood.carbohydrates;
            food.sodium = food.servings * food.selectedFood.sodium;
            food.grams = food.servings * food.selectedFood.grams;

            doMealTotaling(meal);

            calculatePlanTotalMacros($scope.plan);
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
        $scope.orderByField = 'planDate';
        $scope.reverseSort = false;
        scope.plansCollection = [];

        $scope.setSorting = function(){
            if (!isSortingEnabled){
                $('.panel-group').find('.panel-default').addClass('disabled');
                isSortingEnabled = false;

            }

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
                        var proteinTarget = $scope.nutritionProfile.proteinPercentageTarget;
                        var carbsTarget = $scope.nutritionProfile.carbohydratesPercentageTarget;
                        var fatTarget = $scope.nutritionProfile.fatPercentageTarget;
                        var caloriesTarget = $scope.nutritionProfile.averageCaloriesTarget;

                        var planTotalCalories = $scope.plan.totalPlanCalories;
                        var planTotalCarbs = $scope.plan.totalPlanCarbsAsPercent;
                        var planTotalProtein = $scope.plan.totalPlanProteinAsPercent;
                        var planTotalFat = $scope.plan.totalPlanFatAsPercent;



                        var suggestedFoodsAry = [];

                        for (var i = 0; i < $scope.allFoods.length; i++) {
                            var foodToCheck = $scope.allFoods[i];
                            var score = 0;

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

                            if (caloriesTargetDiff < 0){
                                caloriesTargetDiff = -caloriesTargetDiff;
                            }
                            if (proteinTargetDiff < 0){
                                proteinTargetDiff = -proteinTargetDiff;
                            }
                            if (carbsTargetDiff < 0){
                                carbsTargetDiff = -carbsTargetDiff;
                            }
                            if (fatTargetDiff < 0){
                                fatTargetDiff = -fatTargetDiff;
                            }

                            score = (caloriesTargetDiff * 3) + proteinTargetDiff + carbsTargetDiff + fatTargetDiff;

                            foodToCheck.score = score;



                            suggestedFoodsAry.push(foodToCheck);
                        }

                        suggestedFoodsAry.sort(function compare(a,b) {
                            if (a.score < b.score)
                                return -1;
                            if (a.score > b.score)
                                return 1;
                            return 0;
                        });

                        //suggestedFoodsAry.reverse();

                        var suggestedFoodsTop5 = [];

                        for(i = 0; i < 5; i++){
                            var suggestedFood = suggestedFoodsAry[i];

                            suggestedFoodsTop5.push(suggestedFood);
                        }

                        return suggestedFoodsTop5;
                    },
                    mealForSuggestion: function(){
                        return meal;
                    },
                    parentScope: function () {
                        return $scope;
                    }
                }
            });

            modalInstance.result.then(function (mealForSuggestion) {
                //$scope.dialogSelectedMealType = selectedItem;
               // $scope.copyPlan(planCopyModel);
                meal = mealForSuggestion;

                doMealTotaling(meal);

                calculatePlanTotalMacros($scope.plan);

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }




	}
]);

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

var SuggestionsModalInstanceCtrl = function ($scope, $modalInstance, parentScope, $timeout, suggestedFoods, mealForSuggestion) {
    $scope.parentScope = parentScope;
    $scope.suggestedFoods = suggestedFoods;
    $scope.mealForSuggestion = mealForSuggestion;
    $scope.selectedFood = $scope.suggestedFoods[0];

    $scope.selectedFoodClick = function(suggestedFood){
        $scope.selectedFood = suggestedFood;
    };

    $scope.ok = function () {
        $scope.selectedFood.IsSuggested = true;
        $scope.selectedFood.servings = 1;
        $scope.selectedFood.isEditable = false;
        $scope.selectedFood.foodId = $scope.selectedFood._id;

        $scope.selectedFood.selectedFood =
        {
            calcium: $scope.selectedFood.calcium,
            calories: $scope.selectedFood.calories,
            carbohydrates: $scope.selectedFood.carbohydrates,
            cholesterol: $scope.selectedFood.cholesterol,
            fat: $scope.selectedFood.fat,
            fiber: $scope.selectedFood.fiber,
            foodId: $scope.selectedFood._id,
            grams: $scope.selectedFood.cholesterol.grams,
            iron: $scope.selectedFood.iron,
            name: $scope.selectedFood.name,
            protein: $scope.selectedFood.protein,
            saturatedFat: $scope.selectedFood.saturatedFat,
            sodium: $scope.selectedFood.sodium,
            sugar: $scope.selectedFood.sugar,
            transfat: $scope.selectedFood.transfat,
            type: $scope.selectedFood.type,
            vitaminA: $scope.selectedFood.vitaminA,
            vitaminC: $scope.selectedFood.vitaminC
        };

        mealForSuggestion.foods.push($scope.selectedFood);

        $timeout(function(){$scope.selectedFood.IsSuggested = false;}, 4000);

        $modalInstance.close(mealForSuggestion);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

