'use strict';

angular.module('plans').controller('PlansController', ['$scope', '$stateParams', '$location', 'Authentication', 'Plans',
	function($scope, $stateParams, $location, Authentication, Plans) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var plan = new Plans({
				name: this.name,
				planDate: this.planDate
			});
            plan.$save(function(response) {
				$location.path('plans/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			this.name = '';
			this.planDate = '';
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