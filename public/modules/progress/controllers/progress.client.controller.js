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
        $scope.isLoading = false;

        $scope.durationList = [
            {value: 1, text: '1 Month'},
            {value: 3, text: '3 Months'},
            {value: 6, text: '6 Months'},
            {value: 9, text: '9 Months'},
            {value: 12, text: '1 Year'},

        ];

        $scope.endDate = new Date();
        $scope.startDate = new Date();

        $scope.selectedDurationChange = function(){
            var selectedDuration = $scope.selectedDuration;
            var now = new Date();

            //get last day of current month
            $scope.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            //calculate number of months back from current month
            $scope.startDate = new Date(now.getFullYear(), now.getMonth() - selectedDuration, 1);
        };

        $scope.selectedDuration = $scope.durationList[0].value;
        $scope.selectedDurationChange();

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



        $scope.find = function() {
            $scope.isLoading = true;
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

                        getChartData(plans, bodyStats);
                        $scope.isLoading = false;
                    });
                }
            );
        };

        var getWeightListForPlan = function(bodyStats, plan){
            var isPlanWeightMatchFound = false;
            var bodyStatsNonZeroList = [];
            var weightList = [];

            for(var b = 0; b < bodyStats.length; b++){
                var bodyStatFromDb = bodyStats[b];

                if (plan.planDateYear == bodyStatFromDb.planDateYear &&
                    plan.planDateMonth == bodyStatFromDb.planDateMonth &&
                    plan.planDateDay == bodyStatFromDb.planDateDay) {

                    bodyStatsNonZeroList.push(bodyStatFromDb.weight);

                    weightList.push(bodyStatFromDb.weight);

                    isPlanWeightMatchFound = true;
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

        var getChartData = function(plans, bodyStats) {
            var fatList = [];
            var carbsList = [];
            var proteinList = [];
            var caloriesList = [];
            var dateListCalories = [];
            var dateListDeficit = [];
            var dateListMacros = [];
            var dateListWeight = [];
            var deficitList = [];
            var weightListForMacros = [];
            var weightListForCalories = [];
            var weightListForDeficit = [];
            var weightListForWeight = [];

            for(var i = 0; i < plans.length; i++){
                var dayItem = plans[i];

                var dayDate = dayItem.planDateYear + '-' + (dayItem.planDateMonth + 1) + '-' + dayItem.planDateDay;

                proteinList.push(parseInt(dayItem.totalPlanProteinAsPercent));
                carbsList.push(parseInt(dayItem.totalPlanCarbsAsPercent));
                fatList.push(parseInt(dayItem.totalPlanFatAsPercent));
                caloriesList.push(parseInt(dayItem.totalPlanCalories));
                deficitList.push(parseInt(dayItem.deficit));
                dateListCalories.push(dayDate);
                dateListDeficit.push(dayDate);
                dateListMacros.push(dayDate);


                var planWeightList = getWeightListForPlan(bodyStats, dayItem, true);

                weightListForMacros.push(planWeightList);
                weightListForCalories.push(planWeightList);
                weightListForDeficit.push(planWeightList);

            }

            for(var w = 0; w < bodyStats.length; w++){
                var bodyStatItem = bodyStats[w];

                weightListForWeight.push(bodyStatItem.weight);

                var dayDate = bodyStatItem.planDateYear + '-' + (bodyStatItem.planDateMonth + 1) + '-' + bodyStatItem.planDateDay;

                dateListWeight.push(dayDate);
            }

            var macrosModel = {proteinList: proteinList, carbsList: carbsList, fatList: fatList, datesList: dateListMacros, weightList: weightListForMacros};

            bindMacrosChart(macrosModel);

            var caloriesModel = {caloriesList: caloriesList, datesList: dateListCalories, weightList: weightListForCalories};

            bindCaloriesChart(caloriesModel);

            var deficitModel = {deficitList: deficitList, datesList: dateListDeficit, weightList: weightListForDeficit};

            bindDeficitChart(deficitModel);

            var weightModel = {datesList: dateListWeight, weightList: weightListForWeight};

            bindWeightChart(weightModel);
        };

        var bindDeficitChart = function(deficit){
            var configDeficit = {};
            configDeficit.bindto = '#deficitChart';

            var tickCount = deficit.datesList.length;

            if(deficit.datesList.length >= 7){
                tickCount = 7;
            }

            deficit.deficitList.splice(0, 0, "Deficit");
            deficit.weightList.splice(0, 0, "Weight");
            deficit.datesList.splice(0, 0, "x");

            configDeficit.data = {
                x: 'x',
                    columns: [
                    deficit.datesList,
                    deficit.deficitList,
                    deficit.weightList
                ]
            };

            configDeficit.axis = {
                "x":
                {
                    type: 'timeseries',
                    tick: {
                        count: tickCount,
                        format: '%Y-%m-%d'
                    }
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
            configDeficit.size = {width: 1000, height: 220};
            $scope.deficitChart = c3.generate(configDeficit);
        };

        var bindCaloriesChart = function(calories){
            var configCalories = {};
            configCalories.bindto = '#caloriesChart';
            configCalories.data = {};

            calories.caloriesList.splice(0, 0, "Calories");
            calories.weightList.splice(0, 0, "Weight");
            calories.datesList.splice(0, 0, "x");

            var tickCount = calories.datesList.length;

            if(calories.datesList.length >= 7){
                tickCount = 7;
            }

            configCalories.data = {
                x: 'x',
                columns: [
                    calories.datesList,
                    calories.caloriesList,
                    calories.weightList
                ]
            };


            configCalories.axis = {
                "x":
                {
                    type: 'timeseries',
                    tick: {
                        count: tickCount,
                        format: '%Y-%m-%d'
                    }
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
            configCalories.size = {width: 1000, height: 220};
            $scope.caloriesChart = c3.generate(configCalories);
        };

        var bindMacrosChart = function(macros){
            var configMacros = {};
            configMacros.bindto = '#macrosChart';
            configMacros.data = {};

            macros.proteinList.splice(0, 0, "Protein");
            macros.weightList.splice(0, 0, "Weight");
            macros.carbsList.splice(0, 0, "Carbs");
            macros.fatList.splice(0, 0, "Fat");
            macros.datesList.splice(0, 0, "x");

            var tickCount = macros.datesList.length;

            if(macros.datesList.length >= 7){
                tickCount = 7;
            }



            configMacros.data = {
                x: 'x',
                columns: [
                    macros.datesList,
                    macros.proteinList,
                    macros.carbsList,
                    macros.fatList,
                    macros.weightList
                ]
            };

            configMacros.axis = {
                "x":
                {
                    type: 'timeseries',
                    tick: {
                        count: tickCount,
                        format: '%Y-%m-%d'
                    }
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
            configMacros.size = {width: 1000, height: 220};
            $scope.macrosChart = c3.generate(configMacros);
        };

        var bindWeightChart = function(weight){
            var config = {};
            config.bindto = '#weightChart';
            config.data = {};

            var tickCount = weight.weightList.length;

            if(weight.weightList.length >= 7){
                tickCount = 7;
            }

            weight.weightList.splice(0, 0, "Weight");
            weight.datesList.splice(0, 0, "x");



            config.data = {
                x: 'x',
                columns: [
                    weight.datesList,
                    weight.weightList
                ]
            };

            config.axis = {
                "x":
                {
                    type: 'timeseries',
                    tick: {
                        count: tickCount,
                        format: '%Y-%m-%d'
                    }

                },
                "y":
                {
                    "label":
                    {
                        "text":"Weight (lbs)",
                        "position":"outer-middle"
                    }
                }
            };

            config.data.types={"Weight":"line"};
            config.size = {width: 955, height: 220};
            $scope.weightChart = c3.generate(config);
        };

    }
]);