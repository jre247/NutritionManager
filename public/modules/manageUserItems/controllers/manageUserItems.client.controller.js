/**
 * Created by jason on 9/4/14.
 */
/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('manageUserItems').controller('ManageUserItemsController', ['$scope', '$stateParams', 'Authentication', '$timeout', 'CoreUtilities', 'ManageUserItems',
    function($scope, $stateParams, Authentication, $timeout, CoreUtilities, ManageUserItems) {
        window.scope = $scope;
        $scope.isLoading = false;

        $scope.update = function() {
            var userFoods = $scope.userFoodsModel;

            userFoods.$save(function () {
                $scope.success = true;

                $timeout(function(){$scope.success = false;}, 3000);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.deleteFood = function(food){
            if (confirm("Are you sure you want to delete this food in your My Foods list?")) {
                for (var i in $scope.userFoodsModel.userFoods) {
                    if ($scope.userFoodsModel.userFoods[i] === food) {
                        $scope.userFoodsModel.userFoods.splice(i, 1);
                    }
                }
            }
        };

        $scope.findOne = function () {
            $scope.isLoading = true;

            $scope.userFoodsModel = ManageUserItems.get({
                userId: user ? user._id : null
            }, function () {

                $scope.isLoading = false;
            });

        };



    }
]);