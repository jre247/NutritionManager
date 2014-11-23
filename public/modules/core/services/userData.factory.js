/**
 * Created by jason on 11/23/14.
 */
angular.module(ApplicationConfiguration.applicationModuleName).factory(
    "UserDataFactory",
    function() {
        var _nutritionProfile;
        var service = {};

        service.getNutritionProfile = function(){
            return _nutritionProfile;
        };

        service.setNutritionProfile = function(nutritionProfileIn){
            _nutritionProfile = nutritionProfileIn;
        };

        return service;


    }
);