/**
 * Created by jason on 9/4/14.
 */
/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('nutritionProfile').controller('NutritionProfileController', ['$scope', '$stateParams', '$location', 'Authentication', 'NutritionProfile', '$timeout', '$modal', 'NutritionProfileDialogService',
    function($scope, $stateParams, $location, Authentication, NutritionProfile, $timeout, $modal, NutritionProfileDialogService) {
        window.scope = $scope;

        $scope.isAdvancedNutrientTargets = false;
        $scope.macrosRatioSelected = 0;
        $scope.nutrientTargetSettings = 'basic';
        $scope.isMacrosValid = true;

        $scope.templateMeals = [
            {id: 1, name: 'Breakfast'},
            {id: 2, name: 'Lunch'},
            {id: 3, name: 'Dinner'}
        ];

        $scope.activityLevels = [
            {id: 0, name: 'Sedentary'},
            {id: 1, name: 'Lightly Active'},
            {id: 2, name: 'Moderately Active'},
            {id: 3, name: 'Very Active'},
            {id: 4, name: 'Extremely Active'}
        ];

        $scope.weeklyFatLossRate = [
            {id: 250, name: '0.5 Pounds Per Week'},
            {id: 500, name: '1 Pound Per Week'},
            {id: 1000, name: '2 Pounds Per Week'},
        ];

        $scope.macrosRatios = [
            {id: 0, name: '20/40/40 - Protein, Carbs, Fat'},
            {id: 1, name: '20/30/50 - Protein, Carbs, Fat'},
            {id: 2, name: 'Atkins Diet'},
            {id: 3, name: 'South Beach Diet'}
        ];

        $scope.sexOptions = [
            'Male',
            'Female'
        ];

        $scope.heightFeetOptions = [ 1, 2, 3, 4, 5, 6, 7, 8];
        $scope.heightInchesOptions = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];


        $scope.nutritionProfileParameters = {
            showSubmitButton: true
        };

        var initializeBasicNutritionSettings = function(){
            $scope.nutritionProfile.deficitTarget = 500;
            $scope.nutritionProfile.isAdvancedNutrientTargets = false;
            $scope.nutritionProfile.activityLevel = 0;
            $scope.macrosRatioSelected = 0;

            $scope.nutritionProfile.proteinPercentageTarget = 20;
            $scope.nutritionProfile.carbohydratesPercentageTarget = 40;
            $scope.nutritionProfile.fatPercentageTarget = 40;
        };

        $scope.nutrientTargetSettingsChange = function(nutritionTargetSettings){
            if(nutritionTargetSettings === 'advanced'){
                $scope.nutritionProfile.isAdvancedNutrientTargets = true;
            }
            else{
                initializeBasicNutritionSettings();

                $scope.validateNutritionTargets(false, true);
            }
        };

        $scope.macrosRatioChange = function(macrosRatioSelected){
            switch(macrosRatioSelected){
                //20/40/40 - Protein, Carbs, Fat
                case 0:
                    $scope.nutritionProfile.proteinPercentageTarget = 20;
                    $scope.nutritionProfile.carbohydratesPercentageTarget = 40;
                    $scope.nutritionProfile.fatPercentageTarget = 40;
                    break;
                //20/30/50 - Protein, Carbs, Fat
                case 1:
                    $scope.nutritionProfile.proteinPercentageTarget = 20;
                    $scope.nutritionProfile.carbohydratesPercentageTarget = 30;
                    $scope.nutritionProfile.fatPercentageTarget = 50;
                    break;
                //Atkins Diet
                case 2:
                    $scope.nutritionProfile.proteinPercentageTarget = 42;
                    $scope.nutritionProfile.carbohydratesPercentageTarget = 15;
                    $scope.nutritionProfile.fatPercentageTarget = 43;
                    break;
                //South Beach Diet
                case 3:
                    $scope.nutritionProfile.proteinPercentageTarget = 30;
                    $scope.nutritionProfile.carbohydratesPercentageTarget = 40;
                    $scope.nutritionProfile.fatPercentageTarget = 30;
                    break;
            }
        };

        $scope.validateNutritionTargets = function(isUpdate, isBasicNutritionSettingsChangeTo){
            if(scope.nutritionProfile.isAdvancedNutrientTargets || isBasicNutritionSettingsChangeTo) {
                if (parseFloat($scope.nutritionProfile.proteinPercentageTarget) + parseFloat($scope.nutritionProfile.carbohydratesPercentageTarget) +
                    parseFloat($scope.nutritionProfile.fatPercentageTarget) !== 100) {
                    $scope.isMacrosValid = false;

                    return false;
                }
                $scope.isMacrosValid = true;

                if (!isUpdate) {
                    $scope.isMacrosChangeValid = true;
                    $timeout(function () {
                        $scope.isMacrosChangeValid = false;
                    }, 3000);
                }
            }

            return true;
        };

        $scope.create = function() {
            $scope.isMacrosValid = $scope.validateNutritionTargets();

            if($scope.isMacrosValid) {
                var nutritionProfile = new NutritionProfile({
                    proteinPercentageTarget: $scope.nutritionProfile.proteinPercentageTarget,
                    carbohydratesPercentageTarget: $scope.nutritionProfile.carbohydratesPercentageTarget,
                    fatPercentageTarget: $scope.nutritionProfile.fatPercentageTarget,
                    deficitTarget: $scope.nutritionProfile.deficitTarget,
                    age: $scope.nutritionProfile.age,
                    sex: $scope.nutritionProfile.sex,
                    weight: $scope.nutritionProfile.weight,
                    heightFeet: $scope.nutritionProfile.heightFeet,
                    heightInches: $scope.nutritionProfile.heightInches,
                    restingHeartRate: $scope.nutritionProfile.restingHeartRate,
                    bodyFatPercentage: $scope.nutritionProfile.bodyFatPercentage,
                    templateMeals: $scope.nutritionProfile.templateMeals,
                    hideWeightOnHomeScreen: $scope.hideWeightOnHomeScreen,
                    isAdvancedNutrientTargets: $scope.nutritionProfile.isAdvancedNutrientTargets,
                    activityLevel: $scope.nutritionProfile.activityLevel
                });
                nutritionProfile.$save(function (response) {

                    $scope.nutritionProfile = response;

                    $scope.success = true;

                    $timeout(function () {
                        $scope.success = false;
                    }, 3000);
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }

        };

        $scope.update = function() {
            $scope.isMacrosValid = $scope.validateNutritionTargets(true);

            if($scope.isMacrosValid) {
                var nutritionProfile = $scope.nutritionProfile;

                if (!nutritionProfile._id) {
                    $scope.create();
                }
                else {
                    nutritionProfile.$update(function () {
                        $scope.success = true;

                        $timeout(function () {
                            $scope.success = false;
                        }, 3000);
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                }
            }

        };

        var initializeMacrosSelectList = function(){
            if($scope.nutritionProfile.proteinPercentageTarget == 20 &&
                $scope.nutritionProfile.carbohydratesPercentageTarget == 40 &&
                $scope.nutritionProfile.fatPercentageTarget == 40){
                $scope.macrosRatioSelected = 0;
            }
            else if($scope.nutritionProfile.proteinPercentageTarget == 20 &&
                $scope.nutritionProfile.carbohydratesPercentageTarget == 30 &&
                $scope.nutritionProfile.fatPercentageTarget == 50){
                $scope.macrosRatioSelected = 1;
            }
            else if($scope.nutritionProfile.proteinPercentageTarget == 42 &&
                $scope.nutritionProfile.carbohydratesPercentageTarget == 15 &&
                $scope.nutritionProfile.fatPercentageTarget == 43){
                $scope.macrosRatioSelected = 2;
            }
            else{
                $scope.macrosRatioSelected = 3;
            }
        };

        $scope.findOne = function () {
            $scope.nutritionProfile = NutritionProfile.get({
                userId: user ? user._id : null
            }, function () {
                if(!$scope.nutritionProfile){
                    $scope.nutritionProfile = {};
                    initializeBasicNutritionSettings();

                }

                if(!$scope.nutritionProfile.templateMeals || $scope.nutritionProfile.templateMeals.length == 0){
                    $scope.nutritionProfile.templateMeals = [];

                    for(var m = 0; m < $scope.templateMeals.length; m++){
                        $scope.nutritionProfile.templateMeals.push($scope.templateMeals[m]);
                    }
                }

                if(!$scope.nutritionProfile.isAdvancedNutrientTargets){
                    $scope.nutritionProfile.isAdvancedNutrientTargets = false;
                    $scope.nutrientTargetSettings = 'basic';

                    if(!$scope.nutritionProfile.activityLevel && $scope.nutritionProfile.activityLevel !== 0){
                        $scope.nutritionProfile.activityLevel = 0;
                    }

                    if(!$scope.nutritionProfile.deficitTarget){
                        $scope.nutritionProfile.deficitTarget = 500;
                    }

                    //initialize macros select list selection
                    initializeMacrosSelectList();
                }
                else{
                    $scope.nutrientTargetSettings = 'advanced';
                }

            });
        };

        $scope.deleteTemplateMeal = function(templateMeal){
            if (confirm("Are you sure you want to delete this Meal?")) {
                for (var i in $scope.nutritionProfile.templateMeals) {
                    if ($scope.nutritionProfile.templateMeals[i] === templateMeal) {
                        $scope.nutritionProfile.templateMeals.splice(i, 1);
                    }
                }
            }
        };

        $scope.addMealToTemplateWithDialog = function(){
            var modalInstance = $modal.open({
                templateUrl: 'addMealToTemplateModalContent.html',
                controller: NutritionProfileDialogService.AddMealToTemplateInstanceCtrl,
                //size: size,
                resolve: {
                    parentScope: function () {
                        return $scope;
                    }
                }
            });

            modalInstance.result.then(function (mealToAddToTemplate) {
                $scope.nutritionProfile.templateMeals.push(mealToAddToTemplate);

                $scope.update();

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.sortableStartCallback = function(e, ui) {
            ui.item.data('start', ui.item.index());
        };
        $scope.sortableUpdateCallback = function(e, ui) {
            var start = ui.item.data('start'),
                end = ui.item.index();

            $scope.nutritionProfile.templateMeals.splice(end, 0,
                $scope.nutritionProfile.templateMeals.splice(start, 1)[0]);

            $scope.$apply();
        };

        $scope.sortableOptions = {
            start: $scope.sortableStartCallback,
            update: $scope.sortableUpdateCallback
        };


    }
]);