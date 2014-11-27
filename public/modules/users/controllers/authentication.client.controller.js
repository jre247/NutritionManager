'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'UserDataFactory', 'NutritionProfile', 'NutritionProfileUtilities',
	function($scope, $http, $location, Authentication, UserDataFactory, NutritionProfile, NutritionProfileUtilities) {
		$scope.authentication = Authentication;

        $scope.nutritionProfile = {isAdvancedNutrientTargets: false};

        $scope.isAdvancedNutrientTargets = false;
        $scope.macrosRatioSelected = 0;
        $scope.nutrientTargetSettings = 'basic';
        $scope.isMacrosValid = true;

        $scope.userAuthenticated = true;

        $scope.templateMeals = [
            {id: 1, name: 'Breakfast'},
            {id: 2, name: 'Lunch'},
            {id: 3, name: 'Dinner'}
        ];

        $scope.activityLevels = [
            {id: 0, name: 'Sedentary'},
            {id: 1, name: 'Lightly Active'},
            {id: 2, name: 'Moderately Active'},
            {id: 3, name: 'Very Active'},
            {id: 4, name: 'Extremely Active'}
        ];

        $scope.weeklyFatLossRate = [
            {id: 250, name: '0.5 Pounds Per Week'},
            {id: 500, name: '1 Pound Per Week'},
            {id: 1000, name: '2 Pounds Per Week'},
        ];

        $scope.macrosRatios = [
            {id: 0, name: '20/40/40 - Protein, Carbs, Fat'},
            {id: 1, name: '20/30/50 - Protein, Carbs, Fat'},
            {id: 2, name: 'Atkins Diet'},
            {id: 3, name: 'South Beach Diet'}
        ];

        $scope.sexOptions = [
            'Male',
            'Female'
        ];

        $scope.heightFeetOptions = [ 1, 2, 3, 4, 5, 6, 7, 8];
        $scope.heightInchesOptions = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];


        $scope.nutrientTargetSettingsChange = function(nutritionTargetSettings){
            NutritionProfileUtilities.nutrientTargetSettingsChange($scope, nutritionTargetSettings);

        };

        $scope.validateNutritionTargets = function(isUpdate, isBasicNutritionSettingsChangeTo){
            var isValid = NutritionProfileUtilities.validateNutritionTargets(isUpdate, isBasicNutritionSettingsChangeTo, $scope);

            return isValid;
        };

        $scope.isValid = true;
        $scope.macroChange = function(){
            $scope.isValid = $scope.validateNutritionTargets();


        };


        $scope.displaySection = 'userInfo';

        $scope.userAuthenticated = false;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

        $scope.userInfoNext = function(){
            $scope.displaySection = 'bodyInfo';
        };


        $scope.bodyInfoNext = function(){
            $scope.displaySection = 'targets';
        };
        $scope.bodyInfoBack = function(){
            $scope.displaySection = 'userInfo';
        };

        $scope.targetsNext = function(){
            $scope.displaySection = 'mealsTemplate';
        };
        $scope.targetsBack = function(){
            $scope.displaySection = 'bodyInfo';
        };

        $scope.mealsTemplateBack = function(){
            $scope.displaySection = 'targets';
        };

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				//If successful we assign the response to the global user model
				$scope.authentication.user = response;
                window.user = response;

                //$scope.nutritionProfile = NutritionProfile.get(function (data) {
                    //UserDataFactory.setNutritionProfile = data;
                 //   window.nutritionProfile = data;
                //    $scope.authentication.nutritionProfile = data;

                    //And redirect to the index page
                //    $location.path('/dashboard');
                //});

                $location.path('/dashboard');


			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				//If successful we assign the response to the global user model
				$scope.authentication.user = response;
                window.user = response;

//                $scope.nutritionProfile = NutritionProfile.get(function (data) {
//                    //UserDataFactory.setNutritionProfile(data);
//                    window.nutritionProfile = data;
//                    $scope.authentication.nutritionProfile = data;
//
//                    //And redirect to the index page
//                    $location.path('/dashboard');
//                });

                $location.path('/dashboard');

			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);