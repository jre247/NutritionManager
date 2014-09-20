/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('foods').controller('FoodsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Foods',
    function($scope, $stateParams, $location, Authentication, Foods) {
        window.scope = $scope;

       // $scope.authentication = Authentication;
        $scope.servings = 1;

        $scope.servingsChange = function(food){
            if ($scope.servings > 0) {
                food.gramsDisplay = $scope.servings * food.grams;
                food.caloriesDisplay = $scope.servings * food.calories;
                food.fatDisplay = $scope.servings * food.fat;
                food.saturatedFatDisplay = $scope.servings * food.saturatedFat;
                food.transfatDisplay = $scope.servings * food.transfat;
                food.cholesterolDisplay = $scope.servings * food.cholesterol;
                food.sodiumDisplay = $scope.servings * food.sodium;
                food.carbohydratesDisplay = $scope.servings * food.carbohydrates;
                food.fiberDisplay = $scope.servings * food.fiber;
                food.sugarDisplay = $scope.servings * food.sugar;
                food.proteinDisplay = $scope.servings * food.protein;
                food.vitaminADisplay = $scope.servings * food.vitaminA;
                food.vitaminCDisplay = $scope.servings * food.vitaminC;
                food.calciumDisplay = $scope.servings * food.calcium;
                food.ironDisplay = $scope.servings * food.iron;

                $scope.totalFatDailyPercentageDisplay = (food.fatDisplay / 65) * 100;
                $scope.saturatedFatDailyPercentageDisplay = (food.saturatedFatDisplay / 20) * 100;
                $scope.cholesterolDailyPercentageDisplay = (food.cholesterolDisplay / 300) * 100;
                $scope.sodiumDailyPercentageDisplay = (food.sodiumDisplay / 2400) * 100;
                $scope.totalCarbohydratesDailyPercentageDisplay = (food.carbohydratesDisplay / 300) * 100;
                $scope.fiberDailyPercentageDisplay = (food.fiberDisplay / 25) * 100;
            }

        };

        $scope.create = function() {
            var food = new Foods({
                name: this.name,
                calories: this.calories,
                protein: $scope.protein,
                fat: $scope.fat,
                carbohydrates: $scope.carbohydrates,
                grams: $scope.grams,
                type: $scope.type,
                sodium: $scope.sodium,
                fiber: $scope.fiber,
                sugar: $scope.sugar,
                cholesterol: $scope.cholesterol,
                vitaminA: $scope.vitaminA,
                vitaminC: $scope.vitaminC,
                calcium: $scope.calcium,
                iron: $scope.iron,
                saturatedFat: $scope.saturatedFat,
                transfat: $scope.transfat
                //milliliters: $scope.milliliters
            });
            food.$save(function(response) {
                $location.path('foods');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            this.name = '';
            this.sodium = '';
            this.saturatedFat = '';
            this.fiber = '';
            this.sugar = '';
            this.transfat = '';
            this.vitaminA = '';
            this.vitaminC = '';
            this.cholesterol = '';
            this.calcium = '';
            this.iron = '';
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
            if (confirm("Are you sure you want to delete this food?")) {
                if (food) {
                    food.$remove();

                    for (var i in $scope.foods) {
                        if ($scope.foods[i] === food) {
                            $scope.foods.splice(i, 1);
                        }
                    }
                } else {
                    $scope.food.$remove(function () {
                        $location.path('foods');
                    });
                }
            }
        };

        $scope.find = function() {
            $scope.foods = Foods.query();


        };

        $scope.findOne = function() {
            $scope.food = Foods.get({
                foodId: $stateParams.foodId
            },function(){
                $scope.calculateDailyPercentages($scope.food);

                $scope.food.gramsDisplay = $scope.food.grams;
                $scope.food.caloriesDisplay = $scope.food.calories;
                $scope.food.fatDisplay = $scope.food.fat;
                $scope.food.saturatedFatDisplay = $scope.food.saturatedFat;
                $scope.food.transfatDisplay = $scope.food.transfat;
                $scope.food.cholesterolDisplay = $scope.food.cholesterol;
                $scope.food.sodiumDisplay = $scope.food.sodium;
                $scope.food.carbohydratesDisplay = $scope.food.carbohydrates;
                $scope.food.fiberDisplay = $scope.food.fiber;
                $scope.food.sugarDisplay = $scope.food.sugar;
                $scope.food.proteinDisplay = $scope.food.protein;
                $scope.food.vitaminADisplay = $scope.food.vitaminA;
                $scope.food.vitaminCDisplay = $scope.food.vitaminC;
                $scope.food.calciumDisplay = $scope.food.calcium;
                $scope.food.ironDisplay = $scope.food.iron;

                $scope.totalFatDailyPercentageDisplay = $scope.totalFatDailyPercentage;
                $scope.saturatedFatDailyPercentageDisplay = $scope.saturatedFatDailyPercentage;
                $scope.cholesterolDailyPercentageDisplay = $scope.cholesterolDailyPercentage;
                $scope.sodiumDailyPercentageDisplay = $scope.sodiumDailyPercentage;
                $scope.totalCarbohydratesDailyPercentageDisplay = $scope.totalCarbohydratesDailyPercentage;
                $scope.fiberDailyPercentageDisplay = $scope.fiberDailyPercentage;

                showDailyMacrosChart();
            });
        };

        $scope.calculateDailyPercentages = function(food) {
            $scope.totalFatDailyPercentage = (food.fat / 65) * 100;
            $scope.saturatedFatDailyPercentage = (food.saturatedFat / 20) * 100;
            $scope.cholesterolDailyPercentage = (food.cholesterol / 300) * 100;
            $scope.sodiumDailyPercentage = (food.sodium / 2400) * 100;
            $scope.totalCarbohydratesDailyPercentage = (food.carbohydrates / 300) * 100;
            $scope.fiberDailyPercentage = (food.fiber / 25) * 100;
        };

        var showDailyMacrosChart = function() {
            var config = {};
            config.bindto = '#macrosChart';
            config.data = {};
            config.data.json = {};
            config.data.json.protein = parseInt($scope.food.proteinDisplay);
            config.data.json.carbs = parseInt($scope.food.carbohydratesDisplay);
            config.data.json.fat = parseInt($scope.food.fatDisplay);
            config.axis = {"y":{"label":{"text":"Macros","position":"outer-middle"}}};
            config.data.types={"protein":"pie", "carbs": "pie", "fat": "pie"};
            config.size = {width: 280, height: 280};
            $scope.chart = c3.generate(config);
        };

    }
]);