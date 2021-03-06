'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'nutrition-manager';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngAnimate',
        'ui.router',
        'ui.bootstrap',
        'ui.utils'
    ];
    // Add a new vertical module
    var registerModule = function (moduleName) {
        // Create angular module
        angular.module(moduleName, []);
        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
}();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
    '$locationProvider',
    function ($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_')
        window.location.hash = '#!';
    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('plans');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('foods');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Configuring the Plans module
angular.module('plans').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Plans', 'plans', 'dropdown', '/plans(/create)?');
        Menus.addSubMenuItem('topbar', 'plans', 'List Plans', 'plans');
        Menus.addSubMenuItem('topbar', 'plans', 'New Plan', 'plans/create');
    }
]);
// Configuring the Articles module
angular.module('foods').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Foods', 'foods', 'dropdown', '/foods(/create)?');
        Menus.addSubMenuItem('topbar', 'foods', 'List Foods', 'foods');
        Menus.addSubMenuItem('topbar', 'foods', 'New Food', 'foods/create');
    }
]);'use strict';
// Setting up route
angular.module('plans').config(['$stateProvider',
    function($stateProvider) {
        // Plans state routing
        $stateProvider.
            state('listPlans', {
                url: '/plans',
                templateUrl: 'modules/plans/views/list-plans.client.view.html'
            }).
            state('createPlan', {
                url: '/plans/create',
                templateUrl: 'modules/plans/views/view-plan.client.view.html'
            }).
            state('viewPlan', {
                url: '/plans/:planId',
                //templateUrl: 'modules/plans/views/view-plan.client.view.html'
                templateUrl: 'modules/plans/views/view-plan.client.view.html'
            }).
            state('editPlan', {
                url: '/plans/:planId/edit',
                //templateUrl: 'modules/plans/views/edit-plan.client.view.html'
                templateUrl: 'modules/plans/views/create-plan.client.view.html'
            });
    }
]);'use strict';
'use strict';

