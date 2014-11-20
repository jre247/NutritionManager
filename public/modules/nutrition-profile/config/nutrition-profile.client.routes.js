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
            }).
            state('nutritionTargets', {
                url: '/nutritionProfile/nutrientTargets',
                templateUrl: 'modules/nutrition-profile/views/nutritionTargets.client.view.html'
            }).
            state('bodyInfo', {
                url: '/nutritionProfile/bodyInfo',
                templateUrl: 'modules/nutrition-profile/views/bodyInfo.client.view.html'
            }).
            state('mealsTemplate', {
                url: '/nutritionProfile/mealsTemplate',
                templateUrl: 'modules/nutrition-profile/views/mealsTemplate.client.view.html'
            }).
            state('customizations', {
                url: '/nutritionProfile/customizations',
                templateUrl: 'modules/nutrition-profile/views/customizations.client.view.html'
            });
    }
]);