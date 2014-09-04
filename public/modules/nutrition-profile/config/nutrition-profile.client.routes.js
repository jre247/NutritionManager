/**
 * Created by jason on 9/4/14.
 */
/**
 * Created by jason on 8/10/14.
 */
'use strict';

// Setting up route
angular.module('nutritionProfile').config(['$stateProvider',
    function($stateProvider) {
        // nutritionProfile state routing
        $stateProvider.
            state('listNutritionProfile', {
                url: '/nutritionProfile',
                templateUrl: 'modules/nutrition-profile/views/edit-nutritionProfile.client.view.html'
            });
    }
]);