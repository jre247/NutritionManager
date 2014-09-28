/**
 * Created by jason on 9/12/14.
 */
// I act a repository for the remote friend collection.
angular.module('plans').service(
    "PlansService",
    function( $http, $q ) {

        var planDate;

        // Return public API.
        return({
            getActivityByDate: getActivityByDate
        });


        // ---
        // PUBLIC METHODS.
        // ---

        function getActivityByDate(planDateIn) {
            planDate = planDateIn;

            var request = $http({
                method: "get",
                url: "/activities/" + planDate + '/' + 1,
                params: {
                    action: "get"
                }


            });

            return( request.then( handleActivityByDateSuccess, handleError ) );
        }







        // ---
        // PRIVATE METHODS.
        // ---


        // I transform the successful response, unwrapping the application data
        // from the API response payload.
        function handleActivityByDateSuccess( response ) {

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