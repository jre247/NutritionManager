
(function() {
    $(function() {
        var $demo, duration, remaining, tour;
        $demo = $("#demo");
        duration = 5000;
        remaining = duration;
        tour = new Tour({
            onStart: function() {

                return $demo.addClass("disabled", true);
            },
            onEnd: function() {
                return $demo.removeClass("disabled", true);
            },
            debug: true,
            steps: [
                {
                    //path: "/",
                    element: "#demo",
                    placement: "bottom",
                    title: "Welcome to Fit2Create!",
                    content: "Welcome to Fit2Create, where you can create your own nutrition and fitness destiny!",
                    backdrop: true
                },
                {
                    //path: "/",
                    element: "#planDateContainer",
                    placement: "bottom",
                    title: "Select Plan Date",
                    content: "You can select the date for this plan here.",
                    backdrop: true
                },
                {
                    //path: "/",
                    element: "#createMeal",
                    placement: "bottom",
                    title: "Add Meal",
                    content: "You can click this button to add a new meal to this plan.",
                    backdrop: true
                },
                {
                    //path: "/",
                    element: "#copyPlanBtn",
                    placement: "bottom",
                    title: "Copy Plan!",
                    content: "You can click this button to copy one or more meals from this plan to another plan!",
                    backdrop: true
                },
                {
                    //path: "/api",
                    element: ".createMealFood:first",
                    placement: "bottom",
                    title: "Add Food",
                    content: "Each meal has an 'Add Food' button to add a food to that specific meal.",
                    backdrop: true
                    //reflex: true
                },
                {
                    //path: "/api",
                    element: ".suggestFoods:first",
                    placement: "bottom",
                    title: "Suggest Foods",
                    content: "Each meal has a suggest button to suggest the top 5 foods that will get you closest to your Nutrient Goals!",
                    backdrop: true
                    //duration: 5000
                },
                {
                    //path: "/api",
                    element: "#totalDeficit",
                    placement: "top",
                    title: "Total Plan Deficit and Calories",
                    content: "You can see the total plan deficit and calories right here at any time while modifying a plan."
                    //backdrop: true
                },
                {
                    //path: "/api",
                    element: "#totalCarbs",
                    placement: "top",
                    title: "Total Macros",
                    content: "You can see the total plan macros right here at any time while modifying a plan."
                    //backdrop: true
                   // reflex: true
                }
//                {
//                    //path: "/api",
//                    title: "And support for orphan steps",
//                    content: "If you activate the orphan property, the step(s) are shown centered in the page, and you can\nforget to specify element and placement!",
//                    orphan: true,
//                    onHidden: function() {
//                        //return window.location.assign("#!/plans");
//                    }
//                }
            ]
        }).init();
        if (tour.ended()) {
     //       $('<div class="alert alert-info alert-dismissable"><button class="close" data-dismiss="alert" aria-hidden="true">&times;</button>You ended the demo tour. <a href="#" data-demo>Restart the demo tour.</a></div>').prependTo(".content").alert();
        }
        $(document).on("click", "[data-demo]", function(e) {
           // $('#demo').hide();
            e.preventDefault();
            if ($(this).hasClass("disabled")) {
                return;
            }
            tour.restart();
            return $(".alert").alert("close");
        });
        //$("html").smoothScroll();
        return $(".gravatar").each(function() {
            var $this, email;
            $this = $(this);
            email = md5($this.data("email"));
            return $(this).attr("src", "http://www.gravatar.com/avatar/" + email + "?s=60");
        });
    });

}).call(this);
