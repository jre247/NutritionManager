'use strict';

angular.module('plans').controller('PlansController', ['$scope', '$stateParams', '$location', 'Authentication', '$modal', '$log', 'Plans', 'Foods',
	function($scope, $stateParams, $location, Authentication, $modal, $log, Plans, Foods) {
		window.scope = $scope;
        window.plans = $scope.plans;
        $scope.showTotalsAsPercent = false;

        $scope.authentication = Authentication;
        $scope.meals = [];


        $scope.allFoods = Foods.query();

        $scope.mealTypes = [
            {id: 1, name: 'Breakfast'},
            {id: 2, name: 'Lunch'},
            {id: 3, name: 'Dinner'},
            {id: 4, name: 'Snack'}
        ];

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
			var plan = new Plans({
				planDate: $scope.plan.planDate,
                meals: $scope.plan.meals
			});
            plan.$save(function(response) {
				$location.path('plans/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			$scope.plan.planDate = '';
            $scope.plan.meals = [];
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

            $scope.plan.meals.push(model);

            var meal = $scope.plan.meals[$scope.plan.meals.length - 1];

            $scope.createFood(meal);
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
            for (var i in $scope.plan.meals) {
                if ($scope.plan.meals[i] === meal) {
                    $scope.plan.meals.splice(i, 1);
                }
            }

            calculatePlanTotalCalories($scope.plan);
        };

        $scope.createFood = function(meal){
            var model = {
                name: '',
                type: '',
                servings: 1,
                calories: 0,
                grams: 0,
                protein: 0,
                carbohydrates: 0,
                fat: 0,
                foodId: '',
                isEditable: true
            };

            meal.foods.push(model);
        };

        $scope.saveFood = function(food){
            food.isEditable = false;
        };

        $scope.saveAll = function(meal){
            for(var food = 0; food < meal.foods.length; food++){
                meal.foods[food].isEditable = false;
            }

            meal.isEditable = false;
        };

        $scope.editFood = function(food){
            food.isEditable = true;
        };

        $scope.deleteFood = function(food, meal){
            for(var nMeal = 0; nMeal < $scope.plan.meals.length; nMeal++){
                if ($scope.plan.meals[nMeal] === meal){
                    for (var nFood = 0; nFood < meal.foods.length; nFood++){
                        if (meal.foods[nFood] === food) {
                            meal.foods.splice(nFood, 1);
                        }
                    }
                }
            }

            doMealTotaling(meal);

            calculatePlanTotalCalories($scope.plan);

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
          if (!$scope.plan._id){
              $scope.create();
          }
            else{
              $scope.update();
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

                calculatePlanTotalCalories($scope.plan);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.plans = Plans.query();
		};

		$scope.findOne = function() {
            if ($stateParams.planId) {
                $scope.plan = Plans.get({
                    planId: $stateParams.planId
                }, function (u, getResponseHeaders) {
                    for (var i = 0; i < $scope.plan.meals.length; i++) {
                        var carbsTotal = 0, proteinTotal = 0, caloriesTotal = 0, fatTotal = 0;

                        for (var j = 0; j < $scope.plan.meals[i].foods.length; j++) {
                            $scope.plan.meals[i].foods[j].name = $scope.plan.meals[i].foods[j].selectedFood.name;
                            $scope.plan.meals[i].foods[j].type = $scope.plan.meals[i].foods[j].selectedFood.type;
                            $scope.plan.meals[i].foods[j].foodId = $scope.plan.meals[i].foods[j].selectedFood.foodId;

                            var carbs = $scope.plan.meals[i].foods[j].carbohydrates;

                            carbsTotal += carbs;
                            proteinTotal += $scope.plan.meals[i].foods[j].protein;
                            fatTotal += $scope.plan.meals[i].foods[j].fat;
                            caloriesTotal += $scope.plan.meals[i].foods[j].calories;
                        }

                        $scope.plan.meals[i].totalCarbohydrates = carbsTotal;
                        $scope.plan.meals[i].totalCalories = caloriesTotal;
                        $scope.plan.meals[i].totalProtein = proteinTotal;
                        $scope.plan.meals[i].totalFat = fatTotal;

                        calculatePlanTotalCalories($scope.plan);
                    }
                });
            }
            else{
                $scope.plan =  {data: null, meals: null};
                $scope.plan.meals = [];
            }
		};

        $scope.foodSelectionChange = function(food){
            food.type = food.selectedFood.type;
            food.calories = food.servings * food.selectedFood.calories;
            food.fat = food.servings * food.selectedFood.fat;
            food.protein = food.servings * food.selectedFood.protein;
            food.carbohydrates = food.servings * food.selectedFood.carbohydrates;
            food.grams = food.servings * food.selectedFood.grams;

            food.name = food.selectedFood.name;
            food.selectedFood.foodId = food.selectedFood._id;
            food.type = food.selectedFood.type;

            food.foodId = food.selectedFood._id;
        };

        $scope.foodServingsChange = function(food, meal){

            food.calories = food.servings * food.selectedFood.calories;
            food.fat = food.servings * food.selectedFood.fat;
            food.protein = food.servings * food.selectedFood.protein;
            food.carbohydrates = food.servings * food.selectedFood.carbohydrates;
            food.grams = food.servings * food.selectedFood.grams;

            doMealTotaling(meal);

            calculatePlanTotalCalories($scope.plan);
        };

        var doMealTotaling = function(meal){
            var carbsTotal = 0, fatTotal = 0, proteinTotal = 0, caloriesTotal = 0;

            for(var i = 0; i < meal.foods.length; i++){
                var foodCarbs = meal.foods[i].carbohydrates;

                carbsTotal += foodCarbs;
                fatTotal += meal.foods[i].fat;
                proteinTotal += meal.foods[i].protein;
                caloriesTotal += meal.foods[i].calories;
            }

            meal.totalCarbohydrates = carbsTotal;
            meal.totalProtein = proteinTotal;
            meal.totalCalories = caloriesTotal;
            meal.totalFat = fatTotal;
        };

        var calculatePlanTotalCalories = function(plan){
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
            var macroTotals = carbsTotal + fatTotal + proteinTotal + caloriesTotal;
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




        //dialog code
        $scope.items = ['item1', 'item2', 'item3'];
        $scope.openDialog = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        //accordian code
//        $scope.groups = [
//            {
//                title: 'Dynamic Group Header - 1',
//                content: 'Dynamic Group Body - 1'
//            },
//            {
//                title: 'Dynamic Group Header - 2',
//                content: 'Dynamic Group Body - 2'
//            }
//        ];
//
//        $scope.items = ['Item 1', 'Item 2', 'Item 3'];
//        $scope.addItem = function() {
//            var newItemNo = $scope.items.length + 1;
//            $scope.items.push('Item ' + newItemNo);
//        };
//        $scope.status = {
//            isFirstOpen: true,
//            isFirstDisabled: false
//        };



        // Use the old watch() with default object equality,
        // which defaults to use object REFERENCE checks.
//        $scope.$watch(
//            "collection",
//            function( newValue, oldValue ) {
//
//                addLogItem( $scope.watchLog );
//
//            }
//        );
	}
]);


var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};