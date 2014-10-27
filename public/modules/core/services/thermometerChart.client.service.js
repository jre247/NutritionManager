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
            var deficitColor = "rgb(183, 193, 231)";
            var caloriesInColor = "rgb(69, 151, 69)";
            var deficitFocusColor = "rgb(151, 166, 222)";
            var goalsColor = "orange";
            var borderWidth = .3;

            var budgetLineContainer, budgetLine, budgetCircle;

            var emptyRegionRect, deficitSharpEdgesRect, caloriesInSharpEdgesRect, caloriesInRoundEdgesRect;

            var lineLocations, lineScale, lineElement;

            var div;

            //var caloriesIn = 1250;
            //var goalCalories = 1750;
            var deficit = goalCalories - caloriesIn;

            var pixelsPerCalorie = 7.8125;
            var caloriesInWidth = caloriesIn / pixelsPerCalorie;
            var goalCaloriesWidth = goalCalories / pixelsPerCalorie;

            var width = 305;

            var xScale = d3.scale.linear()
                .domain([0, d3.max(data2)])
                .range([0, width]);


            var mouseOverForToolTip = function(elementToIgnore){
                if(elementToIgnore !== 'deficit'){
                    deficitSharpEdgesRect.style("opacity", .4);
                }

                if(elementToIgnore !== 'caloriesIn'){
                    caloriesInSharpEdgesRect.style("opacity", .2)
                    caloriesInRoundEdgesRect.style("opacity", 0)
                }
                if(elementToIgnore !== 'budget'){
                    budgetCircle.style("opacity", .3)
                    budgetLine.style("opacity", .3)
                }

                emptyRegionRect.style("opacity", .4)
            };

            var mouseOutForToolTip = function(elementToIgnore){
                if(elementToIgnore !== 'deficit'){
                    deficitSharpEdgesRect.style("opacity", 1);
                }

                if(elementToIgnore !== 'caloriesIn'){
                    caloriesInSharpEdgesRect.style("opacity", 1)
                    caloriesInRoundEdgesRect.style("opacity", 1)
                }
                if(elementToIgnore !== 'budget'){
                    budgetCircle.style("opacity", 1)
                    budgetLine.style("opacity", 1)
                }

                emptyRegionRect.style("opacity", 1)
            };

            if(!chartElementSelector){
                chartElementSelector = '.budgetChart';
            }


            //Make an SVG Container
            var svgContainer = d3.select(chartElementSelector)
                .attr({
                    width: 340,
                    height: 130
                })


            //Calorie Text Start
            var setupCalorieText = function(){
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
            }

            //Tooltip Start
            var setupToolTip = function(){
                div = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                var tooltipTest = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .text("a simple tooltip");
            }

            var mouseMoveForToolTip = function(){
                return  div.style("left", Math.max(0, d3.event.pageX - 50) + "px")
                    .style("top", (d3.event.pageY + 20) + "px");
            };

            //-------------------- Draw Rects Start ------------------------------------//

            //Draw the empty region Rectangle
            var drawEmptyRegionRect = function(){
                emptyRegionRect = svgContainer.append("rect")
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
            }

            //Draw the deficit sharp edges Rectangle
            var drawDeficitRect = function(){
                deficitSharpEdgesRect = svgContainer.append("rect")
                    .attr({
                        x: caloriesInWidth + 15,
                        y: 50,
                        width: goalCaloriesWidth - caloriesInWidth - 3,
                        height: 40
                    })
                    .on("mousemove", function () {
                        mouseMoveForToolTip();
                    })
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(20)
                            .style("opacity", .9);
                        div.html("<div class='toolTipColorRegion deficitRegion'>&nbsp;</div> <div class='toolTipLbl'>Calories Needed</div>" + "<div class='toolTipValue'>"  + deficit + "</div>")

                        mouseOverForToolTip('deficit');

                        deficitSharpEdgesRect.style("fill", deficitFocusColor)
                    })
                    .on("mouseout", function(d) {
                        mouseOutForToolTip('deficit');
                        deficitSharpEdgesRect.style("fill", deficitColor)

                        div.transition()
                            .duration(50)
                            .style("opacity", 0);
                    })
                    .style("stroke", borderColor)
                    .style("stroke-width", borderWidth)
                    .style("fill", deficitColor);
            }

            //Draw the calories-in sharp edges Rectangle
            var drawCaloriesInSharpEdgesRect = function(){
                caloriesInSharpEdgesRect = svgContainer.append("rect")
                    .attr({
                        x: 15,
                        y: 50,
                        width: caloriesInWidth,
                        height: 40
                    })
                    .on("mousemove", function () {
                        mouseMoveForToolTip();
                    })
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html("<div class='toolTipColorRegion caloriesInRegion'>&nbsp;</div><div class='toolTipLbl'>Calories In</div>" + "<div class='toolTipValue'>"  + caloriesIn + "</div>")

                        mouseOverForToolTip('caloriesIn');

                    })
                    .on("mouseout", function(d) {
                        mouseOutForToolTip('caloriesIn');

                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    .style("stroke", borderColor)
                    .style("stroke-width", borderWidth)
                    .style("fill", caloriesInColor);
            }

            //Draw the calories-in rounded edges Rectangle
            var drawCaloriesInRoundedEdgesRect = function(){
                caloriesInRoundEdgesRect = svgContainer.append("rect")
                    .attr({
                        x: 10,
                        y: 50,
                        rx: 15,
                        ry: 15,
                        width: 15,
                        height: 40
                    })
                    .on("mousemove", function () {
                        mouseOverForToolTip('caloriesIn');

                        div.style("left", Math.max(0, d3.event.pageX - 50) + "px")
                            .style("top", (d3.event.pageY + 20) + "px");
                    })
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html("<div class='toolTipColorRegion caloriesInRegion'>&nbsp;</div><div class='toolTipLbl'>Calories In</div>" + "<div class='toolTipValue'>"  + caloriesIn + "</div>")
                    })
                    .on("mouseout", function(d) {
                        mouseOutForToolTip('caloriesIn');

                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    .style("fill", "rgb(69, 151, 69)");
            }
            //-------------------- Draw Rects End ------------------------------------//

            var drawDottedLines = function(){
                lineLocations = [38, 69, 100, 130]; //represents calories list

                lineScale = d3.scale.linear()
                    .domain([0, d3.max(lineLocations)])
                    .range([0, 269]);

                lineElement = svgContainer.selectAll(".line21")
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
            };

            var drawBudgetCode = function(){
                budgetLineContainer = svgContainer.append("g")
                    .attr("class", "budgetLine");

                //draw budget line
                budgetLine = budgetLineContainer.append("line")
                    .on("mousemove", function () {
                        mouseMoveForToolTip();
                    })
                    .on("mouseover", function(d) {
                        mouseOverForToolTip('budget');

                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html("<div class='toolTipColorRegion goalsRegion'>&nbsp;</div><div class='toolTipLbl'>Goal Calories</div>" + "<div class='toolTipValue'>"  + goalCalories + "</div>")
                    })
                    .on("mouseout", function(d) {
                        mouseOutForToolTip('budget');

                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    .attr("x1", goalCaloriesWidth + 13)
                    .attr("y1", 50)
                    .attr("x2", goalCaloriesWidth + 13)
                    .attr("y2", 90)
                    .attr("stroke-width", 3.5)
                    .attr("stroke", goalsColor);


                //Draw the Budget Circle
                budgetCircle = svgContainer.append("circle")
                    .on("mousemove", function () {
                        mouseMoveForToolTip();
                    })
                    .on("mouseover", function(d) {
                        mouseOverForToolTip('budget');

                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html("<div class='toolTipColorRegion goalsRegion'>&nbsp;</div><div class='toolTipLbl'>Goal Calories</div>" + "<div class='toolTipValue'>"  + goalCalories + "</div>")
                    })
                    .on("mouseout", function(d) {
                        mouseOutForToolTip('budget');

                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    //.attr("cx", 236)
                    .attr("cx", goalCaloriesWidth + 13)
                    .attr("cy", 95)
                    .attr("fill", goalsColor)
                    .attr("r", 6);
            };

            var setUpChartData = function(){
                setupCalorieText();

                setupToolTip();

                drawEmptyRegionRect();
                drawDeficitRect();
                drawCaloriesInSharpEdgesRect();
                drawCaloriesInRoundedEdgesRect();

                drawDottedLines();

                drawBudgetCode();
            };

            setUpChartData();


        };




    }
);