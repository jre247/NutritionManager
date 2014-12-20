/**
 * Created by jason on 9/19/14.
 */
'use strict';

// Setting up route
angular.module('bodyStats').config(['$stateProvider',
    function($stateProvider) {
        // Activities state routing
        $stateProvider.
            state('listBodyStats', {
                url: '/body-stats',
                templateUrl: 'modules/body-stats/views/list-body-stats.client.view.html'
            }).
            state('createBodyStat', {
                url: '/body-stats/create',
                templateUrl: 'modules/body-stats/views/view-body-stat.client.view.html'
            }).
            state('createBodyStat2', {
                url: '/body-stats/create/:planDateForCreate',
                templateUrl: 'modules/body-stats/views/view-body-stat.client.view.html'
            }).

            state('viewBodyStat', {
                url: '/body-stats/:bodyStatId',
                templateUrl: 'modules/body-stats/views/view-body-stat.client.view.html'
            }).
            state('navWeight', {
                url: '/body-stats/nav/:planDateAsConcat',
                templateUrl: 'modules/body-stats/views/edit-nav-body-stats.client.view.html'
            }).
            state('viewWeightWithHistory', {
                url: '/body-stats/nav/:planDateAsConcat/:isHistory',
                templateUrl: 'modules/body-stats/views/edit-nav-body-stats.client.view.html'
            }).
            state('viewBodyStatForDate', {
                url: '/body-stats/:planDate/:planDateChangeDirection/:dayRange',
                templateUrl: 'modules/body-stats/views/view-body-stat.client.view.html'
            });
    }
]);