/**
 * Created by jason on 9/4/14.
 */
/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('manageUserItems').controller('ManageUserItemsController', ['$scope', '$stateParams', 'Authentication', '$timeout', 'CoreUtilities', 'ManageUserItems', '$location',
    function($scope, $stateParams, Authentication, $timeout, CoreUtilities, ManageUserItems, $location) {
        window.scope = $scope;
        $scope.isLoading = false;
        $scope.skipFoods = 0;
        $scope.foodSearchTxt = '';
        $scope.userFoodsDisplay = [];

        $scope.update = function(isDelete) {
            var userFoods = $scope.userFoodsModel;

            userFoods.$save(function () {
                $scope.success = true;

                $timeout(function(){$scope.success = false;}, 3000);

                if(isDelete){
                    $location.path('foods');
                }
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.foodInputChange = function(){
            $scope.userFoodsDisplay = CoreUtilities.filterMyFoods(false, $scope.userFoodsModel.userFoods, $scope.foodSearchTxt, $scope.skipFoods);

        };

        $scope.clearFoodInput = function(){
            $scope.foodSearchTxt = '';

            $scope.userFoodsDisplay = [];

            for(var f = 0; f < $scope.userFoodsModel.userFoods.length; f++){
                $scope.userFoodsDisplay.push($scope.userFoodsModel.userFoods[f]);
            }
        };

        $scope.deleteFood = function(food){
            if (confirm("Are you sure you want to delete this food in your My Foods list?")) {
                //remove food from all user foods
                for (var i in $scope.userFoodsModel.userFoods) {
                    if ($scope.userFoodsModel.userFoods[i] === food) {
                        $scope.userFoodsModel.userFoods.splice(i, 1);
                    }
                }

                //remove food from user foods displayed on screen currently
                for (var i in $scope.userFoodsDisplay) {
                    if ($scope.userFoodsDisplay[i] === food) {
                        $scope.userFoodsDisplay.splice(i, 1);
                    }
                }

                $scope.update(true);
            }
        };

        $scope.findOne = function () {
            $scope.isLoading = true;

            $scope.userFoodsModel = ManageUserItems.get({
                userId: user ? user._id : null
            }, function (data) {
                for(var f = 0; f < data.userFoods.length; f++){
                    $scope.userFoodsDisplay.push(data.userFoods[f]);
                }

                $scope.isLoading = false;


            });

        };



    }
]);