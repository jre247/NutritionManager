/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('foods').controller('FoodsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Foods',
    function($scope, $stateParams, $location, Authentication, Foods) {
        window.scope = $scope;

       // $scope.authentication = Authentication;


        $scope.create = function() {
            var food = new Foods({
                name: this.name,
                calories: this.calories,
                protein: $scope.protein,
                fat: $scope.fat,
                carbohydrates: $scope.carbohydrates,
                grams: $scope.grams,
                type: $scope.type
                //milliliters: $scope.milliliters
            });
            food.$save(function(response) {
                $location.path('foods');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            this.name = '';
            this.calories = '';
            this.protein = '';
            this.fat = '';
            this.carbohydrates = '';
            this.grams = '';
            this.type = '';
            //this.milliliters = '';
        };

        $scope.update = function() {
            var food = $scope.food;

            food.$update(function() {
                $location.path('foods');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function(food) {
            if (food) {
                food.$remove();

                for (var i in $scope.foods) {
                    if ($scope.foods[i] === food) {
                        $scope.foods.splice(i, 1);
                    }
                }
            } else {
                $scope.food.$remove(function() {
                    $location.path('foods');
                });
            }
        };

        $scope.find = function() {
            $scope.foods = Foods.query();
        };

        $scope.findOne = function() {
            $scope.food = Foods.get({
                foodId: $stateParams.foodId
            });
        };
    }
]);