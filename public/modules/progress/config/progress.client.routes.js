'use strict';

// Setting up route
angular.module('progress').config(['$stateProvider',
    function($stateProvider) {
        // progress state routing
        $stateProvider.
            state('listProgress', {
                url: '/progress',
                templateUrl: 'modules/progress/views/view-progress.client.view.html'
            }).
            state('createProgress', {
                url: '/progress/create',
                templateUrl: 'modules/progress/views/view-progress.client.view.html'
            }).
            state('viewProgress', {
                url: '/progress/:progressId',
                //templateUrl: 'modules/progress/views/view-progress.client.view.html'
                templateUrl: 'modules/progress/views/view-progress.client.view.html'
            }).
            state('editProgress', {
                url: '/progress/:progressId/edit',
                //templateUrl: 'modules/progress/views/edit-progress.client.view.html'
                templateUrl: 'modules/progress/views/create-progress.client.view.html'
            });
    }
]);