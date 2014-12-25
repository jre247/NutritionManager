
'use strict';

angular.module('progress').controller('ProgressController', ['$scope', '$stateParams', '$location', 'Authentication', 'Progress', 'BodyStats', 'Activities',
    function($scope, $stateParams, $location, Authentication, Progress, BodyStats, Activities) {
        window.scope = $scope;

        $scope.authentication = Authentication;

        $scope.user = Authentication.user;

        $scope.user = user;
        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        $scope.sectionShow = 'weight';


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


        $scope.weightNavClick = function(){
            $scope.sectionShow = 'weight';
        };

        $scope.stepsNavClick = function(){
            $scope.sectionShow = 'steps';
        };

        $scope.advancedWeightNavClick = function(){
            $scope.sectionShow = 'advancedWeight';
        };

        $scope.carbsNavClick = function(){
            $scope.sectionShow = 'carbs';
        };

        $scope.proteinNavClick = function(){
            $scope.sectionShow = 'protein';
        };

        $scope.fatNavClick = function(){
            $scope.sectionShow = 'fat';
        };

        $scope.goClick = function(){
            if($scope.sectionShow == 'weight'){
                $scope.getWeight();
            }
            else if($scope.sectionShow == 'steps'){
                $scope.getSteps();
            }
            else if($scope.sectionShow == 'carbs' || $scope.sectionShow == 'protein' ||
                $scope.sectionShow == 'fat'){
                $scope.getMacros();
            }
            else if($scope.sectionShow == 'advancedWeight'){
                $scope.getAdvancedWeight();
            }
        };

        var getMacrosData = function(plans){
            var fatList = [];
            var carbsList = [];
            var proteinList = [];
            var caloriesList = [];
            var dateList = [];

            for(var i = 0; i < plans.length; i++){
                var dayItem = plans[i];

                var dayDate = dayItem.planDateYear + '-' + (dayItem.planDateMonth + 1) + '-' + dayItem.planDateDay;

                proteinList.push(parseInt(dayItem.totalPlanProteinAsPercent));
                carbsList.push(parseInt(dayItem.totalPlanCarbsAsPercent));
                fatList.push(parseInt(dayItem.totalPlanFatAsPercent));
                caloriesList.push(parseInt(dayItem.totalPlanCalories));
                dateList.push(dayDate);
            }

            var carbsModel = {carbsList: carbsList, datesList: dateList};

            bindCarbsChart(carbsModel);

            var proteinModel = {proteinList: proteinList, datesList: dateList};

            bindProteinChart(proteinModel);

            var fatModel = {fatList: fatList, datesList: dateList};

            bindFatChart(fatModel);
        };

        $scope.getMacros = function(){
            $scope.isMacrosLoading = true;
            var startDateFormatted = $scope.startDate.getFullYear() + '_' + $scope.startDate.getMonth() + '_' + $scope.startDate.getDate();
            var endDateFormatted = $scope.endDate.getFullYear() + '_' + $scope.endDate.getMonth() + '_' + $scope.endDate.getDate();

            $scope.progress = Progress.query({
                    startDate: startDateFormatted,
                    endDate: endDateFormatted
                },
                function(u, getResponseHeaders)
                {
                    var plans = u;

                    getMacrosData(plans);
                    $scope.isMacrosLoading = false;
                }
            );
        };

        $scope.getAdvancedWeight = function() {
            $scope.isAdvancedWeightLoading = true;
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
                        $scope.isAdvancedWeightLoading = false;
                    });
                }
            );
        };

        $scope.getWeight = function(){
            $scope.isWeightLoading = true;
            var startDateFormatted = $scope.startDate.getFullYear() + '_' + $scope.startDate.getMonth() + '_' + $scope.startDate.getDate();
            var endDateFormatted = $scope.endDate.getFullYear() + '_' + $scope.endDate.getMonth() + '_' + $scope.endDate.getDate();

            BodyStats.query({
                    startDate: startDateFormatted,
                    endDate: endDateFormatted
                },
                function(u, getResponseHeaders) {
                    var bodyStats = u;

                    getWeightData(bodyStats);
                    $scope.isWeightLoading = false;
                }
            );
        }

        $scope.getSteps = function(){
            $scope.isStepsLoading = true;
            var startDateFormatted = $scope.startDate.getFullYear() + '_' + $scope.startDate.getMonth() + '_' + $scope.startDate.getDate();
            var endDateFormatted = $scope.endDate.getFullYear() + '_' + $scope.endDate.getMonth() + '_' + $scope.endDate.getDate();

            $scope.steps = Activities.query({
                    startDate: startDateFormatted,
                    endDate: endDateFormatted
            },
            function(u){
                var activities = u;

                var stepsList = [];
                var dateList = [];

                for(var s = 0; s < activities.length; s++){
                    var activity = activities[s];

                    if(activity.dailySteps && activity.dailySteps > 0){
                        stepsList.push(activity.dailySteps);

                        var dayDate = activity.planDateYear + '-' + (activity.planDateMonth + 1) + '-' + activity.planDateDay;

                        dateList.push(dayDate);
                    }
                }

                var stepsModel = {stepsList: stepsList, dateList: dateList};

                bindStepsChart(stepsModel);

                $scope.isStepsLoading = false;
            })

        }

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

        var getWeightData = function(bodyStats){
            var weightList = [];
            var dateListWeight = [];

            for(var w = 0; w < bodyStats.length; w++){
                var bodyStatItem = bodyStats[w];

                weightList.push(bodyStatItem.weight);

                var dayDate = bodyStatItem.planDateYear + '-' + (bodyStatItem.planDateMonth + 1) + '-' + bodyStatItem.planDateDay;

                dateListWeight.push(dayDate);
            }

            var weightModel = {datesList: dateListWeight, weightList: weightList};

            bindWeightChart(weightModel);
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
                        "text":" ",
                        "position":"outer-middle"
                    }
                }
            };

            config.data.types={"Weight":"line"};
            config.size = {width: 955, height: 220};
            $scope.weightChart = c3.generate(config);
        };

        var bindCarbsChart = function(carbs){
            var config = {};
            config.bindto = '#carbsChart';
            config.data = {};

            var tickCount = carbs.carbsList.length;

            if(carbs.carbsList.length >= 7){
                tickCount = 7;
            }

            carbs.carbsList.splice(0, 0, "Carbohydrates");
            carbs.datesList.splice(0, 0, "x");



            config.data = {
                x: 'x',
                columns: [
                    carbs.datesList,
                    carbs.carbsList
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
                        "text":" ",
                        "position":"outer-middle"
                    }
                }
            };

            config.data.types={"Carbohydrates":"line"};
            config.size = {width: 955, height: 220};
            $scope.carbsChart = c3.generate(config);
        };

        var bindProteinChart = function(protein){
            var config = {};
            config.bindto = '#proteinChart';
            config.data = {};

            var tickCount = protein.proteinList.length;

            if(protein.proteinList.length >= 7){
                tickCount = 7;
            }

            protein.proteinList.splice(0, 0, "Protein");
           // protein.datesList.splice(0, 0, "x");



            config.data = {
                x: 'x',
                columns: [
                    protein.datesList,
                    protein.proteinList
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
                        "text":" ",
                        "position":"outer-middle"
                    }
                }
            };

            config.data.types={"Protein":"line"};
            config.size = {width: 955, height: 220};
            $scope.proteinChart = c3.generate(config);
        };

        var bindFatChart = function(fat){
            var config = {};
            config.bindto = '#fatChart';
            config.data = {};

            var tickCount = fat.fatList.length;

            if(fat.fatList.length >= 7){
                tickCount = 7;
            }

            fat.fatList.splice(0, 0, "Fat");
            //fat.datesList.splice(0, 0, "x");



            config.data = {
                x: 'x',
                columns: [
                    fat.datesList,
                    fat.fatList
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
                        "text":" ",
                        "position":"outer-middle"
                    }
                }
            };

            config.data.types={"Fat":"line"};
            config.size = {width: 955, height: 220};
            $scope.fatChart = c3.generate(config);
        };

        var bindStepsChart = function(steps){
            var config = {};
            config.bindto = '#stepsChart';
            config.data = {};

            var stepsList = steps.stepsList;

            var tickCount = stepsList.length;

            if(stepsList.length >= 7){
                tickCount = 7;
            }

            stepsList.splice(0, 0, "Steps");
            steps.dateList.splice(0, 0, "x");



            config.data = {
                x: 'x',
                columns: [
                    steps.dateList,
                    stepsList
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
                    padding: {top: 200, bottom: 0},
                    "label":
                    {
                        "text":" ",
                        "position":"outer-middle"
                    }
                }


            };

            config.data.types={"Steps":"line"};
            config.size = {width: 955, height: 220};
            $scope.stepsChart = c3.generate(config);
        };

    }
]);