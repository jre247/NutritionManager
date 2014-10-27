'use strict';

//Menu service used for managing  menus
angular.module('core').directive('sideBar', ['$parse', '$compile', function($parse, $compile) {
    return function (scope, element, attr) {
//$(document).ready(function () {
        var collapseTrackerObj = attr.collapsetrackerobject;

        //stick in the fixed 100% height behind the navbar but don't wrap it
        $('#slide-nav.navbar .container').append($('<div id="navbar-height-col"></div>'));

        // Enter your ids or classes
        var toggler = '.navbar-toggle';
        var pagewrapper = '#page-content';
        var navigationwrapper = '.navbar-header';
        var menuwidth = '100%'; // the menu inside the slide menu itself
        var slidewidth = '80%';
        var menuneg = '-100%';
        var slideneg = '-80%';

        collapseTrackerObj = false;


        $("#slide-nav").on("click", toggler, function (e) {
            //collapseTrackerObj = !collapseTrackerObj;

            var selected = $(this).hasClass('slide-active');

            $('#slidemenu').stop().animate({
                left: selected ? menuneg : '0px'
            });

            $('#navbar-height-col').stop().animate({
                left: selected ? slideneg : '0px'
            });

            $(pagewrapper).stop().animate({
                left: selected ? '0px' : slidewidth
            });

            $(navigationwrapper).stop().animate({
                left: selected ? '0px' : slidewidth
            });


            $(this).toggleClass('slide-active', !selected);
            $('#slidemenu').toggleClass('slide-active');


            $('#page-content, .navbar, body, .navbar-header').toggleClass('slide-active');


        });

        $('.navbar-nav a').on("click", function(e){
            collapseTrackerObj = false;
        });

        var selected = '#slidemenu, #page-content, body, .navbar, .navbar-header';


        $(window).on("resize", function () {

            if ($(window).width() > 767 && $('.navbar-toggle').is(':hidden')) {
                $(selected).removeClass('slide-active');
            }


        });
    };
}]);

//});