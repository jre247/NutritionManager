'use strict';

angular.module('plans').controller('PlansController', ['$scope', '$stateParams', '$location', 'Authentication', 'Plans', 'Foods',
	function($scope, $stateParams, $location, Authentication, Plans, Foods) {
		window.scope = $scope;
        window.plans = $scope.plans;

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
				name: this.name,
				planDate: this.planDate,
                meals: $scope.meals
			});
            plan.$save(function(response) {
				$location.path('plans/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			this.name = '';
			this.planDate = '';
            this.meals = [];
		};

        $scope.createMeal = function(){
            var model = {
                name: '',
                type: 1,
                foods: [],
                isEditable: true
            };

            if (!$scope.plan) {
                $scope.meals.push(model);
            }
            else{
                $scope.plan.meals.push(model);
            }
        };

        $scope.deleteMeal = function(meal){
            if (!$scope.plan) {

                for (var i in $scope.meals) {
                    if ($scope.meals[i] === meal) {
                        $scope.meals.splice(i, 1);
                    }
                }
            }
            else{
                for (var i in $scope.plan.meals) {
                    if ($scope.plan.meals[i] === meal) {
                        $scope.plan.meals.splice(i, 1);
                    }
                }
            }
        }

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

        $scope.editFood = function(food){
            food.isEditable = true;
        };

        $scope.deleteFood = function(food, meal){
            if (!$scope.plan){
                for(var nMeal = 0; nMeal < $scope.meals.length; nMeal++){
                    if ($scope.meals[nMeal] === meal){
                        for (var nFood = 0; nFood < meal.foods.length; nFood++){
                            if (meal.foods[nFood] === food) {
                                meal.foods.splice(nFood, 1);
                            }
                        }
                    }
                }
            }
            else{
                for(var nMeal = 0; nMeal < $scope.plan.meals.length; nMeal++){
                    if ($scope.plan.meals[nMeal] === meal){
                        for (var nFood = 0; nFood < meal.foods.length; nFood++){
                            if (meal.foods[nFood] === food) {
                                meal.foods.splice(nFood, 1);
                            }
                        }
                    }
                }
            }




        }

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
                }
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.plans = Plans.query();
//                .$promise.then(
//                function(data){
//
//                    console.log("query", this);
//
//                    $scope.plans = data[0].plans;
//                    $scope.allShortFoods = data[0].allShortFoods;
//                    $scope.allDetailedFoods = data[0].allDetailedFoods;
//                });


		};

		$scope.findOne = function() {
			$scope.plan = Plans.get({
                planId: $stateParams.planId
			}, function(u, getResponseHeaders){
                for (var i = 0; i < $scope.plan.meals.length; i++){
                    for (var j = 0; j < $scope.plan.meals[i].foods.length; j++){
                        $scope.plan.meals[i].foods[j].name = $scope.plan.meals[i].foods[j].selectedFood.name;
                        $scope.plan.meals[i].foods[j].type = $scope.plan.meals[i].foods[j].selectedFood.type;
                        $scope.plan.meals[i].foods[j].foodId = $scope.plan.meals[i].foods[j].selectedFood.foodId;
                    }
                }
            });
		};

        $scope.foodSelectionChange = function(food){
            //food.servings = food.servings;
            food.type = food.selectedFood.type;
            food.calories = food.servings * food.selectedFood.calories;
            food.fat = food.servings * food.selectedFood.fat;
            food.protein = food.servings * food.selectedFood.protein;
            food.carbohydrates = food.servings * food.selectedFood.carbohydrates;
            food.grams = food.servings * food.selectedFood.grams;

            //food.selectedFoodId = food.selectedFood.id;

            food.name = food.selectedFood.name;
            food.selectedFood.foodId = food.selectedFood._id;
            food.type = food.selectedFood.type;

            food.foodId = food.selectedFood._id;
//            food.selectedFood.calories = food.selectedFood.calories;
//            food.selectedFood.fat = food.selectedFood.fat;
//            food.selectedFood.protein = food.selectedFood.protein;
//            food.selectedFood.carbohydrates = food.selectedFood.carbohydrates;
//            food.selectedFood.grams = food.selectedFood.grams;
        };

        $scope.foodServingsChange = function(food){

            food.calories = food.servings * food.selectedFood.calories;
            food.fat = food.servings * food.selectedFood.fat;
            food.protein = food.servings * food.selectedFood.protein;
            food.carbohydrates = food.servings * food.selectedFood.carbohydrates;
            food.grams = food.servings * food.selectedFood.grams;
        };

//        // Use the old watch() with default object equality,
//        // which defaults to use object REFERENCE checks.
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