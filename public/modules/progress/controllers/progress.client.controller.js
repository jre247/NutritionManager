/**
 * Created by jason on 9/20/14.
 */
/**
 * Created by jason on 9/19/14.
 */
'use strict';

angular.module('progress').controller('ProgressController', ['$scope', '$stateParams', '$location', 'Authentication', 'Progress', 'BodyStats',
    function($scope, $stateParams, $location, Authentication, Progress, BodyStats) {
        window.scope = $scope;

        $scope.authentication = Authentication;

        $scope.durationList = [
            {value: 1, text: '1 Month'},
            {value: 3, text: '3 Months'},
            {value: 6, text: '6 Months'},
            {value: 9, text: '9 Months'},
            {value: 12, text: '1 Year'},

        ];

        $scope.selectedDuration = $scope.durationList[0].value;

        $scope.endDate = new Date();
        $scope.startDate = new Date();
        $scope.startDate.setDate($scope.endDate.getDate() - 28);

        $scope.openStartDate = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.startDateOpened = true;
        };

        $scope.openEndDate = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.endDateOpened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.initDate = new Date('2016-15-20');

        $scope.selectedDurationChange = function(){
            var selectedDuration = $scope.selectedDuration;
            var now = new Date();

            //get last day of current month
            $scope.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            //calculate number of months back from current month
            $scope.startDate = new Date(now.getFullYear(), now.getMonth() - selectedDuration, 1);
        };

        $scope.find = function() {
            var startDateFormatted = $scope.startDate.getFullYear() + '_' + $scope.startDate.getMonth() + '_' + $scope.startDate.getDate();
            var endDateFormatted = $scope.endDate.getFullYear() + '_' + $scope.endDate.getMonth() + '_' + $scope.endDate.getDate();

            $scope.progress = Progress.query({
                    startDate: startDateFormatted,
                    endDate: endDateFormatted
                },
                function(u, getResponseHeaders)
                {
                    var plans = u;

                    BodyStats.query({
                        startDate: startDateFormatted,
                        endDate: endDateFormatted
                    },
                    function(u, getResponseHeaders)
                    {
                        var bodyStats = u;
                        var plansFinal = plans;
                        var plansFormatted = false;

                        if(plans.length > 10) {
                            plansFinal = formatPlansDates(plans, bodyStats);
                            plansFormatted = true;
                        }

                        getChartData(plansFinal, bodyStats, plansFormatted);
                    });
                }
            );
        };

        var formatPlansDates = function(plans, bodyStats){
            var formattedPlans = [];
            var yearsSpread = [];

            //figure out the year and month spread
            for(var p = 0; p < plans.length; p++){
                var plan = plans[p];

                var monthWeightList = getWeightListForPlan(bodyStats, plans[p]);

                var planYear = plan.planDateYear;

                if(yearsSpread.length == 0){
                    yearsSpread.push({
                        year: planYear,
                        months: []
                    });

                    yearsSpread[0].months[plan.planDateMonth] = [plan];

                    if(!yearsSpread[0].months[plan.planDateMonth].weightList) {
                        yearsSpread[0].months[plan.planDateMonth].weightList = monthWeightList;
                    }
                    else {
                        yearsSpread[0].months[plan.planDateMonth].weightList.concat(monthWeightList);
                    }
                }
                else {
                    yearsSpread = buildMonthsSpreadForYear(plan, planYear, yearsSpread, monthWeightList);
                }
            }

            //average plan data for months
            for(var y = 0; y < yearsSpread.length; y++) {
                var yearSpreadItem = yearsSpread[y];

                for (var m = 0; m < yearSpreadItem.months.length; m++) {
                    var monthSpreadItem = yearSpreadItem.months[m];

                    if (monthSpreadItem) {
                        var newFormattedPlan = averageMonthSpreadItem(monthSpreadItem);

                        formattedPlans.push(newFormattedPlan);
                    }
                }
            }

            return formattedPlans;
        };

        var buildMonthsSpreadForYear = function(plan, planYear, yearsSpread, monthWeightList){
            for (var y = 0; y < yearsSpread.length; y++) {
                var yearFoundInSpread = false;
                var yearSpreadItem = yearsSpread[y];

                var monthsSpread = yearSpreadItem ? yearSpreadItem.months : [];

                if (yearSpreadItem.year == planYear) {
                    yearFoundInSpread = true;

                    var plansForMonth = monthsSpread[plan.planDateMonth] || [];

                    plansForMonth.push(plan);

                    if(!yearSpreadItem.months) {
                        yearSpreadItem.months[plan.planDateMonth] = plansForMonth;
                    }
                    else{
                        //tack on months to existing months array item
                        if(yearSpreadItem.months[plan.planDateMonth]) {
                            yearSpreadItem.months[plan.planDateMonth].concat(plansForMonth);
                        }
                        //initially set month in months ary
                        else{
                            yearSpreadItem.months[plan.planDateMonth] = plansForMonth;
                        }
                    }

                    if(!yearSpreadItem.months[plan.planDateMonth].weightList) {
                        yearSpreadItem.months[plan.planDateMonth].weightList = monthWeightList;
                    }
                    else{
                        yearSpreadItem.months[plan.planDateMonth].weightList.concat(monthWeightList);
                    }


                }
            }

            if(!yearFoundInSpread){
                yearsSpread.push({
                    year: planYear,
                    months: []
                });

                var len = yearsSpread.length - 1;

                yearsSpread[len].months[plan.planDateMonth] = [plan];

                if(!yearsSpread[len].months[plan.planDateMonth].weightList) {
                    yearsSpread[len].months[plan.planDateMonth].weightList = monthWeightList;
                }
                else{
                    yearSpreadItem.months[plan.planDateMonth].weightList.concat(monthWeightList);
                }
            }

            return yearsSpread;
        };

        var getWeightListForPlan = function(bodyStats, plan, compareDay){
            var isPlanWeightMatchFound = false;
            var bodyStatsNonZeroList = [];
            var weightList = [];

            for(var b = 0; b < bodyStats.length; b++){
                var bodyStatFromDb = bodyStats[b];

                if(!compareDay) {
                    if (plan.planDateYear == bodyStatFromDb.planDateYear &&
                        plan.planDateMonth == bodyStatFromDb.planDateMonth) {

                        bodyStatsNonZeroList.push(bodyStatFromDb.weight);

                        weightList.push(bodyStatFromDb.weight);

                        isPlanWeightMatchFound = true;
                    }
                }
                else{
                    if (plan.planDateYear == bodyStatFromDb.planDateYear &&
                        plan.planDateMonth == bodyStatFromDb.planDateMonth &&
                        plan.planDateDay == bodyStatFromDb.planDateDay) {

                        bodyStatsNonZeroList.push(bodyStatFromDb.weight);

                        weightList.push(bodyStatFromDb.weight);

                        isPlanWeightMatchFound = true;
                    }
                }
            }

            if(!isPlanWeightMatchFound){
                var mostRecentWeight;

                if(bodyStatsNonZeroList.length > 0) {
                    mostRecentWeight = bodyStatsNonZeroList[bodyStatsNonZeroList.length - 1];
                }
                else{
                    mostRecentWeight = bodyStats[0].weight;
                }

                weightList.push(mostRecentWeight);

                bodyStatsNonZeroList.push(mostRecentWeight);
            }

            return weightList;
        };

        var averageMonthSpreadItem = function(monthSpreadItem){
            var proteinTotal = 0;
            var carbsTotal = 0;
            var fatTotal = 0;
            var caloriesTotal = 0;
            var weightTotal = 0;
            var deficitTotal = 0;

            var month = monthSpreadItem[0].planDateMonth;
            var year = monthSpreadItem[0].planDateYear;

            for(var p = 0; p < monthSpreadItem.length; p++){
                var planItem = monthSpreadItem[p];

                proteinTotal += planItem.totalPlanProteinAsPercent;
                carbsTotal += planItem.totalPlanCarbsAsPercent;
                fatTotal += planItem.totalPlanFatAsPercent;
                caloriesTotal += planItem.totalPlanCalories;
                deficitTotal += planItem.deficit;
            }

            for(var w = 0; w < monthSpreadItem.weightList.length; w++){
                weightTotal += monthSpreadItem.weightList[w];
            }

            var newFormattedPlan = {
                planDateYear: year,
                planDateMonth: month,
                planDateDay: 1,
                totalPlanProteinAsPercent: proteinTotal / monthSpreadItem.length,
                totalPlanCarbsAsPercent: carbsTotal / monthSpreadItem.length,
                totalPlanFatAsPercent: fatTotal / monthSpreadItem.length,
                totalPlanCalories: caloriesTotal / monthSpreadItem.length,
                deficit: deficitTotal / monthSpreadItem.length,
                weightList: weightTotal / monthSpreadItem.weightList.length
            };

            return newFormattedPlan;
        };

        var getChartData = function(plans, bodyStats, plansFormatted) {
            var fatList = [];
            var carbsList = [];
            var proteinList = [];
            var datesList = [];
            var caloriesList = [];
            var deficitList = [];
            var weightList = [];

            for(var i = 0; i < plans.length; i++){
                var dayItem = plans[i];

                var dayDate = dayItem.planDateYear + '-' + (dayItem.planDateMonth + 1) + '-' + dayItem.planDateDay;

                proteinList.push(parseInt(dayItem.totalPlanProteinAsPercent));
                carbsList.push(parseInt(dayItem.totalPlanCarbsAsPercent));
                fatList.push(parseInt(dayItem.totalPlanFatAsPercent));
                caloriesList.push(parseInt(dayItem.totalPlanCalories));
                deficitList.push(parseInt(dayItem.deficit));
                datesList.push(dayDate);

                if(!plansFormatted){
                    var planWeightList = getWeightListForPlan(bodyStats, dayItem, true);

                    weightList.push(planWeightList);
                }
                else{
                    weightList.push(dayItem.weightList);
                }
            }

            var macrosModel = {proteinList: proteinList, carbsList: carbsList, fatList: fatList, datesList: datesList, weightList: weightList};

            bindMacrosChart(macrosModel);

            var caloriesModel = {caloriesList: caloriesList, datesList: datesList, weightList: weightList};

            bindCaloriesChart(caloriesModel);

            var deficitModel = {deficitList: deficitList, datesList: datesList, weightList: weightList};

            bindDeficitChart(deficitModel);
        };

        var bindDeficitChart = function(deficit){
            var configDeficit = {};
            configDeficit.bindto = '#deficitChart';
            configDeficit.data = {};
            configDeficit.data.json = {};
            configDeficit.data.json.Deficit = deficit.deficitList;
            configDeficit.data.json.Weight = deficit.weightList;
            configDeficit.axis = {
                "x":
                {
                    type: 'category',
                    categories: deficit.datesList
                },
                "y":
                {
                    "label":
                    {
                        "text":"Deficit",
                        "position":"outer-middle"
                    }
                },
                "y2": {
                    show: true,
                    "label":
                    {
                        "text":"Weight (lbs)",
                        "position":"outer-middle"
                    }
                }
            };

            configDeficit.data.axes = {
                Deficit: 'y',
                Weight: 'y2'
            };

            configDeficit.data.types={"Deficit":"line","Weight":"line"};
            configDeficit.size = {width: 850, height: 220};
            $scope.deficitChart = c3.generate(configDeficit);
        };

        var bindCaloriesChart = function(calories){
            var configCalories = {};
            configCalories.bindto = '#caloriesChart';
            configCalories.data = {};
            configCalories.data.json = {};
            configCalories.data.json.Calories = calories.caloriesList;
            configCalories.data.json.Weight = calories.weightList;
            configCalories.axis = {
                "x":
                {
                    type: 'category',
                    categories: calories.datesList
                },
                "y":
                {
                    "label":
                    {
                        "text":"Calories",
                        "position":"outer-middle"
                    }
                },
                "y2": {
                    show: true,
                    "label":
                    {
                        "text":"Weight (lbs)",
                        "position":"outer-middle"
                    }
                }
            };

            configCalories.data.axes = {
                Calories: 'y',
                Weight: 'y2'
            };

            configCalories.data.types={"Calories":"line","Weight":"line"};
            configCalories.size = {width: 850, height: 220};
            $scope.caloriesChart = c3.generate(configCalories);
        };

        var bindMacrosChart = function(macros){
            var configMacros = {};
            configMacros.bindto = '#macrosChart';
            configMacros.data = {};
            configMacros.data.json = {};
            configMacros.data.json.Protein = macros.proteinList;
            configMacros.data.json.Carbs = macros.carbsList;
            configMacros.data.json.Fat = macros.fatList;
            configMacros.data.json.Weight = macros.weightList;
            configMacros.axis = {
                "x":
                {
                    type: 'category',
                    categories: macros.datesList
                },
                "y":
                {
                    "label":
                    {
                        "text":"Macros",
                        "position":"outer-middle"
                    }
                },
                "y2": {
                    show: true,
                    "label":
                    {
                        "text":"Weight (lbs)",
                        "position":"outer-middle"
                    }
                }
            };
            configMacros.data.axes = {
                Protein: 'y',
                Carbs: 'y',
                Fat: 'y',
                Weight: 'y2'
            };
            configMacros.data.types={"Protein":"line", "Carbs": "line", "Fat": "line","Weight":"line"};
            configMacros.size = {width: 850, height: 220};
            $scope.macrosChart = c3.generate(configMacros);
        };

    }
]);