angular.module(ApplicationConfiguration.applicationModuleName).filter('filterFoodsByPartialText', function (CoreUtilities) {
    // function that's invoked each time Angular runs $digest()
    // pass in `item` which is the single Object we'll manipulate
    return function (foodsAry, foodText) {
        var newFoods = CoreUtilities.getFoods(foodText);

        return newFoods.then(getRetrievedFoodsFromDb);
    };

    var getRetrievedFoodsFromDb = function(response){
        return response.data;
    };
});