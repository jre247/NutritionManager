/**
 * Created by jason on 9/12/14.
 */
// I act a repository for the remote friend collection.
angular.module('plans').service(
    "NutritionProfileDialogService",
    function( $http, $q ) {

        // Return public API.
        return({
            AddMealToTemplateInstanceCtrl: AddMealToTemplateInstanceCtrl
        });


        // ---
        // PUBLIC METHODS.
        // ---

        function AddMealToTemplateInstanceCtrl($scope, $modalInstance){
            $scope.mealsDict = [
                {id: 1, name: 'Breakfast'},
                {id: 2, name: 'Lunch'},
                {id: 3, name: 'Dinner'},
                {id: 4, name: 'Snack'}
            ];

            $scope.selectedMealForTemplate = 3;

            $scope.selected = {
                selectedMealForTemplate: $scope.selectedMealForTemplate
            };



            $scope.ok = function () {
                var selectedModel = $scope.mealsDict[$scope.selected.selectedMealForTemplate - 1];

                $modalInstance.close(selectedModel);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };


        };



    }
);/**
 * Created by jason on 10/28/14.
 */