angular.module('plans').controller('PlansController', ['$scope', '$stateParams', '$location', '$timeout', 'Authentication', '$modal', '$log', 'Plans', 'Foods',
    function($scope, $stateParams, $location, $timeout, Authentication, $modal, $log, Plans, Foods) {
        window.scope = $scope;
        window.plans = $scope.plans;
        $scope.showTotalsAsPercent = false;

        $scope.authentication = Authentication;
        $scope.meals = [];


        $scope.allFoods = Foods.query();

        $scope.mealTypes = [
            {id: 1, name: 'Breakfast'},
            {id: 2, name: 'Lunch'},
            {id: 3, name: 'Dinner'},
            {id: 4, name: 'Snack'}
        ];

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


        $scope.create = function() {
            var plan = new Plans({
                planDate: $scope.plan.planDate,
                meals: $scope.plan.meals
            });
            plan.$save(function(response) {
                $location.path('plans/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            $scope.plan.planDate = '';
            $scope.plan.meals = [];
        };

        $scope.copyPlan = function(planCopyModel){
            var plan = new Plans({
                planDate: planCopyModel.planDate,
                meals: planCopyModel.meals
            });
            plan.$save(function(response) {
                $location.path('plans/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.createMeal = function(){
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

            $scope.plan.meals.push(model);

            var meal = $scope.plan.meals[$scope.plan.meals.length - 1];

            $scope.createFood(meal);
        };

        $scope.editMeal = function(meal){
            meal.isEditable = true;
            meal.isVisible = !meal.isVisible;
        };

        $scope.saveMeal = function(meal){
            meal.isEditable = false;
            meal.isVisible = !meal.isVisible;
        };

        $scope.deleteMeal = function(meal){
            for (var i in $scope.plan.meals) {
                if ($scope.plan.meals[i] === meal) {
                    $scope.plan.meals.splice(i, 1);
                }
            }

            calculatePlanTotalMacros($scope.plan);
        };

        $scope.createFood = function(meal){
            var model = {
                name: '',
                type: '',
                servings: 1,
                calories: 0,
                grams: 0,
                protein: 0,
                carbohydrates: 0,
                fat: 0,
                foodId: '',
                isEditable: true
            };

            meal.foods.push(model);
        };

        $scope.saveFood = function(food){
            food.isEditable = false;
        };

        $scope.editFoodClick = function(food){
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

        $scope.saveAll = function(meal){
            for(var food = 0; food < meal.foods.length; food++){
                meal.foods[food].isEditable = false;
            }

            meal.isEditable = false;
        };

        $scope.editFood = function(food){
            food.isEditable = true;

            setSelectedFood(food);
        };

        $scope.deleteFood = function(food, meal){
            for(var nMeal = 0; nMeal < $scope.plan.meals.length; nMeal++){
                if ($scope.plan.meals[nMeal] === meal){
                    for (var nFood = 0; nFood < meal.foods.length; nFood++){
                        if (meal.foods[nFood] === food) {
                            meal.foods.splice(nFood, 1);
                        }
                    }
                }
            }

            doMealTotaling(meal);

            calculatePlanTotalMacros($scope.plan);

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
            if (!$scope.plan._id){
                $scope.create();
            }
            else{
                $scope.update();
            }
        };

        $scope.update = function() {
            var plan = $scope.plan;

            plan.$update(function() {
                //$location.path('plans/' + plan._id);
                for (var i = 0; i < $scope.plan.meals.length; i++){
                    for (var j = 0; j < $scope.plan.meals[i].foods.length; j++){
                        $scope.plan.meals[i].foods[j].name = $scope.plan.meals[i].foods[j].selectedFood.name;
                        $scope.plan.meals[i].foods[j].type = $scope.plan.meals[i].foods[j].selectedFood.type;
                        $scope.plan.meals[i].foods[j].foodId = $scope.plan.meals[i].foods[j].selectedFood.foodId;
                    }

                    doMealTotaling($scope.plan.meals[i]);
                }

                calculatePlanTotalMacros($scope.plan);

                $scope.success = true;

                $timeout(function(){$scope.success = false;}, 3000);

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function() {
            $scope.plans = Plans.query(
                function(u, getResponseHeaders)
                {
                    for(var i = 0; i < $scope.plans.length; i++) {
                        for (var nMeal = 0; nMeal < $scope.plans[i].meals.length; nMeal++){
                            doMealTotaling($scope.plans[i].meals[nMeal]);
                        }

                        calculatePlanTotalMacros($scope.plans[i]);

                        var planModel = {
                            planDate: $scope.plans[i].planDate,
                            calories: $scope.plans[i].totalPlanCalories,
                            protein: $scope.plans[i].totalPlanProtein,
                            carbs: $scope.plans[i].totalPlanCarbs,
                            fat: $scope.plans[i].totalPlanFat,
                            _id: $scope.plans[i]._id
                        }

                        $scope.plansCollection.push(planModel);
                    }
                }
            );


        };

        $scope.findOne = function() {
            if ($stateParams.planId) {
                $scope.plan = Plans.get({
                    planId: $stateParams.planId
                }, function (u, getResponseHeaders) {
                    for (var i = 0; i < $scope.plan.meals.length; i++) {
                        var carbsTotal = 0, proteinTotal = 0, caloriesTotal = 0, fatTotal = 0;

                        for (var j = 0; j < $scope.plan.meals[i].foods.length; j++) {
                            $scope.plan.meals[i].foods[j].name = $scope.plan.meals[i].foods[j].selectedFood.name;
                            $scope.plan.meals[i].foods[j].type = $scope.plan.meals[i].foods[j].selectedFood.type;
                            $scope.plan.meals[i].foods[j].foodId = $scope.plan.meals[i].foods[j].selectedFood.foodId;

                            var carbs = $scope.plan.meals[i].foods[j].carbohydrates;

                            carbsTotal += carbs;
                            proteinTotal += $scope.plan.meals[i].foods[j].protein;
                            fatTotal += $scope.plan.meals[i].foods[j].fat;
                            caloriesTotal += $scope.plan.meals[i].foods[j].calories;
                        }

                        $scope.plan.meals[i].totalCarbohydrates = carbsTotal;
                        $scope.plan.meals[i].totalCalories = caloriesTotal;
                        $scope.plan.meals[i].totalProtein = proteinTotal;
                        $scope.plan.meals[i].totalFat = fatTotal;

                        calculatePlanTotalMacros($scope.plan);
                    }
                });
            }
            else{
                $scope.plan =  {data: null, meals: null};
                $scope.plan.meals = [];
            }
        };

        $scope.foodSelectionChange = function(food){
            food.type = food.selectedFood.type;
            food.calories = food.servings * food.selectedFood.calories;
            food.fat = food.servings * food.selectedFood.fat;
            food.protein = food.servings * food.selectedFood.protein;
            food.carbohydrates = food.servings * food.selectedFood.carbohydrates;
            food.grams = food.servings * food.selectedFood.grams;

            food.name = food.selectedFood.name;
            food.selectedFood.foodId = food.selectedFood._id;
            food.type = food.selectedFood.type;

            food.foodId = food.selectedFood._id;
        };

        $scope.foodServingsChange = function(food, meal){

            food.calories = food.servings * food.selectedFood.calories;
            food.fat = food.servings * food.selectedFood.fat;
            food.protein = food.servings * food.selectedFood.protein;
            food.carbohydrates = food.servings * food.selectedFood.carbohydrates;
            food.grams = food.servings * food.selectedFood.grams;

            doMealTotaling(meal);

            calculatePlanTotalMacros($scope.plan);
        };

        var doMealTotaling = function(meal){
            var carbsTotal = 0, fatTotal = 0, proteinTotal = 0, caloriesTotal = 0;

            for(var i = 0; i < meal.foods.length; i++){
                var foodCarbs = meal.foods[i].carbohydrates;

                carbsTotal += foodCarbs;
                fatTotal += meal.foods[i].fat;
                proteinTotal += meal.foods[i].protein;
                caloriesTotal += meal.foods[i].calories;
            }

            meal.totalCarbohydrates = carbsTotal;
            meal.totalProtein = proteinTotal;
            meal.totalCalories = caloriesTotal;
            meal.totalFat = fatTotal;
        };

        var calculatePlanTotalMacros = function(plan){
            var carbsTotal = 0, fatTotal = 0, proteinTotal = 0, caloriesTotal = 0;

            for (var i = 0; i < plan.meals.length; i++){
                carbsTotal += plan.meals[i].totalCarbohydrates;
                fatTotal += plan.meals[i].totalFat;
                proteinTotal += plan.meals[i].totalProtein;
                caloriesTotal += plan.meals[i].totalCalories;
            }

            plan.totalPlanCarbs = carbsTotal;
            plan.totalPlanFat = fatTotal;
            plan.totalPlanProtein = proteinTotal;
            plan.totalPlanCalories = caloriesTotal;

            //calculate totals as percent
            var macroTotals = carbsTotal + fatTotal + proteinTotal;
            plan.totalPlanCarbsAsPercent = (carbsTotal / macroTotals) * 100;
            plan.totalPlanFatAsPercent = (fatTotal / macroTotals) * 100;
            plan.totalPlanProteinAsPercent = (proteinTotal / macroTotals) * 100;
        };

        $scope.toggleTotalsAsPercent = function(){
            $scope.showTotalsAsPercent = !$scope.showTotalsAsPercent;
        };

        $scope.toggleMealVisibility = function(meal){
            meal.isVisible = !meal.isVisible;
        };

        $scope.getMealTypeName = function(type){
            var mealTypeName;

            for (var i = 0; i < $scope.mealTypes.length; i++){
                var mealType = $scope.mealTypes[i];

                if (mealType.id == type){
                    mealTypeName = mealType.name;
                    break;
                }
            }

            return mealTypeName;
        };

        //sorting code
        // data
        $scope.orderByField = 'planDate';
        $scope.reverseSort = false;
        scope.plansCollection = [];





        //dialog code
        //$scope.items = ['item1', 'item2', 'item3'];
        $scope.openCopyPlanDialog = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    dialogMealsShort: function () {
                        var mealsAry = [];

                        for(var i = 0; i < $scope.plan.meals.length; i++){
                            var mealModel = {};
                            mealModel.id = $scope.plan.meals[i]._id;

                            var mealType = $scope.mealTypes[$scope.plan.meals[i].type - 1];

                            if (mealType && mealType.id >= 0) {
                                mealModel.type = mealType.name;
                            }
                            else{
                                mealModel.type = 'N/A';
                            }

                            mealsAry.push(mealModel);
                        }

                        return mealsAry;
                    },
                    dialogMealsDetailed: function () {
                        return $scope.plan.meals;
                    },
                    parentScope: function(){
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
        };
    }
]);


var ModalInstanceCtrl = function ($scope, $modalInstance, parentScope, dialogMealsDetailed, dialogMealsShort) {
    $scope.selectedMealTypes = dialogMealsDetailed[0];
    $scope.dialogMealsDetailed = dialogMealsDetailed;
    $scope.dialogMealsShort = dialogMealsShort;
    $scope.copyPlanDate = new Date();
    $scope.parentScope = parentScope;

    $scope.dialogOpenCopyPlanDate = function($event, datepicker) {

        //if (!$scope[datepicker]) {
        $event.preventDefault();
        $event.stopPropagation();
        // }

        $scope.parentScope.opened = false;
        $scope[datepicker] = false;

        $scope[datepicker] = true;
    };

    $scope.copyPlanDateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.initDate = new Date('2016-15-20');


    $scope.copyPlanDateChange = function(){
        alert("changed!");
    };

    $scope.selected = {
        meals: [$scope.dialogMealsShort[0].id],
        planDate: $scope.copyPlanDate
    };

    $scope.selectAllMeals = function(){
        for (var i = 0; i < dialogMealsShort.length; i++){
            var isFound = false;

            for(var j = 0; j < $scope.selected.meals.length; j++){
                if ($scope.selected.meals[j] === dialogMealsShort[i].id){
                    isFound = true;
                    break;
                }
            }

            if(!isFound) {
                $scope.selected.meals.push(dialogMealsShort[i].id);
            }
        }

        // $scope.selected.meals = dialogMealsShort;
    };

    $scope.ok = function () {
        var selectedMeals = $scope.selected.meals;

        if (typeof selectedMeals[0] === "string"){
            var selectedMealsDetailed = [];

            for (var i = 0; i < selectedMeals.length; i++){
                for (var j = 0; j < dialogMealsDetailed.length; j++) {
                    if (selectedMeals[i] === dialogMealsDetailed[j]._id) {
                        selectedMealsDetailed.push(dialogMealsDetailed[j]);
                    }
                }
            }

            $scope.selected.meals = selectedMealsDetailed;
        }

        $modalInstance.close($scope.selected);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};'use strict';
'use strict';

//Plans service used for communicating with the plans REST endpoints
angular.module('plans').factory('Plans', ['$resource',
    function($resource) {
        return $resource('plans/:planId', {
            planId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);'use strict';
// Setting up route
angular.module('core').config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');
        // Home state routing
        $stateProvider.state('home', {
            url: '/',
            templateUrl: 'modules/core/views/home.client.view.html'
        });
    }
]);'use strict';
angular.module('core').controller('HeaderController', [
    '$scope',
    'Authentication',
    'Menus',
    function ($scope, Authentication, Menus) {
        $scope.authentication = Authentication;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');
        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };
        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });
    }
]);'use strict';
angular.module('core').controller('HomeController', [
    '$scope',
    'Authentication',
    function ($scope, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
    }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['user'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
        if (user) {
            for (var userRoleIndex in user.roles) {
                for (var roleIndex in this.roles) {
                    if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                        return true;
                    }
                }
            }
        } else {
            return this.isPublic;
        }
        return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
        if (menuId && menuId.length) {
            if (this.menus[menuId]) {
                return true;
            } else {
                throw new Error('Menu does not exists');
            }
        } else {
            throw new Error('MenuId was not provided');
        }
        return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
        // Validate that the menu exists
        this.validateMenuExistance(menuId);
        // Return the menu object
        return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
        // Create the new menu
        this.menus[menuId] = {
            isPublic: isPublic || false,
            roles: roles || this.defaultRoles,
            items: [],
            shouldRender: shouldRender
        };
        // Return the menu object
        return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
        // Validate that the menu exists
        this.validateMenuExistance(menuId);
        // Return the menu object
        delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles) {
        // Validate that the menu exists
        this.validateMenuExistance(menuId);
        // Push new menu item
        this.menus[menuId].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            menuItemType: menuItemType || 'item',
            menuItemClass: menuItemType,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic || this.menus[menuId].isPublic,
            roles: roles || this.defaultRoles,
            items: [],
            shouldRender: shouldRender
        });
        // Return the menu object
        return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles) {
        // Validate that the menu exists
        this.validateMenuExistance(menuId);
        // Search for menu item
        for (var itemIndex in this.menus[menuId].items) {
            if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
                // Push new submenu item
                this.menus[menuId].items[itemIndex].items.push({
                    title: menuItemTitle,
                    link: menuItemURL,
                    uiRoute: menuItemUIRoute || '/' + menuItemURL,
                    isPublic: isPublic || this.menus[menuId].isPublic,
                    roles: roles || this.defaultRoles,
                    shouldRender: shouldRender
                });
            }
        }
        // Return the menu object
        return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
        // Validate that the menu exists
        this.validateMenuExistance(menuId);
        // Search for menu item to remove
        for (var itemIndex in this.menus[menuId].items) {
            if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
                this.menus[menuId].items.splice(itemIndex, 1);
            }
        }
        // Return the menu object
        return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
        // Validate that the menu exists
        this.validateMenuExistance(menuId);
        // Search for menu item to remove
        for (var itemIndex in this.menus[menuId].items) {
            for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
                if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
                    this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
                }
            }
        }
        // Return the menu object
        return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
}]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
    '$httpProvider',
    function ($httpProvider) {
        // Set the httpProvider "not authorized" interceptor
        $httpProvider.interceptors.push([
            '$q',
            '$location',
            'Authentication',
            function ($q, $location, Authentication) {
                return {
                    responseError: function (rejection) {
                        switch (rejection.status) {
                            case 401:
                                // Deauthenticate the global user
                                Authentication.user = null;
                                // Redirect to signin page
                                $location.path('signin');
                                break;
                            case 403:
                                // Add unauthorized behaviour
                                break;
                        }
                        return $q.reject(rejection);
                    }
                };
            }
        ]);
    }
]);'use strict';
// Setting up route
angular.module('users').config([
    '$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider.state('profile', {
            url: '/settings/profile',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
        }).state('password', {
            url: '/settings/password',
            templateUrl: 'modules/users/views/settings/change-password.client.view.html'
        }).state('accounts', {
            url: '/settings/accounts',
            templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
        }).state('signup', {
            url: '/signup',
            templateUrl: 'modules/users/views/signup.client.view.html'
        }).state('signin', {
            url: '/signin',
            templateUrl: 'modules/users/views/signin.client.view.html'
        });
    }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
    '$scope',
    '$http',
    '$location',
    'Authentication',
    function ($scope, $http, $location, Authentication) {
        $scope.authentication = Authentication;
        //If user is signed in then redirect back home
        if ($scope.authentication.user)
            $location.path('/');
        $scope.signup = function () {
            $http.post('/auth/signup', $scope.credentials).success(function (response) {
                //If successful we assign the response to the global user model
                $scope.authentication.user = response;
                //And redirect to the index page
                $location.path('/');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };
        $scope.signin = function () {
            $http.post('/auth/signin', $scope.credentials).success(function (response) {
                //If successful we assign the response to the global user model
                $scope.authentication.user = response;
                //And redirect to the index page
                $location.path('/');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };
    }
]);'use strict';
angular.module('users').controller('SettingsController', [
    '$scope',
    '$http',
    '$location',
    'Users',
    'Authentication',
    function ($scope, $http, $location, Users, Authentication) {
        $scope.user = Authentication.user;
        // If user is not signed in then redirect back home
        if (!$scope.user)
            $location.path('/');
        // Check if there are additional accounts
        $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
            for (var i in $scope.user.additionalProvidersData) {
                return true;
            }
            return false;
        };
        // Check if provider is already in use with current user
        $scope.isConnectedSocialAccount = function (provider) {
            return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
        };
        // Remove a user social account
        $scope.removeUserSocialAccount = function (provider) {
            $scope.success = $scope.error = null;
            $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.user = Authentication.user = response;
            }).error(function (response) {
                $scope.error = response.message;
            });
        };
        // Update a user profile
        $scope.updateUserProfile = function () {
            $scope.success = $scope.error = null;
            var user = new Users($scope.user);
            user.$update(function (response) {
                $scope.success = true;
                Authentication.user = response;
            }, function (response) {
                $scope.error = response.data.message;
            });
        };
        // Change user password
        $scope.changeUserPassword = function () {
            $scope.success = $scope.error = null;
            $http.post('/users/password', $scope.passwordDetails).success(function (response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.passwordDetails = null;
            }).error(function (response) {
                $scope.error = response.message;
            });
        };
    }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
}]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
    '$resource',
    function ($resource) {
        return $resource('users', {}, { update: { method: 'PUT' } });
    }
]);
/**
 * Created by jason on 8/10/14.
 */
