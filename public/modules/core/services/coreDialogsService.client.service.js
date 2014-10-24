/**
 * Created by jason on 9/12/14.
 */
// I act a repository for the remote friend collection.
angular.module('core').service(
    "CoreDialogsService",
    function( $http, $q ) {

        // Return public API.
        return({
            CreateNutritionProfileInstanceCtrl: CreateNutritionProfileInstanceCtrl
        });


        // ---
        // PUBLIC METHODS.
        // ---

        function CreateNutritionProfileInstanceCtrl($scope, $modalInstance){
            $scope.nutritionProfile = {};

            $scope.sexOptions = [
                'Male',
                'Female'
            ];

            $scope.heightFeetOptions = [ 1, 2, 3, 4, 5, 6, 7, 8];
            $scope.heightInchesOptions = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

            $scope.selected = {
                nutritionProfile: $scope.nutritionProfile,
                deficitTarget: $scope.deficitTarget,
                proteinPercentageTarget: $scope.proteinPercentageTarget,
                carbohydratesPercentageTarget: $scope.carbohydratesPercentageTarget,
                fatPercentageTarget: $scope.fatPercentageTarget,
                age: $scope.age,
                heightFeet: $scope.heightFeet,
                heightInches: $scope.heightInches,
                gender: $scope.gender,
                weight: $scope.weight
            };



            $scope.ok = function () {
                $modalInstance.close($scope.selected);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };


        // ---
        // PRIVATE METHODS.
        // ---


        // I transform the successful response, unwrapping the application data
        // from the API response payload.
        function handleSuccess( response ) {

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