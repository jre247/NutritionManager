'use strict';

angular.module('plans').controller('PlansController', ['$scope', '$stateParams', '$location', '$timeout', 'Authentication', '$modal', '$log', 'Plans', 'Foods', 'NutritionProfile', 'Progress', 'PlansService', 'CoreUtilities', '$routeParams',
	function($scope, $stateParams, $location, $timeout, Authentication, $modal, $log, Plans, Foods, NutritionProfile, Progress, PlansService, CoreUtilities, $routeParams) {
        $scope.user = Authentication.user;

        $scope.user = user;
        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        window.plans = $scope.plans;
        $scope.showPlanEditableErrorMsg = false;
        $scope.showTotalsAsPercent = true;
        $scope.editBtnTxt = "Edit";
        $scope.isEditingEnabled = false;
        $scope.isLoading = false;
        $scope.isMoreLoading = false;

        $scope.currentDeficit = 0;
        $scope.authentication = Authentication;
        $scope.meals = [];
        $scope.skipPlans = 0;
        $scope.hideMorePlansLink = false;
        $scope.navPillSelected = 'today';
        $scope.planDateInput = '';

        $scope.logNavPillSelected = 'foods';

        //$scope.allFoods = Foods.query();
        //TODO: put this in server controller and attach to req obj
        CoreUtilities.getUserFoods(user._id, 'null', 0, false).then(function(data){
            $scope.allFoods = data;
        });

        $scope.allFoodsInitial = [];
        var plansToGet = 14;

        $scope.getMobilePlanDateFormat = function(){
            return CoreUtilities.getMobilePlanDateFormat($scope);
        };

        $scope.getDesktopPlanDateFormat = function(){
            return CoreUtilities.getDesktopPlanDateFormat($scope);
        };



        $scope.foodTypes = [
            {id: 1, type: 'Fruit'},
            {id: 2, type: 'Starch'},
            {id: 3, type: 'Meat'},
            {id: 4, type: 'Liquid'},
            {id: 5, type: 'Vegetable'},
            {id: 6, type: 'Dessert'},
            {id: 7, type: 'Yogurt'},
            {id: 8, type: 'Pizza'},
            {id: 9, type: 'Butter/Oil'},
            {id: 10, type: 'Tofu'},
            {id: 11, type: 'Beans'},
            {id: 12, type: 'Alcohol'},
            {id: 13, type: 'Nuts'}
        ];

        $scope.mealTypes = [
            {id: 1, name: 'Breakfast'},
            {id: 2, name: 'Lunch'},
            {id: 3, name: 'Dinner'},
            {id: 4, name: 'Snack'},
            {id: 5, name: null}
        ];

        $scope.checkIfEmptyPlan = function(){
            if($scope.plan && $scope.plan.meals) {
                var isEmptyPlan = true;

                for (var p = 0; p < $scope.plan.meals.length; p++) {
                    var mealCompare = $scope.plan.meals[p];

                    if (mealCompare.foods.length > 0) {
                        isEmptyPlan = false;
                        break;
                    }
                }

                return isEmptyPlan;
            }
        };

//        $scope.getFoodServingTxt = function(food){
//            var servingDesc;
//
//            if(food.servingType == 0){
//                servingDesc = food.servingDescription1;
//            }
//            else{
//                servingDesc = food.servingDescription2;
//            }
//
//            if(servingDesc.toLowerCase().trim() !== '1 serving'){
//                //transform serving size text to represent number of servings
//                // (i.e. 3 servings would be "3 slices", not "1 slice")
//                var splitTxt = servingDesc.split(' ');
//                var firstSplitItem = splitTxt[0];
//
//                var nFirstElement = parseInt(firstSplitItem);
//
//                var finalServingDesc;
//
//                if(nFirstElement){
//                    var finalServings = nFirstElement * food.servings;
//
//                    var lastElement = servingDesc.slice(-1);
//                    var plural = finalServings > 1 && lastElement !== ')' && servingDesc.indexOf(',') === -1 && lastElement !== 'z' ? 's' : '';
//
//                    finalServingDesc = finalServings + servingDesc.substr(1, servingDesc.length) + plural;
//                }
//
//                return finalServingDesc;
//            }
//        };

        $scope.mealTypeClicked = function(meal){
            meal.isVisible = !meal.isVisible;
        };

        $scope.toggleEditing = function(){
            if (!$scope.isEditingEnabled){
                $scope.isEditingEnabled = true;
                $scope.editBtnTxt = "Done";

                for(var m = 0; m < $scope.plan.meals.length; m++){
                    $scope.plan.meals[m].isEditable = true;
                }
            }
            else{
                $scope.isEditingEnabled = false;
                $scope.editBtnTxt = "Edit";

                for(var m = 0; m < $scope.plan.meals.length; m++){
                    $scope.plan.meals[m].isEditable = false;
                }

                $scope.savePlan();
            }
        };

        $scope.enableSorting = function(){
            $('.panel-group').find('.panel-default').removeClass('disabled');
        };

        $scope.disableSorting = function(){
            $('.panel-group').find('.panel-default').addClass('disabled');
        };

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.initDate = new Date('2016-15-20');

        $scope.sortableStartCallback = function(e, ui) {
            ui.item.data('start', ui.item.index());
        };
        $scope.sortableUpdateCallback = function(e, ui) {
            var start = ui.item.data('start'),
                end = ui.item.index();

            $scope.plan.meals.splice(end, 0,
                $scope.plan.meals.splice(start, 1)[0]);

            $scope.$apply();

           // $scope.savePlan();
        };

        $scope.sortableOptions = {
            start: $scope.sortableStartCallback,
            update: $scope.sortableUpdateCallback
        };

        var getPlanDateAsConcat = function(planDateYear, planDateMonth, planDateDay){
            planDateYear = parseInt(planDateYear);
            planDateMonth = parseInt(planDateMonth);
            planDateDay = parseInt(planDateDay);

            return parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay));
        };



		$scope.create = function() {
            var planDateAsString = new Date($scope.plan.planDateNonUtc);
            var planDate = new Date(planDateAsString);
            var planDateToSave = new Date($scope.plan.planDateNonUtc);
            var planDateYear = planDateToSave.getFullYear();
            var planDateMonth = planDateToSave.getMonth();
            var planDateDay = planDateToSave.getDate();

			var plan = new Plans({
				//planDate: planDateAsString,
                planDateForDB: planDateAsString,
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                notes: $scope.plan.notes,
                planDateAsMili: planDate.getTime(),
                planDateAsConcat: parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),
                meals: $scope.plan.meals
			});
            plan.$save(function(response) {
                plan.planDateNonUtc = new Date(response.planDateAsMili);
				$location.path('plans/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			$scope.plan.planDate = '';
            $scope.plan.meals = [];
		};



        $scope.copyPlan = function(planCopyModel){
            var planDateAsString = planCopyModel.planDate;
            var planDateToSave = new Date(planDateAsString);
            var planDateYear = planDateToSave.getFullYear();
            var planDateMonth = planDateToSave.getMonth();
            var planDateDay = planDateToSave.getDate();

            var plan = new Plans({
                planDateForDB: planCopyModel.planDate,
                planDateAsConcat: parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),
                planDateAsMili: planDateToSave.getTime(),
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                meals: planCopyModel.meals
            });
            plan.$save(function(response) {
                $location.path('plans/' + response._id);
                plan.planDateNonUtc = new Date(response.planDateAsMili);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.createMeal = function(createFoodByDefault, noScrollToBottom){
            var model = {
                name: '',
                type: 1,
                foods: [],
                totalCalories: 0,
                totalCarbohydrates: 0,
                totalFat: 0,
                totalProtein: 0,
                isEditable: true,
                isVisible: true
            };

            $timeout(function(){$scope.setSorting();}, 100);


            $scope.plan.meals.push(model);

            var meal = $scope.plan.meals[$scope.plan.meals.length - 1];

            if(!noScrollToBottom) {
                scrollToBottom();
            }

            if(createFoodByDefault) {
                $scope.createFoodWithDialog(meal, null, true);
            }
            //$scope.createFood(meal);

            //sortableEle.refresh();
        };

        var scrollToBottom = function(){
            $("html, body").animate({ scrollTop: $(document).height() }, 1000);
            $("#content").animate({ scrollTop: $('#content').height() + 700 }, 1000);
        };

//        $scope.editMeal = function(meal){
//           // meal.isEditable = true;
//            meal.isVisible = !meal.isVisible;
//            meal.isMealTypeEditable = true;
//        };
//
//        $scope.saveMeal = function(meal){
//            meal.isMealTypeEditable = false;
//            meal.isVisible = !meal.isVisible;
//        };



        $scope.deleteMeal = function(meal, isMobileDevice){
            if (confirm("Are you sure you want to delete this meal?")) {
                for (var i in $scope.plan.meals) {
                    if ($scope.plan.meals[i] === meal) {
                        $scope.plan.meals.splice(i, 1);
                    }
                }

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);

                if(isMobileDevice){
                    $scope.savePlan(true);
                }
            }
        };

        $scope.collapseAllMeals = function(plan){
            for(var i = 0; i < plan.meals.length; i++){
                var meal = plan.meals[i];
                meal.isVisible = false;
            }
        };

        $scope.saveFood = function(food){
            food.isEditable = false;
        };

        $scope.editFoodClick = function(food){
            for(var i = 0; i < $scope.plan.meals.length; i++){
                for(var j = 0; j < $scope.plan.meals[i].foods.length; j++){
                    $scope.plan.meals[i].foods[j].isEditable = false;
                }
            }

            food.isEditable = true;


            setSelectedFood(food);
        };

        var setSelectedFood = function(food){
            if (!food.selectedFood._id){
                for(var i = 0; i < $scope.allFoods.length; i++){
                    if (food.selectedFood.foodId === $scope.allFoods[i]._id){
                        food.selectedFood = $scope.allFoods[i];
                        break;
                    }
                }
            }
        };

        $scope.editFood = function(food){
            food.isEditable = true;

            setSelectedFood(food);
        };

        $scope.deleteFood = function(food, meal, isMobileDevice){
            if (confirm("Are you sure you want to delete this food?")) {
                for (var nMeal = 0; nMeal < $scope.plan.meals.length; nMeal++) {
                    if ($scope.plan.meals[nMeal] === meal) {
                        for (var nFood = 0; nFood < meal.foods.length; nFood++) {
                            if (meal.foods[nFood] === food) {
                                meal.foods.splice(nFood, 1);
                            }
                        }
                    }
                }

                CoreUtilities.doMealTotaling(meal);

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);

               // if(isMobileDevice){
                    $scope.savePlan();
                //}
            }

        };

		$scope.remove = function(plan) {
			if (plan) {
                plan.$remove();

				for (var i in $scope.plans) {
					if ($scope.plans[i] === plan) {
						$scope.plans.splice(i, 1);
					}
				}
			} else {
				$scope.plan.$remove(function() {
					$location.path('plans');
				});
			}
		};

        $scope.savePlan = function(){
          $scope.showPlanEditableErrorMsg = false;

          for(var i = 0; i < $scope.plan.meals.length; i++){
              var meal = $scope.plan.meals[i];

              meal.isEditable = false;

              for (var j = 0; j < meal.foods.length; j++){
                  var food = meal.foods[j];

                  food.isEditable = false;
              }
          }

          if (!$scope.plan._id){
              $scope.create();
          }
            else{
              $scope.update();
          }

            //callback();
        };

        $scope.deletePlan = function(plan){
            if (confirm("Are you sure you want to delete this plan?")) {
                plan.$delete(function () {
                    console.log("plan deleted");
                    $location.path('plans');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

		$scope.update = function() {
			var plan = $scope.plan;

            var planDateAsString = new Date($scope.plan.planDateNonUtc);
            var planDate = new Date(planDateAsString);
            var planDateToSave = new Date($scope.plan.planDateNonUtc);
            var planDateYear = planDateToSave.getFullYear();
            var planDateMonth = planDateToSave.getMonth();
            var planDateDay = planDateToSave.getDate();

            plan.planDateYear = planDateYear;
            plan.planDateMonth = planDateMonth;
            plan.planDateDay = planDateDay;

            plan.planDateForDBAsDate = $scope.plan.planDateNonUtc;
            plan.planDateAsMili = planDate.getTime();
            plan.planDateAsConcat = parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),

            plan.$update(function(response) {
                plan.planDateNonUtc = new Date(plan.planDateYear, plan.planDateMonth, plan.planDateDay);

				//$location.path('plans/' + plan._id);
                for (var i = 0; i < $scope.plan.meals.length; i++){
                    for (var j = 0; j < $scope.plan.meals[i].foods.length; j++){
                        $scope.plan.meals[i].foods[j].name = $scope.plan.meals[i].foods[j].selectedFood.name;
                        $scope.plan.meals[i].foods[j].type = $scope.plan.meals[i].foods[j].selectedFood.type;
                        $scope.plan.meals[i].foods[j].foodId = $scope.plan.meals[i].foods[j].selectedFood.foodId;
                    }

                    CoreUtilities.doMealTotaling($scope.plan.meals[i]);
                }

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);

                $scope.success = true;
                $timeout(function () {
                    $scope.success = false;
                }, 2500);


                $timeout(function(){$scope.setSorting();}, 100);

                $scope.editBtnTxt = "Edit";

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function(getMorePlans) {
            $scope.navPillSelected = 'history';
            var now = new Date();
            $scope.todayDateAsConcat = getPlanDateAsConcat(now.getFullYear(), now.getMonth(), now.getDate());


            if(!getMorePlans) {
                $scope.isLoading = true;
            }

			$scope.plans = Plans.query({skipPlans: $scope.skipPlans},
                function(data)
                {
                    if(data && data.length > 0) {

                        for (var i = 0; i < $scope.plans.length; i++) {
                            for (var nMeal = 0; nMeal < $scope.plans[i].meals.length; nMeal++) {
                                CoreUtilities.doMealTotaling($scope.plans[i].meals[nMeal]);
                            }

                            CoreUtilities.calculatePlanTotalMacros($scope.plans[i]);

                            var planFullDate = new Date($scope.plans[i].planDateNonUtc);
                            var planDateYear = planFullDate.getFullYear();
                            var planDateMonth = planFullDate.getMonth();
                            var planDateDay = planFullDate.getDate();

                            var planModel = {
                                planDateYear: planDateYear,
                                planDateMonth: planDateMonth,
                                planDateDay: planDateDay,
                                planDateNonUtc: $scope.plans[i].planDateNonUtc || $scope.plans[i].planDate,
                                planDateAsMili: $scope.plans[i].planDateAsMili,
                                planDateAsConcat: $scope.plans[i].planDateAsConcat,
                                calories: $scope.plans[i].totalPlanCalories,
                                protein: $scope.plans[i].totalPlanProtein,
                                carbs: $scope.plans[i].totalPlanCarbs,
                                fat: $scope.plans[i].totalPlanFat,
                                _id: $scope.plans[i]._id
                            };

                            $scope.plansCollection.push(planModel);
                        }

                        if (!getMorePlans) {
                            $scope.isLoading = false;
                        }
                        else {
                            $scope.isMoreLoading = false;
                        }

                        if(data.length < plansToGet){
                            $scope.hideMorePlansLink = true;
                        }
                    }
                    else{
                        $scope.hideMorePlansLink = true;
                        $scope.isMoreLoading = false;
                        $scope.isLoading = false;
                    }

                }
            );


		};

        var setCurrentDeficit = function(){
            var now = new Date(new Date($scope.plan.planDateNonUtc).toUTCString());
            var startDateFormatted = now.getFullYear() + '_' + now.getMonth() + '_' + now.getDate();
            var endDateFormatted = startDateFormatted;

            $scope.progress = Progress.get({
                    progressId: startDateFormatted
                },
                function(u)
                {
                    $scope.currentDeficit = u.deficit || 0;
                }
            );
        };

        var processReturnedPlan = function(){
            $scope.plan.planDateNonUtc = new Date($scope.plan.planDateYear, $scope.plan.planDateMonth, $scope.plan.planDateDay);

            setCurrentDeficit();

            $scope.isUserAdmin = $scope.plan.userRoles && $scope.plan.userRoles.indexOf('admin') !== -1 ? true : false;

            setPlanMealsTotals();

            fillActivityPlan();

            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            var day = now.getDate();

            if(year == $scope.plan.planDateYear && month == $scope.plan.planDateMonth && day == $scope.plan.planDateDay){
                $scope.navPillSelected = 'today';
            }

            $scope.isLoading = false;
        };

        var processNewPlan = function(planDateYear, planDateMonth, planDateDay){
            var planDate;

            if(planDateYear && planDateMonth && planDateDay) {
                planDate = new Date(planDateYear, planDateMonth, planDateDay);
            }
            else{
                planDate = new Date();
            }

            $scope.plan =  {data: null, meals: null, notes: null, planDate: planDate, planDateNonUtc: planDate, planDateYear: planDate.getFullYear(), planDateMonth: planDate.getMonth(), planDateDay: planDate.getDate()  };
            $scope.plan.meals = [];

            $scope.plan.totalPlanCalories = 0;
            $scope.plan.totalPlanCarbsAsPercent = 0;
            $scope.plan.totalPlanFatAsPercent = 0;
            $scope.plan.totalPlanProteinAsPercent = 0;

            if(planDateYear && planDateMonth && planDateDay){
                $scope.plan.planDateAsConcat = getPlanDateAsConcat(planDateYear, planDateMonth, planDateDay);
            }

            //todo use ngRouter instead of this horrible method for extracting url param
            //setPlanDateFromUrlParam();

            //checkIfNewUser();
            $stateParams.planDateForCreate = "";

            createDefaultMealsTemplate();

            fillActivityPlan();

            $scope.plan.moveArrowImgLeft = false;

            $scope.isLoading = false;

            //check for bootstrap tour continue event
            //todo: don't need to specify go to step; just go to whatever tour_current_step is, similar to how i do on dashboard pg
            if(localStorage.tour_current_step =="14") {
                tour.goTo(14);
            }
            else if(localStorage.tour_current_step && !localStorage.tour_end) {
                tour.goTo(6);
            }
        };

        $scope.planInputChange = function(planDateInput){


            var year = planDateInput.getFullYear();
            var month = planDateInput.getMonth();
            var day = planDateInput.getDate();

            var planDateAsConcat = getPlanDateAsConcat(year, month, day);

            window.location = '#!/plans/nav/' + planDateAsConcat + '/true';
           // getPlanFromDb(year, month, day, planDateAsConcat);

            $scope.opened = false;
        };

//        $scope.planInputChange = function(){
//            var year = $scope.plan.planDateNonUtc.getFullYear();
//            var month = $scope.plan.planDateNonUtc.getMonth();
//            var day = $scope.plan.planDateNonUtc.getDate();
//
//            var planDateAsConcat = getPlanDateAsConcat(year, month, day);
//
//            getPlanFromDb(year, month, day, planDateAsConcat);
//
//            $scope.opened = false;
//        };

        var getPlanFromDb = function(year, month, day, planDateAsConcat){
            $scope.nutritionProfile = window.user.nutritionProfile;

            if($stateParams.planDateForCreate){
                processNewPlan(year, month, day);

                $scope.isLoading = false;
            }
            else if(planDateAsConcat){
                $scope.plan = Plans.get({
                    planId: planDateAsConcat
                },function(plan){
                    if(!plan || (plan && !plan.planDateYear)) {
                        processNewPlan(year, month, day);
                    }
                    processReturnedPlan();

                    $scope.isLoading = false;
                });
            }
            else if ($stateParams.planId) {
                $scope.plan = Plans.get({
                    planId: $stateParams.planId
                }, function () {
                    processReturnedPlan();
                });
            }
            else{
                processNewPlan();
            }

            $timeout(function(){$scope.setSorting();}, 100);

        };

        $scope.toggleMealVisibility = function(meal){
            meal.isVisible = !meal.isVisible;
        };

        $scope.toggleDayClick = function(direction){
            $scope.isLoading = true;

            var year = $scope.plan.planDateNonUtc.getFullYear();
            var month = $scope.plan.planDateNonUtc.getMonth();
            var day = $scope.plan.planDateNonUtc.getDate();

            var planDate = new Date(year, month, day);

            if(direction == 'nextDay'){
                planDate = new Date(planDate.setDate(planDate.getDate() + 1));
            }
            else{
                planDate = new Date(planDate.setDate(planDate.getDate() - 1));
            }

            year = planDate.getFullYear();
            month = planDate.getMonth();
            day = planDate.getDate();

            $scope.plan.planDateNonUtc = new Date(year, month, day);

            var planDateAsConcat = getPlanDateAsConcat(year, month, day);

            getPlanFromDb(year, month, day, planDateAsConcat);
        };

        $scope.findOneForNav = function(){
            var now = new Date();
            $scope.todayDateAsConcat = getPlanDateAsConcat(now.getFullYear(), now.getMonth(), now.getDate());


            $scope.isLoading = true;

            var planDateAsConcat;

            //extract year, month, day from date parameter
            if($stateParams.planNavDate) {
                var year, month, day;

                var sDateParam = $stateParams.planNavDate.toString();
                year = sDateParam.substr(0, 4);
                month = sDateParam.substr(4, 2);
                day = sDateParam.substr(6, 2);

                planDateAsConcat = new Date(year, month, day);

                year = planDateAsConcat.getFullYear();
                month = planDateAsConcat.getMonth();
                day = planDateAsConcat.getDate();

                planDateAsConcat = getPlanDateAsConcat(year, month, day);

                if(year === now.getFullYear() && month === now.getMonth() && day === now.getDate()){
                    $scope.navPillSelected = 'today';
                }
                else{
                    $scope.navPillSelected = 'history';
                }
            }

            getPlanFromDb(year, month, day, planDateAsConcat);
        };

        $scope.findOne = function() {
            var now = new Date();
            $scope.todayDateAsConcat = getPlanDateAsConcat(now.getFullYear(), now.getMonth(), now.getDate());


            $scope.isLoading = true;

            $scope.navPillSelected = 'history';

            var planDateAsConcat;

            //extract year, month, day from date parameter
            if($stateParams.planDate || $stateParams.planDateForCreate) {
                var year, month, day;

                var sDateParam = $stateParams.planDate ? $stateParams.planDate.toString() : $stateParams.planDateForCreate.toString();
                year = sDateParam.substr(0, 4);
                month = sDateParam.substr(4, 2);
                day = sDateParam.substr(6, 2);

                planDateAsConcat = new Date(year, month, day);

                year = planDateAsConcat.getFullYear();
                month = planDateAsConcat.getMonth();
                day = planDateAsConcat.getDate();

                planDateAsConcat = getPlanDateAsConcat(year, month, day);


            }

            if(year === now.getFullYear() && month === now.getMonth() && day === now.getDate()){
                $scope.navPillSelected = 'today';
            }

            getPlanFromDb(year, month, day, planDateAsConcat);
        };

        var createDefaultMealsTemplate = function(){
            //create meal template based on what user specified in their nutrition profile
            if($scope.nutritionProfile.templateMeals && $scope.nutritionProfile.templateMeals.length > 0){
                for(var t = 0; t < $scope.nutritionProfile.templateMeals.length; t++){
                    var templateMealItem = $scope.nutritionProfile.templateMeals[t];

                    $scope.createMeal(null, true);

                    $scope.plan.meals[t].isEditable = false;
                    $scope.plan.meals[t].type = $scope.mealTypes[templateMealItem.id - 1].id;
                }
            }
            //create breakfast, lunch, and dinner as default empty meals for plan
            else {
                $scope.createMeal(null, true);
                $scope.createMeal(null, true);
                $scope.createMeal(null, true);

                $scope.plan.meals[0].isEditable = false;
                $scope.plan.meals[1].type = $scope.mealTypes[1].id;
                $scope.plan.meals[1].isEditable = false;
                $scope.plan.meals[2].isEditable = false;
                $scope.plan.meals[2].type = $scope.mealTypes[2].id;
            }
        };

        var setPlanMealsTotals = function(){
            for (var i = 0; i < $scope.plan.meals.length; i++) {
                var carbsTotal = 0, proteinTotal = 0, caloriesTotal = 0, fatTotal = 0, sodiumTotal = 0;

                for (var j = 0; j < $scope.plan.meals[i].foods.length; j++) {
                    $scope.plan.meals[i].foods[j].name = $scope.plan.meals[i].foods[j].selectedFood.name;
                    $scope.plan.meals[i].foods[j].type = $scope.plan.meals[i].foods[j].selectedFood.type;
                    $scope.plan.meals[i].foods[j].foodId = $scope.plan.meals[i].foods[j].selectedFood.foodId;

                    var carbs = $scope.plan.meals[i].foods[j].carbohydrates;

                    carbsTotal += carbs;
                    sodiumTotal += $scope.plan.meals[i].foods[j].sodium;
                    proteinTotal += $scope.plan.meals[i].foods[j].protein;
                    fatTotal += $scope.plan.meals[i].foods[j].fat;
                    caloriesTotal += $scope.plan.meals[i].foods[j].calories;
                }

                $scope.plan.meals[i].totalCarbohydrates = carbsTotal;
                $scope.plan.meals[i].totalCalories = caloriesTotal;
                $scope.plan.meals[i].totalProtein = proteinTotal;
                $scope.plan.meals[i].totalFat = fatTotal;
                $scope.plan.meals[i].totalSodium = sodiumTotal;

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);
            }
        };

        var fillActivityPlan = function(){
            var planDate = new Date($scope.plan.planDateNonUtc);
            var year = planDate.getFullYear();
            var month = planDate.getMonth();
            var day = planDate.getDate();

            var planDateForDb =  month + '_' + day + '_' + year;

            PlansService.getActivityByDate(planDateForDb).then(function(data) {
                $scope.activityPlan = data;
            });
        };



        $scope.foodSelectionChange = function(food, meal){
            food.type = food.selectedFood.type;
            food.calories = food.servings * food.selectedFood.calories;
            food.fat = food.servings * food.selectedFood.fat;
            food.protein = food.servings * food.selectedFood.protein;
            food.carbohydrates = food.servings * food.selectedFood.carbohydrates;
            food.grams = food.servings * food.selectedFood.grams;
            food.sodium = food.servings * food.selectedFood.sodium;
            food.fiber = food.servings * food.selectedFood.fiber;
            food.sugar = food.servings * food.selectedFood.sugar;
            food.saturatedFat = food.servings * food.selectedFood.saturatedFat;
            food.vitaminA = food.servings * food.selectedFood.vitaminA;
            food.vitaminC = food.servings * food.selectedFood.vitaminC;
            food.calcium = food.servings * food.selectedFood.calcium;
            food.iron = food.servings * food.selectedFood.iron;
            food.transfat = food.servings * food.selectedFood.transfat;
            food.cholesterol = food.servings * food.selectedFood.cholesterol;
            food.name = food.selectedFood.name;
            food.selectedFood.foodId = food.selectedFood._id;
            food.type = food.selectedFood.type;

            food.servingDescription1 = food.selectedFood.servingDescription1;
            food.servingDescription2 = food.selectedFood.servingDescription2;
            food.servingGrams1 = food.selectedFood.servingGrams1;
            food.servingGrams2 = food.selectedFood.servingGrams2;
            food.servingType = food.selectedFood.servingType;

            food.foodId = food.selectedFood._id;

            CoreUtilities.doMealTotaling(meal);

            CoreUtilities.calculatePlanTotalMacros($scope.plan);

            //calculate changed deficit
            $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);
        };

        $scope.foodServingsChange = function(food, meal, newServings){

            if(food.servings !== "" && food.servings !== undefined && food.servings !== "undefined") {
                var servings = parseFloat(newServings || food.servings);

                food.calories = servings * food.selectedFood.calories;
                food.fat = servings * food.selectedFood.fat;
                food.protein = servings * food.selectedFood.protein;
                food.carbohydrates = servings * food.selectedFood.carbohydrates;
                food.sodium = servings * food.selectedFood.sodium;
                food.grams = servings * food.selectedFood.grams;

                if(newServings) {
                    for (var m = 0; m < meal.foods.length; m++) {
                        if (meal.foods[m]._id === food._id) {
                            meal.foods[m] = food;
                            meal.foods[m].servings = newServings;
                            break;
                        }
                    }
                }

                CoreUtilities.doMealTotaling(meal);

                CoreUtilities.calculatePlanTotalMacros($scope.plan);

                //calculate changed deficit
                $scope.currentDeficit = CoreUtilities.calculateDeficit($scope.plan, $scope.activityPlan, $scope.nutritionProfile);
            }
        };

        $scope.toggleTotalsAsPercent = function(){
          $scope.showTotalsAsPercent = !$scope.showTotalsAsPercent;
        };

        $scope.toggleMealVisibility = function(meal){
            meal.isVisible = !meal.isVisible;
        };

        $scope.getMealTypeName = function(type){

            var mealTypeName;

            if(type) {
                for (var i = 0; i < $scope.mealTypes.length; i++) {
                    var mealType = $scope.mealTypes[i];

                    if (mealType.id == type) {
                        mealTypeName = mealType.name;
                        break;
                    }
                }
            }

            //handle custom meal type - name already defined in meal model then
           // if(type === 5){
           //     mealTypeName =
           // }

            return mealTypeName;
        };


        var checkIfPlanEditable = function(){
            var isPlanEditable = false;

            for(var i = 0; i < $scope.plan.meals.length; i++){
                for (var j = 0; j < $scope.plan.meals[i].foods.length; j++){
                    var planMeal = $scope.plan.meals[i];
                    var mealFood = planMeal.foods[j];

                    if (planMeal.isEditable || mealFood.isEditable){
                        isPlanEditable = true;
                        break;
                    }


                }
            }

            return isPlanEditable;
        };

        //sorting code
        // data
        $scope.orderByField = 'planDateAsConcat';
        $scope.reverseSort = true;
        $scope.plansCollection = [];

        $scope.setSorting = function(){
            if (!$scope.isEditingEnabled){
                $('.panel-group').find('.panel-default').addClass('disabled');
                $scope.isEditingEnabled = false;
            }
        };



        $scope.nextPlans =function(){
            $scope.isMoreLoading = true;
            $scope.skipPlans += plansToGet;

            $scope.find(true);
        };

        //dialog code
        $scope.openCopyPlanDialog = function (size) {
            var isPlanEditable = checkIfPlanEditable();

            if (!isPlanEditable) {
                $scope.showPlanEditableErrorMsg = false;

                var modalInstance = $modal.open({
                    templateUrl: 'myModalContent.html',
                    controller: PlansService.ModalInstanceCtrl,
                    //size: size,
                    resolve: {
                        dialogMealsShort: function () {
                            var mealsAry = [];

                            for (var i = 0; i < $scope.plan.meals.length; i++) {
                                var mealModel = {};
                                mealModel.id = $scope.plan.meals[i]._id;
                                mealModel.selected = true;

                                var mealType = $scope.mealTypes[$scope.plan.meals[i].type - 1];

                                if (mealType && mealType.id >= 0) {
                                    mealModel.type = mealType.name;
                                }
                                else {
                                    mealModel.type = 'N/A';
                                }

                                mealsAry.push(mealModel);
                            }

                            return mealsAry;
                        },
                        dialogMealsDetailed: function () {
                            return $scope.plan.meals;
                        },
                        parentScope: function () {
                            return $scope;
                        }
                    }
                });

                modalInstance.result.then(function (planCopyModel) {
                    //$scope.dialogSelectedMealType = selectedItem;
                    $scope.copyPlan(planCopyModel);

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }
            else{
                $scope.showPlanEditableErrorMsg = true;
            }
        };


        $scope.createFoodWithDialog = function(mealToUpdate, food){
            var modalInstance = $modal.open({
                templateUrl: 'createFoodModalContent.html',
                controller: PlansService.CreateFoodModalInstanceCtrl,

                resolve: {
                    parentScope: function () {
                        return $scope;
                    },
                    meal: function(){
                        return mealToUpdate;
                    },
                    meals: function(){
                        return $scope.plan.meals;
                    },
                    food: function(){
                        return food;
                    },
                    CoreUtilities: function(){
                        return CoreUtilities;
                    },
                    getMealTypeName: function(){
                        return $scope.getMealTypeName;
                    },
                    mealTypes: function(){
                        return $scope.mealTypes;
                    },
                    userFoods: function(){
                        return $scope.allFoods;
                    },
                    nutritionPlan: function(){
                        return $scope.plan;
                    }
                }
            });

            var checkIfIncrementingServings = function(meal, food){
                //var isServingsUpdated = false;
                var newServings;

                if(meal.foods && meal.foods.length > 0) {
                    //check if just incrementing servings of food since list already has this food
                    for (var m = 0; m < meal.foods.length; m++) {
                        if (meal.foods[m]._id === food._id) {
                            //meal.foods[m].servings += meal.foods[m].servings;
                            meal.foods[m].servings += parseFloat(food.servings);
                            newServings = meal.foods[m].servings;
                            break;
                        }
                    }
                }

                return newServings;
            };

            var instantiateNewFood = function(foodDetails, servingType, servings){
                var food = {
                    _id: foodDetails._id,
                    name: foodDetails.name,
                    calories: foodDetails.calories,
                    carbohydrates: foodDetails.carbohydrates,
                    protein: foodDetails.protein,
                    fat: foodDetails.fat,
                    sodium: foodDetails.sodium,
                    grams: foodDetails.grams,
                    cholesterol: foodDetails.cholesterol,
                    saturatedFat: foodDetails.saturatedFat,
                    sugar: foodDetails.sugar,
                    fiber: foodDetails.fiber,
                    servingGrams2: foodDetails.servingGrams2,
                    servingGrams1: foodDetails.servingGrams1,
                    servingDescription1: foodDetails.servingDescription1,
                    servingDescription2: foodDetails.servingDescription2,
                    servingType: servingType,
                    servings: servings,
                    isEditable: false
                };

                return food;
            };

            modalInstance.result.then(function (selected) {
                if(!selected.isFoodDelete){
                    var meal = selected.mealSelected;
                    var foodDetails = selected.foodToAdd;
                    var isUpdate = selected.isUpdate;

                    var food = instantiateNewFood(foodDetails, selected.servingType, selected.servings);

                    var selectedFoodDefault = instantiateNewFood(foodDetails, selected.servingType, 1);

                    food.selectedFood = foodDetails.selectedFood ? foodDetails.selectedFood : selectedFoodDefault;

                    if(isUpdate) {
                        var isServingsUpdated = false;

                        if(selected.oldFood._id !== food._id){
                            isServingsUpdated = checkIfIncrementingServings(meal, food);
                        }

                        if(!isServingsUpdated) {
                            for (var m = 0; m < meal.foods.length; m++) {
                                if (meal.foods[m]._id === selected.oldFood._id) {
                                    meal.foods[m] = food;
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        var newServings = checkIfIncrementingServings(meal, food);

                        if(!newServings) {
                            selected.mealSelected.foods.push(food);

                            $scope.foodServingsChange(food, meal);

    //                        window.setTimeout(function(){
    //                            food.IsSuggested = true;
    //                        }, 2000);
    //                        window.setTimeout(function(){
    //                            food.IsSuggested = false;
    //                        }, 3000);
                        }
                        else{
                            $scope.foodServingsChange(food, meal, newServings);
                        }
                    }


                }

                $scope.savePlan();

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openNotesDialog = function (notes) {
            var modalInstance = $modal.open({
                templateUrl: 'notesModalContent.html',
                controller: PlansService.NotesModalInstanceCtrl,

                resolve: {
                    parentScope: function () {
                        return $scope;
                    },
                    planNotes: function(){
                        return $scope.plan.notes
                    }
                }
            });

            modalInstance.result.then(function (notesToSave) {
                $scope.plan.notes = notesToSave;
                $scope.savePlan();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
	}
]);

