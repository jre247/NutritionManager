/**
 * Created by jason on 9/12/14.
 */
// I act a repository for the remote friend collection.
angular.module(ApplicationConfiguration.applicationModuleName).service(
    "CoreUtilities",
    function( $http, $q ) {

        // Return public API.
        return({
            calculateDeficit: calculateDeficit,
            doMealTotaling: doMealTotaling,
            calculatePlanTotalMacros: calculatePlanTotalMacros,
            getFoods: getFoods

        });


        // ---
        // PUBLIC METHODS.
        // ---


        function getFoods(typed) {
            var request = $http({
                method: "get",
                url: "/foods/" + typed + '/' + 10,
                params: {
                    action: "get"
                }


            });

            return( request.then( handleSuccess, handleError ) );
        }

        function calculateDeficit(nutritionPlan, activityPlan, nutritionProfile){
            var bmr = calculateBmr(nutritionProfile);

            var additionalCaloriesExpended = 300;
            var caloriesOut = additionalCaloriesExpended + bmr;

            if (activityPlan && typeof activityPlan == 'object'){
                caloriesOut = activityPlan.totalCaloriesBurned + bmr + additionalCaloriesExpended;

            }

            var caloriesIn = nutritionPlan.totalPlanCalories;

            return -(caloriesIn - caloriesOut);

        };


        // ---
        // PRIVATE METHODS.
        // ---


        //BMR for Men = 66 + (13.8 x weight in kg.) + (5 x height in cm) - (6.8 x age in years)
        //BMR for Women = 655 + (9.6 x weight in kg.) + (1.8 x height in cm) - (4.7 x age in years).
        function calculateBmr(nutritionProfile){
            var age = nutritionProfile.age;
            var weightInLbs = nutritionProfile.weight; //TODO get most recent weight instead of static one
            var heightFeet = nutritionProfile.heightFeet;
            var heightInches = nutritionProfile.heightInches;
            var totalHeight = (heightFeet * 12) + heightInches;
            var gender = nutritionProfile.sex;

            //convert weight from lbs to kg:
            // kg = (weight in lbs) * .454
            var weightInKg = weightInLbs * .454;

            //convert height from inches to cms
            //height in cms = (height in inches * 2.54)
            var heightInCms = totalHeight * 2.54

            var bmr = 0;

            //BMR for Men = 66.47 + (13.75 x weight in kg.) + (5 x height in cm) - (6.75 x age in years)
            if(gender == "Male"){
                bmr = 66.47 + (13.75 * weightInKg) + (5 * heightInCms) - (6.75 * age);
            }
            //BMR for Women = 655 + (9.6 x weight in kg.) + (1.8 x height in cm) - (4.7 x age in years).
            else{
                bmr = 655.09 + (9.56 * weightInKg) + (1.84 * heightInCms) - (4.67 * age);
            }

            return bmr;
        };

        function doMealTotaling(meal){
            var carbsTotal = 0, fatTotal = 0, proteinTotal = 0, caloriesTotal = 0, sodiumTotal = 0;

            for(var i = 0; i < meal.foods.length; i++){
                var foodCarbs = meal.foods[i].carbohydrates;

                carbsTotal += foodCarbs;
                fatTotal += meal.foods[i].fat;
                proteinTotal += meal.foods[i].protein;
                caloriesTotal += meal.foods[i].calories;
                sodiumTotal += meal.foods[i].sodium;
            }

            meal.totalCarbohydrates = carbsTotal;
            meal.totalProtein = proteinTotal;
            meal.totalCalories = caloriesTotal;
            meal.totalFat = fatTotal;
            meal.totalSodium = sodiumTotal;
        };

          function calculatePlanTotalMacros(plan){
            var carbsTotal = 0, fatTotal = 0, proteinTotal = 0, caloriesTotal = 0;

            for (var i = 0; i < plan.meals.length; i++){
                carbsTotal += plan.meals[i].totalCarbohydrates;
                fatTotal += plan.meals[i].totalFat;
                proteinTotal += plan.meals[i].totalProtein;
                caloriesTotal += plan.meals[i].totalCalories;
            }

            plan.totalPlanCarbs = carbsTotal;
            plan.totalPlanFat = fatTotal;
            plan.totalPlanProtein = proteinTotal;
            plan.totalPlanCalories = caloriesTotal;

            //calculate totals as percent
            var macroTotals = carbsTotal + fatTotal + proteinTotal;
            plan.totalPlanCarbsAsPercent = (carbsTotal / macroTotals) * 100;
            plan.totalPlanFatAsPercent = (fatTotal / macroTotals) * 100;
            plan.totalPlanProteinAsPercent = (proteinTotal / macroTotals) * 100;


        };

        function handleSuccess( response ) {

            //dailyDashboardData.activityPlan = response.data;

           // return dailyDashboardData;

            return response.data;
        }


        // I transform the error response, unwrapping the application dta from
        // the API response payload.
        function handleError( response ) {

            // The API response from the server should be returned in a
            // nomralized format. However, if the request was not handled by the
            // server (or what not handles properly - ex. server error), then we
            // may have to normalize it on our end, as best we can.
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );

            }

            // Otherwise, use expected error message.
            return( $q.reject( response.data.message ) );

        }


    }
);