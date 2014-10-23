/**
 * Created by jason on 9/12/14.
 */
// I act a repository for the remote friend collection.
angular.module('core').service(
    "ThermometerChartService",
    function( $http, $q ) {

        // Return public API.
        return({
            buildThermometerChart: buildThermometerChart
        });


        // ---
        // PUBLIC METHODS.
        // ---

        function buildThermometerChart(caloriesIn, goalCalories, chartElementSelector, isUpdate){
            var data2 = [500, 1000, 1500, 2000, 2500]; //represents calories list

            var borderColor = "rgba(0, 0, 0, 0.39)";
            var borderWidth = .3;

            if(!chartElementSelector){
                chartElementSelector = ".budgetChart";
            }

            //var caloriesIn = 750;
            //var goalCalories = 1750;
            var caloriesFromTarget = goalCalories - caloriesIn;

            var pixelsPerCalorie = 7.8125;
            var caloriesInWidth = caloriesIn / pixelsPerCalorie;
            var goalCaloriesWidth = goalCalories / pixelsPerCalorie;

            var width = 305;

            var xScale = d3.scale.linear()
                .domain([0, d3.max(data2)])
                .range([0, width]);

            //Make an SVG Container
            var svgContainer = d3.select(chartElementSelector)
                .attr({
                    width: 340,
                    height: 115
                });

            if(isUpdate) {
                $(svgContainer[0]).empty();
            }

            //-------------------- Calorie Text Start ------------------------------------//

            //draw calorie numbers on top of rect
            var textElement = svgContainer.selectAll("g")
                .data(data2)
                .enter().append("g")

            textElement.append("text")
                .attr("x", function(d) { return xScale(d) + 2; })
                .attr("y", 30)
                .attr("class", "caloriesLbl")
                .attr("dy", ".65em")
                .text(function(d) { return d; });

            //-------------------- Calorie Text End ------------------------------------//








            //-------------------- Tooltip Start ------------------------------------//
            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var tooltip = d3.select("body")
                .append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .text("a simple tooltip");
            //-------------------- Tooltip End ------------------------------------//









            //-------------------- Draw Rects Start ------------------------------------//

            //Draw the empty region Rectangle
            var rectangle = svgContainer.append("rect")
                .attr({
                    x: 10,
                    y: 50,
                    rx: 15,
                    ry: 15,
                    width: 320,
                    height: 40
                })
                .style("stroke", borderColor)
                .style("stroke-width", borderWidth)
                .style("fill", "rgb(230, 227, 227)");




            //Draw the deficit rounded edges at far left Rectangle
            var rectangle = svgContainer.append("rect")
                .attr({
                    x: 10,
                    y: 50,
                    rx: 15,
                    ry: 15,
                    width: 15,
                    height: 40
                })
                .style("fill", "rgb(183, 193, 231)");

            //Draw the deficit sharp edges Rectangle
            var rectangle = svgContainer.append("rect")
                .attr({
                    x: 15,
                    y: 50,
                    width: goalCaloriesWidth,
                    height: 40
                })
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("Calories Needed:" + "<br/>"  + caloriesFromTarget)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .style("stroke", borderColor)
                .style("stroke-width", borderWidth)
                .style("fill", "rgb(183, 193, 231)");



            //Draw the calories-in sharp edges Rectangle
            var rectangle = svgContainer.append("rect")
                .attr({
                    x: 15,
                    y: 50,
                    width: caloriesInWidth,
                    height: 40
                })
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("Calories In:" + "<br/>"  + caloriesIn)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .style("stroke", borderColor)
                .style("stroke-width", borderWidth)
                .style("fill", "rgb(69, 151, 69)");

            //Draw the calories-in rounded edges Rectangle
            var rectangle = svgContainer.append("rect")
                .attr({
                    x: 10,
                    y: 50,
                    rx: 15,
                    ry: 15,
                    width: 15,
                    height: 40
                })

                .style("fill", "rgb(69, 151, 69)");


            //-------------------- Draw Rects End ------------------------------------//










            //-------------------- Dotted Lines Start Code ------------------------------------//
            var lineLocations = [38, 69, 100, 130]; //represents calories list

            var lineScale = d3.scale.linear()
                .domain([0, d3.max(lineLocations)])
                .range([0, 269]);

            var lineElement = svgContainer.selectAll(".line21")
                .data(lineLocations)
                .attr("class", "line1")
                .enter().append("g")

            //draw dotted lines along calorie regions
            lineElement.append("line")
                .style("stroke-dasharray", ("8,3")) // make the stroke dashed
                .attr("x1", function(d,i) { return lineScale(d); })
                .attr("y1", 50)
                .attr("x2", function(d,i) { return lineScale(d); })
                .attr("y2", 88)
                .attr("stroke-width", .7)
                .attr("stroke", "black");
            //-------------------- Dotted Lines End Code ------------------------------------//










            //-------------------- Budget Symbol Code ------------------------------------//
            var budgetLineContainer = svgContainer.append("g")
                .attr("class", "budgetLine");

            //draw budget line
            var budgetLine = budgetLineContainer.append("line")
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("Goal:" + "<br/>"  + goalCalories)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                // .attr("x1", 236)
                .attr("x1", goalCaloriesWidth + 13)
                .attr("y1", 50)
                //.attr("x2", 236)
                .attr("x2", goalCaloriesWidth + 13)
                .attr("y2", 90)
                .attr("stroke-width", 3.5)
                .attr("stroke", "orange");


            //Draw the Budget Circle
            var budgetCircle = svgContainer.append("circle")
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("Goal:" + "<br/>"  + goalCalories)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                //.attr("cx", 236)
                .attr("cx", goalCaloriesWidth + 13)
                .attr("cy", 95)
                .attr("fill", "orange")
                .attr("r", 6);


            //-------------------- End Budget Symbol Code ------------------------------------//
        };







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