'use strict';

// Setting up route
angular.module('foods').config(['$stateProvider',
    function($stateProvider) {
        // Foods state routing
        $stateProvider.
            state('listFoods', {
                url: '/foods',
                templateUrl: 'modules/foods/views/list-foods.client.view.html'
            }).
            state('createFood', {
                url: '/foods/create',
                templateUrl: 'modules/foods/views/create-food.client.view.html'
            }).
            state('viewFood', {
                url: '/foods/:foodId',
                templateUrl: 'modules/foods/views/view-food.client.view.html'
            }).
            state('editFood', {
                url: '/foods/:foodId/edit',
                templateUrl: 'modules/foods/views/edit-food.client.view.html'
            });
    }
]);
/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('foods').controller('FoodsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Foods',
    function($scope, $stateParams, $location, Authentication, Foods) {
        window.scope = $scope;

        // $scope.authentication = Authentication;

        $scope.create = function() {
            var food = new Foods({
                name: this.name,
                calories: this.calories,
                protein: $scope.protein,
                fat: $scope.fat,
                carbohydrates: $scope.carbohydrates,
                grams: $scope.grams,
                type: $scope.type
                //milliliters: $scope.milliliters
            });
            food.$save(function(response) {
                $location.path('foods');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            this.name = '';
            this.calories = '';
            this.protein = '';
            this.fat = '';
            this.carbohydrates = '';
            this.grams = '';
            this.type = '';
            //this.milliliters = '';
        };

        $scope.update = function() {
            var food = $scope.food;

            food.$update(function() {
                $location.path('foods');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.remove = function(food) {
            if (food) {
                food.$remove();

                for (var i in $scope.foods) {
                    if ($scope.foods[i] === food) {
                        $scope.foods.splice(i, 1);
                    }
                }
            } else {
                $scope.food.$remove(function() {
                    $location.path('foods');
                });
            }
        };

        $scope.find = function() {
            $scope.foods = Foods.query();
        };

        $scope.findOne = function() {
            $scope.food = Foods.get({
                foodId: $stateParams.foodId
            });
        };
    }
]);
/**
 * Created by jason on 8/10/14.
 */
'use strict';

//Foods service used for communicating with the foods REST endpoints
angular.module('foods').factory('Foods', ['$resource',
    function($resource) {
        return $resource('foods/:foodId', {
            foodId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);