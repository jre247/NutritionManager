/**
 * Created by jason on 9/12/14.
 */
// I act a repository for the remote friend collection.
angular.module(ApplicationConfiguration.applicationModuleName).service(
    "NutritionProfileUtilities",
    function( $http, $q, $timeout ) {

        // Return public API.
        return({

            nutrientTargetSettingsChange: nutrientTargetSettingsChange,
            validateNutritionTargets: validateNutritionTargets
        });


        // ---
        // PUBLIC METHODS.
        // ---


        function initializeBasicNutritionSettings($scope){

            $scope.nutritionProfile.deficitTarget = 500;
            $scope.nutritionProfile.isAdvancedNutrientTargets = false;
            $scope.nutritionProfile.activityLevel = 0;
            $scope.macrosRatioSelected = 0;

            $scope.nutritionProfile.proteinPercentageTarget = 20;
            $scope.nutritionProfile.carbohydratesPercentageTarget = 40;
            $scope.nutritionProfile.fatPercentageTarget = 40;
        };

        function nutrientTargetSettingsChange($scope, nutritionTargetSettings){
            if(nutritionTargetSettings === 'advanced'){
                $scope.nutritionProfile.isAdvancedNutrientTargets = true;
            }
            else{
                initializeBasicNutritionSettings($scope);

                $scope.validateNutritionTargets(false, true);
            }

            if($scope.update) {
                $scope.update();
            }
        };

        function validateNutritionTargets(isUpdate, isBasicNutritionSettingsChangeTo, $scope){
            if($scope.nutritionProfile.isAdvancedNutrientTargets || isBasicNutritionSettingsChangeTo) {
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


        function handleSuccess( response ) {

            //dailyDashboardData.activityPlan = response.data;

            // return dailyDashboardData;

            return response.data;
        }


        // I transform the error response, unwrapping the application dta from
        // the API response payload.
        function handleError( response ) {

            // The API response from the server should be returned in a
            // nomralized format. However, if the request was not handled by the
            // server (or what not handles properly - ex. server error), then we
            // may have to normalize it on our end, as best we can.
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );

            }

            // Otherwise, use expected error message.
            return( $q.reject( response.data.message ) );

        }


    }
);