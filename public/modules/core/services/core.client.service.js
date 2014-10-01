/**
 * Created by jason on 9/12/14.
 */
// I act a repository for the remote friend collection.
angular.module('core').service(
    "CoreService",
    function( $http, $q ) {

        var planDate, weeklyPlanDate;
        var dailyDashboardData = {};
        var weeklyDashboardData = {};

        // Return public API.
        return({
            getDailyDashboardData: getDailyDashboardData,
            getWeeklyDashboardData: getWeeklyDashboardData
        });


        // ---
        // PUBLIC METHODS.
        // ---

        function getDailyDashboardData(planDateIn) {
            planDate = planDateIn;

            var request = $http({
                method: "get",
                url: "/plans/" + planDate + '/' + 1,
                params: {
                    action: "get"
                }


            });

            return( request.then( handleNutritionPlanSuccess, handleError ) );
        }

        function getWeeklyDashboardData(planDateIn) {
            weeklyPlanDate = planDateIn;


            var request = $http({
                method: "get",
                url: "/plans/" + weeklyPlanDate + '/' + 7,
                params: {
                    action: "get"
                }
            });

            return( request.then( handleWeeklyNutritionPlanSuccess, handleError ) );
        }






        // ---
        // PRIVATE METHODS.
        // ---


        // I transform the successful response, unwrapping the application data
        // from the API response payload.
        function handleNutritionPlanSuccess( response ) {

            dailyDashboardData.nutritionPlan = response.data;

            var request = $http({
                method: "get",
                url: "/activities/" + planDate + '/' + 1,
                params: {
                    action: "get"
                }
            });

            return( request.then( handleActivityPlanSuccess, handleError ) );
        }

        // I transform the successful response, unwrapping the application data
        // from the API response payload.
        function handleWeeklyNutritionPlanSuccess( response ) {

            weeklyDashboardData.weeklyNutritionPlan = response.data;

            return weeklyDashboardData;
        }

        function handleActivityPlanSuccess( response ) {

            dailyDashboardData.activityPlan = response.data;

            return dailyDashboardData;
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