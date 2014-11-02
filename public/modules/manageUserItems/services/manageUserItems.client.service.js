/**
 * Created by jason on 9/4/14.
 */
/**
 * Created by jason on 8/10/14.
 */
'use strict';

// Nutrition Profile service used for communicating with the Nutrition Profile REST endpoint
angular.module('manageUserItems').factory('ManageUserItems', ['$resource',
    function($resource) {

            return $resource('manageUserItems', {
               // nutritionProfileId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });

    }
]);
