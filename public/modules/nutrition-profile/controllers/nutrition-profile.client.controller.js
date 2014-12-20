/**
 * Created by jason on 9/4/14.
 */
/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('nutritionProfile').controller('NutritionProfileController', ['$scope', '$stateParams', '$location', 'Authentication', 'NutritionProfile', '$timeout', '$modal', 'NutritionProfileDialogService', 'Users', 'NutritionProfileUtilities',
    function($scope, $stateParams, $location, Authentication, NutritionProfile, $timeout, $modal, NutritionProfileDialogService, Users, NutritionProfileUtilities) {
        window.scope = $scope;

        $scope.user = Authentication.user;

        $scope.user = user;
        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        $scope.isAdvancedNutrientTargets = false;
        $scope.macrosRatioSelected = 0;
        $scope.nutrientTargetSettings = 'basic';
        $scope.isMacrosValid = true;

        $scope.userAuthenticated = true;

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

        $scope.nutrientTargetSettingsChange = function(nutritionTargetSettings){
            NutritionProfileUtilities.nutrientTargetSettingsChange($scope, nutritionTargetSettings);
        };

        $scope.macrosRatioChange = function(macrosRatioSelected){
            NutritionProfileUtilities.macrosRatioChange(macrosRatioSelected, $scope);

            $scope.update();
        };

        $scope.macroChange = function(){
            var isValid = $scope.validateNutritionTargets();

            if(isValid) {
                $scope.update();
            }
        };

        $scope.validateNutritionTargets = function(isUpdate, isBasicNutritionSettingsChangeTo){
            var isValid = NutritionProfileUtilities.validateNutritionTargets(isUpdate, isBasicNutritionSettingsChangeTo, $scope);

            return isValid;
        };

        $scope.update = function() {
            if(window.user) {
                $scope.isMacrosValid = $scope.validateNutritionTargets(true);

                if ($scope.isMacrosValid) {
                    var nutritionProfile = $scope.nutritionProfile;

                    if (window.user) {
                        var userToSave = new Users(window.user);

                        userToSave.nutritionProfile = nutritionProfile;

                        userToSave.$update(function (data) {
                            $scope.nutritionProfile = data.nutritionProfile;
                            Authentication.user = user;
                            Authentication.user.nutritionProfile = data.nutritionProfile;
                            window.user = user;
                            $scope.success = true;

                            $timeout(function () {
                                $scope.success = false;
                            }, 3000);
                        }, function (errorResponse) {
                            $scope.error = errorResponse.data.message;
                        });
                    }
                }
            }

        };

        var initializeMacrosSelectList = function(){
            NutritionProfileUtilities.initializeMacrosSelectList($scope);
        };

        $scope.findOne = function () {
            if(window.user) {
                $scope.nutritionProfile = window.user.nutritionProfile;

                //if(!$scope.nutritionProfile){
                //$scope.nutritionProfile = {};
                //initializeBasicNutritionSettings();
                //}


                if (!$scope.nutritionProfile.templateMeals || $scope.nutritionProfile.templateMeals.length == 0) {
                    $scope.nutritionProfile.templateMeals = [];

                    for (var m = 0; m < $scope.templateMeals.length; m++) {
                        $scope.nutritionProfile.templateMeals.push($scope.templateMeals[m]);
                    }
                }

                if (!$scope.nutritionProfile.isAdvancedNutrientTargets) {
                    $scope.nutritionProfile.isAdvancedNutrientTargets = false;
                    $scope.nutrientTargetSettings = 'basic';

                    if (!$scope.nutritionProfile.activityLevel && $scope.nutritionProfile.activityLevel !== 0) {
                        $scope.nutritionProfile.activityLevel = 0;
                    }

                    if (!$scope.nutritionProfile.deficitTarget) {
                        $scope.nutritionProfile.deficitTarget = 500;
                    }

                    //initialize macros select list selection
                    initializeMacrosSelectList();
                }
                else {
                    $scope.nutrientTargetSettings = 'advanced';
                }
            }
        };

        $scope.deleteTemplateMeal = function(templateMeal){
            if (confirm("Are you sure you want to delete this Meal?")) {
                for (var i in $scope.nutritionProfile.templateMeals) {
                    if ($scope.nutritionProfile.templateMeals[i] === templateMeal) {
                        $scope.nutritionProfile.templateMeals.splice(i, 1);
                    }
                }

                $scope.update();
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

            $scope.update();
        };

        $scope.sortableOptions = {
            start: $scope.sortableStartCallback,
            update: $scope.sortableUpdateCallback
        };


    }
]);