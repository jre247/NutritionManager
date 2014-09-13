'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Activities', 'CoreService',
	function($scope, Authentication, Activities, CoreService) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

        $scope.activityTypes = [
            {id: 0, type: 0, name: 'Ballet'},
            {id: 1, type: 0, name: 'Baseball'},
            {id: 2, type: 0, name: 'Basketball'},
            {id: 3, type: 0, name: 'Biking'},
            {id: 4, type: 0, name: 'Boxing'},
            {id: 5, type: 0, name: 'Canoeing, Kayaking, or other Rowing'},
            {id: 6, type: 0, name: 'Crossfit'},
            {id: 7, type: 0, name: 'Diving'},
            {id: 8, type: 0, name: 'Football'},
            {id: 9, type: 0, name: 'Hiking'},
            {id: 10, type: 0, name: 'Hockey'},
            {id: 11, type: 0, name: 'Jumping rope'},
            {id: 12, type: 0, name: 'Martial Arts'},
            {id: 13, type: 2, name: 'Meditation'},
            {id: 14, type: 1, name: 'Powerlifting'},
            {id: 15, type: 1, name: 'Rock Climbing'},
            {id: 16, type: 0, name: 'Running'},
            {id: 17, type: 0, name: 'Skateboarding'},
            {id: 18, type: 0, name: 'Skating (Ice or Roller)'},
            {id: 19, type: 0, name: 'Skiing or Snowboarding'},
            {id: 20, type: 0, name: 'Soccer'},
            {id: 21, type: 0, name: 'Stairmaster'},
            {id: 22, type: 3, name: 'Stretching'},
            {id: 23, type: 0, name: 'Surfing'},
            {id: 24, type: 0, name: 'Swimming'},
            {id: 25, type: 0, name: 'Tai Chi'},
            {id: 26, type: 0, name: 'Tennis or other Racket sport'},
            {id: 27, type: 0, name: 'Volleyball'},
            {id: 28, type: 0, name: 'Walking'},
            {id: 29, type: 0, name: 'Water Aerobics'},
            {id: 30, type: 1, name: 'Weight Lifting'},
            {id: 31, type: 0, name: 'Wrestling'},
            {id: 32, type: 3, name: 'Yoga'}

        ];

        $scope.activityTypesDictionary = [];
        for(var i = 0; i < $scope.activityTypes.length; i++) {
            var activityTypeDictModel = {
                name: $scope.activityTypes[i].name,
                type: $scope.activityTypes[i].type
            };

            $scope.activityTypesDictionary.push(activityTypeDictModel);
        }

        $scope.findActivitiesForToday = function() {
            var todaysDate = (new Date()).toUTCString();
            var dt = new Date(todaysDate);
            var year = dt.getFullYear();
            var month = dt.getMonth();
            var day = dt.getDate();

            var planDate = month + '_' + day + '_' + year;

            CoreService.getActivityPlanByDate(planDate).then(function(data){
               $scope.activityPlan = data;
            });



        };

        $scope.findActivitiesForToday();


	}
]);