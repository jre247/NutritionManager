/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('foods').controller('FoodsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Foods', 'CoreUtilities',
    function($scope, $stateParams, $location, Authentication, Foods, CoreUtilities) {
        window.scope = $scope;

       // $scope.authentication = Authentication;
        $scope.servings = 1;

        $scope.skipFoods = 0;

        $scope.successLoading = false;

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

        $scope.groceryStores = [
            {id: 1, store: 'Trader Joes'},
            {id: 2, store: 'Wholefoods'},
            {id: 3, store: 'Foodtown'}
        ];

        $scope.importFoodsFromExcel = function(){
            CoreUtilities.importFoodsFromExcel().then(function(){
                $scope.successLoading = true;
            });
        };

        $scope.foodFilterInput = '';

        $scope.foodInputChange = function(){
            CoreUtilities.getFoods($scope.foodFilterInput, 0, false).then(function (data) {
                $scope.foods = data;
            });
        };

        $scope.moreFoods = function(){
            $scope.skipFoods += 8;

            var filterTxt = $scope.foodFilterInput || 'null';

            CoreUtilities.getFoods(filterTxt, $scope.skipFoods, false).then(function (data) {
                for(var f = 0; f < data.length; f++){
                    $scope.foods.push(data[f]);
                }
            });
        };

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
                foodToken: '-1',
                name: $scope.food.name,
                calories: $scope.food.calories,
                protein: $scope.food.protein,
                fat: $scope.food.fat,
                carbohydrates: $scope.food.carbohydrates,
                grams: $scope.food.grams,
                type: $scope.food.type,
                groceryStore: $scope.food.groceryStore,
                sodium: $scope.food.sodium,
                fiber: $scope.food.fiber,
                sugar: $scope.food.sugar,
                cholesterol: $scope.food.cholesterol,
                vitaminA: $scope.food.vitaminA,
                vitaminC: $scope.food.vitaminC,
                calcium: $scope.food.calcium,
                iron: $scope.food.iron,
                saturatedFat: $scope.food.saturatedFat,
                transfat: $scope.food.transfat,
                servingDescription1: $scope.food.servingDescription1,
                servingDescription2: $scope.food.servingDescription2,
                servingGrams2: $scope.food.servingGrams2
                //milliliters: $scope.milliliters
            });
            food.$save(function(response) {
                $location.path('foods');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            this.food.name = '';
            this.food.groceryStore = 0;
            this.food.sodium = '';
            this.food.saturatedFat = '';
            this.food.fiber = '';
            this.food.sugar = '';
            this.food.transfat = '';
            this.food.vitaminA = '';
            this.food.vitaminC = '';
            this.food.cholesterol = '';
            this.food.calcium = '';
            this.food.iron = '';
            this.food.calories = '';
            this.food.protein = '';
            this.food.fat = '';
            this.food.carbohydrates = '';
            this.food.grams = '';
            this.food.type = '';

            //this.milliliters = '';
        };

        $scope.update = function() {
            var food = $scope.food;

            if(!food.foodToken){
                food.foodToken = '-1';
            }

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
            CoreUtilities.getFoods('null', 0).then(function (data) {
                $scope.foods = data;
            });

            $scope.isUserAdmin = isUserAdmin();
        };

        var isUserAdmin = function(){
            return user.roles.indexOf('admin') !== -1 ? true : false;
        };

        $scope.findOne = function() {
            $scope.food = Foods.get({
                foodId: $stateParams.foodId
            },function(){
                $scope.isUserAdmin = isUserAdmin();

                $scope.calculateDailyPercentages($scope.food);

                if($scope.food.isImported){
                    $scope.food.vitaminA = ($scope.food.vitaminA / 900) * 100;
                    $scope.food.vitaminC = ($scope.food.vitaminC / 75)  * 100;
                    $scope.food.iron = ($scope.food.iron / 15) * 100;
                    $scope.food.calcium = ($scope.food.calcium / 1000) * 100;
                }

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
                $scope.food.type = parseInt($scope.food.type) >= 0 ? parseInt($scope.food.type) : 0;
                $scope.food.typeDisplay = $scope.foodTypes[$scope.food.type].type;
                $scope.food.servingDescription1Display = $scope.food.servingDescription1;
                $scope.food.servingDescription2Display = $scope.food.servingDescription2;
                $scope.food.servingGrams2Display = $scope.food.servingGrams2;


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