'use strict';

var meal =  function(model){
    if (model) {
        var self = this;
        self.name = model.name;
        self.type = model.type;
        self.totalCalories = model.totalCalories;
        self.totalCarbohydrates = model.totalCarbohydrates;
        self.totalProtein = model.totalProtein;
        self.totalGrams = model.totalGrams;
        self.totalFat = model.totalFat;
        self.servings = model.servings;
        self.isEditable = model.isEditable;

        return self;
    }
};

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
                servings: 0,
                totalCalories: 0,
                totalGrams: 0,
                totalProtein: 0,
                totalCarbohydrates: 0,
                totalFat: 0,
                isEditable: true
                //food: this.food
            };

            //var mealItem = new meal(model);

            $scope.meals.push(model);
        };

        $scope.saveMeal = function(meal){
            meal.isEditable = false;
        };

        $scope.editMeal = function(meal){
            meal.isEditable = true;
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