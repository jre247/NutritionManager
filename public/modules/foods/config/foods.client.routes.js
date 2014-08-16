/**
 * Created by jason on 8/10/14.
 */
'use strict';

// Setting up route
angular.module('foods').config(['$stateProvider',
    function($stateProvider) {
        // Foods state routing
        $stateProvider.
            state('listFoods', {
                url: '/foods',
                templateUrl: 'modules/foods/views/list-foods.client.view.html'
            }).
            state('createFood', {
                url: '/foods/create',
                templateUrl: 'modules/foods/views/create-food.client.view.html'
            }).
            state('viewFood', {
                url: '/foods/:foodId',
                templateUrl: 'modules/foods/views/view-food.client.view.html'
            }).
            state('editFood', {
                url: '/foods/:foodId/edit',
                templateUrl: 'modules/foods/views/edit-food.client.view.html'
            });
    }
]);