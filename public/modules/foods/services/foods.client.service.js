/**
 * Created by jason on 8/10/14.
 */
'use strict';

//Foods service used for communicating with the foods REST endpoints
angular.module('foods').factory('Foods', ['$resource',
    function($resource) {
        return $resource('foods/:foodId', {
            foodId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);