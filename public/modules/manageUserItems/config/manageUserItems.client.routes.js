/**
 * Created by jason on 9/4/14.
 */
/**
 * Created by jason on 8/10/14.
 */
'use strict';

// Setting up route
angular.module('manageUserItems').config(['$stateProvider',
    function($stateProvider) {
        // nutritionProfile state routing
        $stateProvider.
            state('listManageUserItems', {
                url: '/manageUserItems',
                templateUrl: 'modules/manageUserItems/views/edit-manageUserItems.client.view.html'
            });
    }
]);