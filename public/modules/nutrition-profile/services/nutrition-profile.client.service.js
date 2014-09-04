/**
 * Created by jason on 9/4/14.
 */
/**
 * Created by jason on 8/10/14.
 */
'use strict';

// Nutrition Profile service used for communicating with the Nutrition Profile REST endpoint
angular.module('nutritionProfile').factory('NutritionProfile', ['$resource',
    function($resource) {

            return $resource('nutritionProfile', {
               // nutritionProfileId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });

    }
]);
//
//angular.module('nutritionProfile').factory('NutritionProfile', function($http) {
//    return {
//        get : function() {
//            return $http.get('/api/nutritionProfile');
//        },
//        create : function(nutritionProfile) {
//            return $http.post('/api/nutritionProfile', nutritionProfile);
//        }
//    }
//});