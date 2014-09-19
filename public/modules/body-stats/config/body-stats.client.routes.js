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
            state('viewBodyStat', {
                url: '/body-stats/:bodyStatId',
                templateUrl: 'modules/body-stats/views/view-body-stat.client.view.html'
            }).
            state('editBodyStat', {
                url: '/body-stats/:bodyStatId/edit',
                templateUrl: 'modules/body-stats/views/edit-body-stat.client.view.html'
            });
    }
]);