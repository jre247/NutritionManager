'use strict';

angular.module('plans').controller('PlansController', ['$scope', '$stateParams', '$location', 'Authentication', 'Plans',
	function($scope, $stateParams, $location, Authentication, Plans) {
		window.scope = $scope;
        window.plans = $scope.plans;

        $scope.authentication = Authentication;
        $scope.meals = [];

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
                type: '',
                foods: [],
                isEditable: true
            };

            $scope.meals.push(model);
        };



        $scope.saveMeal = function(meal){
            meal.isEditable = false;
        };

        $scope.editMeal = function(meal){
            meal.isEditable = true;
        };

        $scope.deleteMeal = function(meal){
            for (var i in $scope.meals) {
                if ($scope.meals[i] === meal) {
                    $scope.meals.splice(i, 1);
                }
            }
        }

        $scope.createFood = function(meal){
            var model = {
                name: '',
                type: '',
                servings: 0,
                totalCalories: 0,
                totalGrams: 0,
                totalProtein: 0,
                totalCarbohydrates: 0,
                totalFat: 0,
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
				$location.path('plans/' + plan._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.plans = Plans.query();
		};

		$scope.findOne = function() {
			$scope.plan = Plans.get({
                planId: $stateParams.planId
			});
		};
	}
]);