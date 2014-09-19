/**
 * Created by jason on 9/19/14.
 */

'use strict';

//Body Stats service used for communicating with the body stats REST endpoints
angular.module('bodyStats').factory('BodyStats', ['$resource',
    function($resource) {
        return $resource('body-stats/:bodyStatId', {
            bodyStatId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);