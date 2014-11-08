
//(function() {
   // $(function() {
        var $demo, duration, remaining, tour;
        $demo = $("#demo");
        duration = 5000;
        remaining = duration;
        tour = new Tour({
            onStart: function() {

                return $demo.addClass("disabled", true);
            },
            onEnd: function() {
                localStorage.removeItem("tour_current_step");
                localStorage.removeItem("tour_end");

                return $demo.removeClass("disabled", true);

            },
            debug: true,
            steps: [


                {
                    path: "/#!/",
                   // element: "#demo",
                    placement: "bottom",
                    title: "Welcome to Fit2Create!",
                    content: "Welcome to Fit2Create, where you can create your own nutrition and fitness destiny! <br/><br/> This is the home landing page where you can look at overall nutrition, activity, and weight data for the day and week.",
                    backdrop: true,
                    orphan: true
                },
                {
                    path: "/#!/",
                    element: ".weeklyDashboard",
                    placement: "bottom",
                    title: "Weekly Dashboard",
                    content: "This is where you can see nutrition and activity data for a selected week.",
                        //+ "<br/><br/>Right now this is empty because there are currently no plans entered. However, you'll see some fancy charts here once you have at least one plan created.",
                    backdrop: true
                },
                {
                    path: "/#!/",
                    element: ".dailyDashboard",
                    placement: "bottom",
                    title: "Daily Dashboard",
                    content: "This is where you can see nutrition and activity data for a select day.",
                        //+ "<br/><br/>Right now this is empty because there is currently no plan entered for today. After you create a plan for today you'll see some super helpful charts displayed for today!",
                    backdrop: true
                },
                {
                    path: "/#!/",
                    element: "#planDateForDay",
                    placement: "bottom",
                    title: "Plan for Date",
                    content: "You can select the date to see nutrition and activity for that day's plan.",
                    backdrop: true
                },
                {
                    path: "/#!/",
                    element: "#createActivityForDay",
                    placement: "bottom",
                    title: "Create Day Activity",
                    content: "You can click this link to create an activity for the selected day.",
                    backdrop: true
                },
                {
                    path: "/#!/",
                    element: "#createNutritionPlanForDay",
                    placement: "bottom",
                    title: "Create Day Nutrition",
                    content: "You can click this link to create a nutrition plan for the selected day.<br/><br/> We will click this link and go to the create nutrition plan page now.",
                    backdrop: true
                },
                {
                    path: "/#!/plans/create",
                    //element: "#planDateContainer",
                    placement: "bottom",
                    title: "Nutrition Plan Page",
                    content: "Welcome to the nutrition plan page for today. <br/><br/>Here you can manage today's meals by adding foods to each meal, add plan notes, copy plan meals, and much more!<br/>",
                    orphan: true,
                    backdrop: true

                },
                {
                    path: "/#!/plans/create",
                    element: "#planDateContainer",
                    placement: "bottom",
                    title: "Select Plan Date",
                    content: "You can select a custom date for this plan here. Note: This date will default to today's date for a new plan.",
                    backdrop: true

                },
                {
                    path: "/#!/plans/create",
                    element: "#createMeal",
                    placement: "bottom",
                    title: "Add Meal",
                    content: "You can click this button to add a new meal to this plan. <br/><br/>However, there is a way to customize a meals template that you can have as a default for each new plan. For example, if you want 'Breakfast, Lunch, Snack, Dinner' as a default for each new plan then you can set that up in your Nutrition Settings page. We'll get to that in a minute.",
                    backdrop: true,
                    reflex: true
                },
                {
                    path: "/#!/plans/create",
                    element: "#copyPlanBtn",
                    placement: "bottom",
                    title: "Copy Plan!",
                    content: "You can click this button to copy one or more meals from this plan to another plan!",
                    backdrop: true,
                    reflex: true
                },
                {
                    path: "/#!/plans/create",
                    element: ".createMealFood:first",
                    placement: "bottom",
                    title: "Add Food",
                    content: "Each meal has an 'Add Food' button to add a food to that specific meal.",
                    backdrop: true,
                    reflex: true,
                    redirect: true
                    //reflex: true
                },
                {
                    path: "/#!/plans/create",
                    element: ".suggestFoods:first",
                    placement: "bottom",
                    title: "Suggest Foods",
                    content: "Each meal has a suggest button to suggest the top 5 foods that will get you closest to your Nutrient Goals!",
                    backdrop: true,
                    reflex: true
                    //duration: 5000
                },
                {
                    path: "/#!/plans/create",
                    element: "#totalDeficit",
                    placement: "top",
                    title: "Total Plan Deficit and Calories",
                    content: "You can see the total plan deficit and calories right here at any time while modifying a plan."
                    //backdrop: true
                },
                {
                    path: "/#!/plans/create",
                    element: "#totalCarbs",
                    placement: "top",
                    title: "Total Macros",
                    content: "You can see the total plan macros right here at any time while modifying a plan.",
                    reflex: true
                    //backdrop: true
                   // reflex: true
                },
                {
                    path: "/#!/plans/create",
                    element: "#landingPageLink",
                    placement: "right",
                    title: "Landing Page",
                    content: "You can click this Fit2Create link at any time to return to your home landing page."

                },
                {
                    path: "/#!/activities/create",
                    //element: "#landingPageLink",
                    placement: "bottom",
                    title: "Activities Page",
                    content: "Welcome to the Activities page where you can set daily steps, add exercises for today, add activities notes, and track today's injuries.<br/><br/>You can navigate to this page by clicking the 'Create Activity For Today' link on your home landing page",
                    orphan: true,
                    backdrop: true

                },
                {
                    path: "/#!/activities/create",
                    element: "#dailySteps",
                    placement: "bottom",
                    title: "Daily Steps",
                    content: "You can track daily steps here",
                    backdrop: true

                },
                {
                    path: "/#!/activities/create",
                    element: "#addExercise",
                    placement: "bottom",
                    title: "Add Exercise(s)",
                    content: "You can click this button to add one or more exercises for today.",
                    backdrop: true

                },
                {
                    path: "/#!/activities/create",
                    element: "#addNotes",
                    placement: "bottom",
                    title: "Add Notes",
                    content: "You can click this button to add notes for today.",
                    backdrop: true

                },
                {
                    path: "/#!/activities/create",
                    element: "#addInjuries",
                    placement: "bottom",
                    title: "Add Injury",
                    content: "You can click this button to track one or more injuries for today.",
                    backdrop: true

                }




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
        //return $(".gravatar").each(function() {
          //  var $this, email;
          //  $this = $(this);
          //  email = md5($this.data("email"));
           // return $(this).attr("src", "http://www.gravatar.com/avatar/" + email + "?s=60");
        //});
    //});

//}).call(this);
