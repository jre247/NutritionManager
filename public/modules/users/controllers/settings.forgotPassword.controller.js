/**
 * Created by jason on 12/22/14.
 */
'use strict';

angular.module('users').controller('ForgotPasswordController', ['$scope', '$http', '$location',
    function($scope, $http, $location) {

        // Change user password
        $scope.forgotPasswordSubmit = function() {
            $scope.success = $scope.error = null;

            $http.post('/users/forgotPassword', $scope.passwordDetails).success(function(response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.passwordDetails = null;
            }).error(function(response) {
                $scope.error = response.message;
            });
        };



    }
]);