
angular.module('core').directive('budgetThermometerChart', ['$parse', '$compile', function($parse, $compile) {
    var buildThermometerChart = function(element){
        var data2 = [500, 1000, 1500, 2000, 2500]; //reoresents calories list

        var width = 305,
            barHeight = 20;

        var xScale = d3.scale.linear()
            .domain([0, d3.max(data2)])
            .range([0, width]);

//Make an SVG Container
        var svgContainer = d3.select(".budgetChart")
            .attr({
                width: 340,
                height: 110
            })


        //-------------------- Calorie Text Start ------------------------------------//

//draw calorie numbers on top of rect
        var textElement = svgContainer.selectAll("g")
            .data(data2)
            .enter().append("g")

        textElement.append("text")
            .attr("x", function(d) { return xScale(d) + 2; })
            .attr("y", 30)
            .attr("dy", ".65em")
            .text(function(d) { return d; });

//-------------------- Calorie Text End ------------------------------------//










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
            .style("fill", "rgb(230, 227, 227)");


//Draw the calories-in sharp edges Rectangle
        var rectangle = svgContainer.append("rect")
            .attr({
                x: 15,
                y: 50,
                width: 220,
                height: 40
            })
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

//Draw the deficit Rectangle
        var rectangle = svgContainer.append("rect")
            .attr({
                x: 235,
                y: 50,
                width: 44,
                height: 40
            })
            .style("fill", "rgb(183, 193, 231)");

//-------------------- Draw Rects End ------------------------------------//










//-------------------- Dotted Lines Start Code ------------------------------------//
        var lineLocations = [40, 70, 100, 130]; //represents calories list

        var lineScale = d3.scale.linear()
            .domain([0, d3.max(lineLocations)])
            .range([0, 260]);

        var lineElement = svgContainer.selectAll(".line21")
            .data(lineLocations)
            .attr("class", "line1")
            .enter().append("g")

//draw dotted lines along calorie regions
        lineElement.append("line")
            .style("stroke-dasharray", ("10,3")) // make the stroke dashed
            .attr("x1", function(d,i) { return lineScale(d); })
            .attr("y1", 50)
            .attr("x2", function(d,i) { return lineScale(d); })
            .attr("y2", 88)
            .attr("stroke-width", 2)
            .attr("stroke", "black");
//-------------------- Dotted Lines End Code ------------------------------------//










//-------------------- Budget Symbol Code ------------------------------------//
        var budgetLineContainer = svgContainer.append("g")
            .attr("class", "budgetLine");

        var budgetLine = budgetLineContainer.append("line")
            .attr("x1", 236)
            .attr("y1", 50)
            .attr("x2", 236)
            .attr("y2", 90)
            .attr("stroke-width", 2)
            .attr("stroke", "orange");


//Draw the Budget Circle
        var budgetCircle = svgContainer.append("circle")
            .attr("cx", 236)
            .attr("cy", 95)
            .attr("fill", "orange")
            .attr("r", 6);


//-------------------- End Budget Symbol Code ------------------------------------//
    };

    return function(scope, element, attr) {
        buildThermometerChart(element);






        //var startX = 0, startY = 0, x = 0, y = 0;

//        element.css({
//            position: 'relative',
//            border: '1px solid red',
//            backgroundColor: 'lightgrey',
//            cursor: 'pointer'
//        });
//
//        element.on('mousedown', function(event) {
//            // Prevent default dragging of selected content
//            event.preventDefault();
//            startX = event.pageX - x;
//            startY = event.pageY - y;
//            $document.on('mousemove', mousemove);
//            $document.on('mouseup', mouseup);
//        });
//
//        function mousemove(event) {
//            y = event.pageY - startY;
//            x = event.pageX - startX;
//            element.css({
//                top: y + 'px',
//                left:  x + 'px'
//            });
//        }
//
//        function mouseup() {
//            $document.off('mousemove', mousemove);
//            $document.off('mouseup', mouseup);
//        }
    };
}]);










var data2 = [500, 1000, 1500, 2000]; //reoresents calories list

var width = 420,
    barHeight = 20;

var xScale = d3.scale.linear()
    .domain([0, d3.max(data2)])
    .range([0, width]);

//Make an SVG Container
var svgContainer = d3.select(".chart2")
    .attr({
        width: 550,
        height: 300
    })


//-------------------- Calorie Text Start ------------------------------------//

//draw calorie numbers on top of rect 
var textElement = svgContainer.selectAll("g")
    .data(data2)
    .enter().append("g")

textElement.append("text")
    .attr("x", function(d) { return xScale(d) + 2; })
    .attr("y", 30)
    .attr("dy", ".65em")
    .text(function(d) { return d; });

//-------------------- Calorie Text End ------------------------------------//










//-------------------- Draw Rects Start ------------------------------------//

//Draw the empty region Rectangle
var rectangle = svgContainer.append("rect")
    .attr({
        x: 10,
        y: 50,
        rx: 15,
        ry: 15,
        width: 430,
        height: 50
    })
    .style("fill", "rgb(230, 227, 227)");


//Draw the calories-in sharp edges Rectangle
var rectangle = svgContainer.append("rect")
    .attr({
        x: 15,
        y: 50,
        width: 220,
        height: 50
    })
    .style("fill", "rgb(69, 151, 69)");

//Draw the calories-in rounded edges Rectangle
var rectangle = svgContainer.append("rect")
    .attr({
        x: 10,
        y: 50,
        rx: 15,
        ry: 15,
        width: 15,
        height: 50
    })
    .style("fill", "rgb(69, 151, 69)");

//Draw the deficit Rectangle
var rectangle = svgContainer.append("rect")
    .attr({
        x: 235,
        y: 50,
        width: 84,
        height: 50
    })
    .style("fill", "rgb(183, 193, 231)");

//-------------------- Draw Rects End ------------------------------------//










//-------------------- Dotted Lines Start Code ------------------------------------//
var lineLocations = [100, 190, 270, 360]; //represents calories list

var lineScale = d3.scale.linear()
    .domain([0, d3.max(lineLocations)])
    .range([0, 360]);

var lineElement = svgContainer.selectAll(".line21")
    .data(lineLocations)
    .attr("class", "line1")
    .enter().append("g")

//draw dotted lines along calorie regions
lineElement.append("line")
    .style("stroke-dasharray", ("10,3")) // make the stroke dashed
    .attr("x1", function(d,i) { return lineScale(d); })
    .attr("y1", 50)
    .attr("x2", function(d,i) { return lineScale(d); })
    .attr("y2", 100)
    .attr("stroke-width", 2)
    .attr("stroke", "black");
//-------------------- Dotted Lines End Code ------------------------------------//










//-------------------- Budget Symbol Code ------------------------------------//
var budgetLineContainer = svgContainer.append("g")
    .attr("class", "budgetLine");

var budgetLine = budgetLineContainer.append("line")
    .attr("x1", 320)
    .attr("y1", 50)
    .attr("x2", 320)
    .attr("y2", 100)
    .attr("stroke-width", 2)
    .attr("stroke", "orange");


//Draw the Budget Circle
var budgetCircle = svgContainer.append("circle")
    .attr("cx", 320)
    .attr("cy", 105)
    .attr("fill", "orange")
    .attr("r", 6);


//-------------------- End Budget Symbol Code ------------------------------------//