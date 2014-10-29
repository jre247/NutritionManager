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

        $scope.templateMeals = [
            {id: 1, name: 'Breakfast'},
            {id: 2, name: 'Lunch'},
            {id: 3, name: 'Dinner'}
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


        $scope.create = function() {
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
                templateMeals: $scope.templateMeals
            });
            nutritionProfile.$save(function(response) {

                $scope.nutritionProfile = response;

                $scope.success = true;

                $timeout(function(){$scope.success = false;}, 3000);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.update = function() {
            var nutritionProfile = $scope.nutritionProfile;

            if (!nutritionProfile._id) {
                $scope.create();
            }
            else {
                nutritionProfile.$update(function () {
                    $scope.success = true;

                    $timeout(function(){$scope.success = false;}, 3000);
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }

        };

        $scope.findOne = function () {
            $scope.nutritionProfile = NutritionProfile.get({
                userId: user ? user._id : null
            }, function () {
                if(!$scope.nutritionProfile.templateMeals || $scope.nutritionProfile.templateMeals.length == 0){
                    $scope.nutritionProfile.templateMeals = [];

                    for(var m = 0; m < $scope.templateMeals.length; m++){
                        $scope.nutritionProfile.templateMeals.push($scope.templateMeals[m]);
                    }
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