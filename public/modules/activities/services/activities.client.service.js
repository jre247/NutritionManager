/**
 * Created by jason on 9/9/14.
 */

'use strict';

//Activities service used for communicating with the activities REST endpoints
angular.module('activities').factory('Activities', ['$resource',
    function($resource) {
        return $resource('activities/:activityId', {
            activityId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);