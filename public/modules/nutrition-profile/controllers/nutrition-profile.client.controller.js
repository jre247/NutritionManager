/**
 * Created by jason on 9/4/14.
 */
/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('nutritionProfile').controller('NutritionProfileController', ['$scope', '$stateParams', '$location', 'Authentication', 'NutritionProfile', '$timeout',
    function($scope, $stateParams, $location, Authentication, NutritionProfile, $timeout) {
        window.scope = $scope;

        $scope.sexOptions = [
            'Male',
            'Female'
        ];

        $scope.heightFeetOptions = [ 1, 2, 3, 4, 5, 6, 7, 8];
        $scope.heightInchesOptions = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];


        $scope.create = function() {
            var nutritionProfile = new NutritionProfile({
                proteinPercentageTarget: $scope.nutritionProfile.proteinPercentageTarget,
                carbohydratesPercentageTarget: $scope.nutritionProfile.carbohydratesPercentageTarget,
                fatPercentageTarget: $scope.nutritionProfile.fatPercentageTarget,
                averageCaloriesTarget: $scope.nutritionProfile.averageCaloriesTarget,
                age: $scope.nutritionProfile.age,
                sex: $scope.nutritionProfile.sex,
                weight: $scope.nutritionProfile.weight,
                height: $scope.nutritionProfile.height,
                restingHeartRate: $scope.nutritionProfile.restingHeartRate,
                bodyFatPercentage: $scope.nutritionProfile.bodyFatPercentage
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

        }

        $scope.findOne = function () {
            $scope.nutritionProfile = NutritionProfile.get({
                userId: user ? user._id : null
            }, function () {

            });
        };


    }
]);