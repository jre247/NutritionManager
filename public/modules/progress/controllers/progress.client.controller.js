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

                        getChartData(plans, bodyStats);

                    });

                   // getChartData(plans);

                }
            );


        };

        var getChartData = function(plans, bodyStats) {
            var fatList = [];
            var carbsList = [];
            var proteinList = [];
            var datesList = [];
            var caloriesList = [];
            var deficitList = [];
            var weightList = [];

            var bodyStatsNonZeroList = [];

            for(var i = 0; i < plans.length; i++){
                var dayItem = plans[i];

                var dayDate = dayItem.planDateYear + '-' + (dayItem.planDateMonth + 1) + '-' + dayItem.planDateDay;

                proteinList.push(parseInt(dayItem.totalPlanProteinAsPercent));
                carbsList.push(parseInt(dayItem.totalPlanCarbsAsPercent));
                fatList.push(parseInt(dayItem.totalPlanFatAsPercent));
                caloriesList.push(parseInt(dayItem.totalPlanCalories));
                deficitList.push(parseInt(dayItem.deficit));
               // weightList.push(parseInt(dayItem.bodyWeight));
                datesList.push(dayDate);

                var isPlanWeightMatchFound = false;

                for(var b = 0; b < bodyStats.length; b++){
                    var bodyStatFromDb = bodyStats[b];

                    if (plans[i].planDateYear == bodyStatFromDb.planDateYear &&
                        plans[i].planDateMonth == bodyStatFromDb.planDateMonth &&
                        plans[i].planDateDay == bodyStatFromDb.planDateDay) {

                        bodyStatsNonZeroList.push(bodyStatFromDb.weight);

                        weightList.push(parseInt(bodyStatFromDb.weight));

                        isPlanWeightMatchFound = true;
                       // break;
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

                    weightList.push(parseInt(mostRecentWeight));

                    bodyStatsNonZeroList.push(mostRecentWeight);
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