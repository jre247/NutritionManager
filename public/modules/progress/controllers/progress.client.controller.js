/**
 * Created by jason on 9/20/14.
 */
/**
 * Created by jason on 9/19/14.
 */
'use strict';

angular.module('progress').controller('ProgressController', ['$scope', '$stateParams', '$location', 'Authentication', 'Progress',
    function($scope, $stateParams, $location, Authentication, Progress) {
        window.scope = $scope;

        $scope.authentication = Authentication;

        $scope.endDate = new Date();
        $scope.startDate = new Date();
        $scope.startDate.setDate($scope.endDate.getDate() - 7);

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

                    getChartData(plans);

                }
            );


        };

        var getChartData = function(plans) {
            var fatList = [];
            var carbsList = [];
            var proteinList = [];
            var datesList = [];
            var caloriesList = [];
            var deficitList = [];

            for(var i = 0; i < plans.length; i++){
                var dayItem = plans[i];

                var dayDate = dayItem.planDateYear + '-' + (dayItem.planDateMonth + 1) + '-' + dayItem.planDateDay;

                proteinList.push(parseInt(dayItem.totalPlanProteinAsPercent));
                carbsList.push(parseInt(dayItem.totalPlanCarbsAsPercent));
                fatList.push(parseInt(dayItem.totalPlanFatAsPercent));
                caloriesList.push(parseInt(dayItem.totalPlanCalories));
                deficitList.push(parseInt(dayItem.deficit));
                datesList.push(dayDate);
            }

            var macrosModel = {proteinList: proteinList, carbsList: carbsList, fatList: fatList, datesList: datesList};

            bindMacrosChart(macrosModel);

            var caloriesModel = {caloriesList: caloriesList, datesList: datesList};

            bindCaloriesChart(caloriesModel);

            var deficitModel = {deficitList: deficitList, datesList: datesList};

            bindDeficitChart(deficitModel);
        };

        var bindDeficitChart = function(deficit){
            var configDeficit = {};
            configDeficit.bindto = '#deficitChart';
            configDeficit.data = {};
            configDeficit.data.json = {};
            configDeficit.data.json.Deficit = deficit.deficitList;
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
                        "text":"",
                        "position":"outer-middle"
                    }
                }
            };
            configDeficit.data.types={"Deficit":"line"};
            configDeficit.size = {width: 850, height: 220};
            $scope.deficitChart = c3.generate(configDeficit);
        };

        var bindCaloriesChart = function(calories){
            var configCalories = {};
            configCalories.bindto = '#caloriesChart';
            configCalories.data = {};
            configCalories.data.json = {};
            configCalories.data.json.Calories = calories.caloriesList;
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
                        "text":"",
                        "position":"outer-middle"
                    }
                }
            };
            configCalories.data.types={"Calories":"line"};
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
                        "text":"",
                        "position":"outer-middle"
                    }
                }
            };
            configMacros.data.types={"Protein":"line", "Carbs": "line", "Fat": "line"};
            configMacros.size = {width: 850, height: 220};
            $scope.macrosChart = c3.generate(configMacros);
        };
    }
]);