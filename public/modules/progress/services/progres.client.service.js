'use strict';

//progress service used for communicating with the progress REST endpoints
angular.module('progress').factory('Progress', ['$resource',
    function($resource) {
        return $resource('progress/:progressId', {
            progressId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);