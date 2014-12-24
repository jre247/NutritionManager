/**
 * Created by jason on 9/12/14.
 */
// I act a repository for the remote friend collection.
angular.module('plans').service(
    "PlansService",
    function( $http, $q ) {

        var planDate;

        // Return public API.
        return({
            getActivityByDate: getActivityByDate,
            NotesModalInstanceCtrl: NotesModalInstanceCtrl,
            CreateFoodModalInstanceCtrl: CreateFoodModalInstanceCtrl,
            ModalInstanceCtrl: ModalInstanceCtrl,
            fillFoodNutrients: fillFoodNutrients
        });


        // ---
        // PUBLIC METHODS.
        // ---

//        function StartTourDialogCtrl($scope, $modalInstance, parentScope) {
//            $scope.ok = function () {
//                $modalInstance.close();
//            };
//
//            $scope.cancel = function () {
//                $modalInstance.dismiss('cancel');
//            };
//        };


        function ModalInstanceCtrl($scope, $modalInstance, parentScope, dialogMealsDetailed, dialogMealsShort) {
            $scope.selectedMealTypes = dialogMealsDetailed[0];
            $scope.dialogMealsDetailed = dialogMealsDetailed;
            $scope.dialogMealsShort = dialogMealsShort;
            $scope.copyPlanDate = new Date();
            $scope.parentScope = parentScope;

            var selectedMealsDefault = [];
            for(var i = 0; i < $scope.dialogMealsShort.length; i++) {
                selectedMealsDefault.push($scope.dialogMealsShort[i].id);
            }
            $scope.selectedMealsDefault = selectedMealsDefault;

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
                meals: $scope.selectedMealsDefault,
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
        };

        function fillFoodNutrients(foodToFill, foodToAdd, oneServingGrams, servingType, servingsDelta){
            foodToFill.water = foodToAdd.water * servingsDelta;
            foodToFill.calories = foodToAdd.calories * servingsDelta;
            foodToFill.protein = foodToAdd.protein * servingsDelta;
            foodToFill.fat = foodToAdd.fat * servingsDelta;
            foodToFill.carbohydrates = foodToAdd.carbohydrates * servingsDelta;
            foodToFill.fiber = foodToAdd.fiber * servingsDelta;
            foodToFill.sugar = foodToAdd.sugar * servingsDelta;
            foodToFill.calcium = foodToAdd.calcium * servingsDelta;
            foodToFill.iron = foodToAdd.iron * servingsDelta;
            foodToFill.sodium = foodToAdd.sodium * servingsDelta;
            foodToFill.vitaminC = foodToAdd.vitaminC * servingsDelta;
            foodToFill.vitaminA = foodToAdd.vitaminA * servingsDelta;
            foodToFill.saturatedFat = foodToAdd.saturatedFat * servingsDelta;
            foodToFill.monoFat = foodToAdd.monoFat * servingsDelta;
            foodToFill.polyFat = foodToAdd.polyFat * servingsDelta;
            foodToFill.cholesterol = foodToAdd.cholesterol * servingsDelta;
            foodToFill.grams = oneServingGrams;
            foodToFill.servingType = servingType;

            return foodToFill;
        };

        function CreateFoodModalInstanceCtrl($scope, $modalInstance, parentScope, meal, meals, food, CoreUtilities, mealTypes, userFoods, nutritionPlan, getMealTypeName) {
            $scope.foodToAdd = food;
            $scope.parentScope = parentScope;
            $scope.plan = nutritionPlan;
            $scope.mealSelected = meal;
            $scope.isUpdate = food !== 'undefined' && food !== null && food !== 'null' && food !== undefined;
            $scope.servings = 1;
            window.scopeCreateFoodDialog = $scope;
            $scope.foodDialogDisplaySection = $scope.isUpdate ? 'foodDetails' : 'selectMeal';
            $scope.searchFoodCategory = 'myFoods';
            $scope.foods = [];
            $scope.foodSearchTxt = null;
            $scope.CoreUtilities = CoreUtilities;
            $scope.skipFoods = 0;
            $scope.findFoodsByFirstLetter = false;
            $scope.mealTypes = mealTypes;
            $scope.mealTypeSelected;
            $scope.customMealInput = null;
            $scope.customMeal = null;
            $scope.userFoods = userFoods;
            $scope.meals = meals;
            $scope.servingType = food ? food.servingType : 0;
            $scope.isLoading = false;
            $scope.getMealTypeName = getMealTypeName;
            $scope.searchByLetter = false;
            var limit = 80;

            $scope.deleteMealFood = function(){
                var food = $scope.selected.foodToAdd;

                for(var f = 0; f < $scope.mealSelected.foods.length; f++){
                    if($scope.mealSelected.foods[f]._id == food._id){
                        $scope.mealSelected.foods.splice(f, 1);

                        $scope.selected.isFoodDelete = true;

                        $scope.ok();
                    }
                }
            };

            $scope.updateFoodList = function(concatFoods){
                if(!concatFoods) {
                    $scope.foods = [];
                }

                $scope.isMoreLoading = true;
                if($scope.findFoodsByFirstLetter){
                    $scope.findFoodsByLetter();
                }
                else {
                    var foodSearchTxt = $scope.selected.foodSearchTxt;
                    if (!foodSearchTxt) {
                        foodSearchTxt = 'null';
                    }

                    CoreUtilities.getFoods(foodSearchTxt, $scope.skipFoods).then(function (data) {

                        if (concatFoods) {
                            for (var f = 0; f < data.length; f++) {
                                $scope.foods.push(data[f]);
                            }
                            //$scope.isMoreLoading = false;
                        }
                        else {
                            $scope.foods = data;
                        }

                        $scope.isMoreLoading = false;

                        if(data.length == 0){
                            $scope.hideMoreFoodsLink = true;
                        }

                        $scope.allFoodsInInitialState = false;

                    });
                }
            };

            $scope.moreFoods = function(){
                $scope.isMoreLoading = true;
                $scope.skipFoods += limit;

                $scope.updateFoodList(true);
            };

            $scope.toggleSearchByLetter = function(){
                $scope.searchByLetter = !$scope.searchByLetter;
            };

            $scope.mealTypesSelectChange = function(){
                $scope.selected.customMealInput = null;
            };

            $scope.customMealInputChange = function(){
                $scope.selected.mealTypeSelected = 0;
            };

            $scope.addMealContinue = function(){
                $scope.foodDialogDisplaySection = 'categories';
                $scope.selected.mealSelected = null;
            };

            $scope.newMealClick = function(){
                $scope.foodDialogDisplaySection = 'addMeal';
            };

            $scope.selectMealNavClick = function(){
                $scope.foodDialogDisplaySection = 'selectMeal';
            };

            $scope.categoriesNavClick = function(){
                $scope.foodDialogDisplaySection = 'categories';
            };

            $scope.mealSelectClick = function(meal){
                $scope.foodDialogDisplaySection = 'categories';
                $scope.selected.mealSelected = meal;
            };

            $scope.myFoodsCategorySelected = function(){
                $scope.searchFoodsCategorySelected = 'myFoods';
                $scope.foodDialogDisplaySection = 'searchFoods';

                $scope.foods = [];

                initializeUserFoods($scope.userFoods);

                $scope.hideMoreFoodsLink = true;
            };

            $scope.allFoodsCategorySelected = function() {
                $scope.searchFoodsCategorySelected = 'allFoods';
                $scope.foodDialogDisplaySection = 'searchFoods';

                $scope.foods = [];

                $scope.allFoodsInInitialState = true;

                $scope.hideMoreFoodsLink = false;
            };


            $scope.suggestedFoodsCategorySelected = function(){
                $scope.searchFoodsCategorySelected = 'suggestFoods';
                $scope.foodDialogDisplaySection = 'searchFoods';

                initializeUserFoods($scope.userFoods);

                $scope.getFoodsList('suggestFoods');
            };

            $scope.searchFoodsNavClick = function(){
                $scope.foodDialogDisplaySection = 'searchFoods';
            };

            $scope.servingTypeChange = function(){
                $scope.selected.servings = 1;

                var food = $scope.selected.foodToAdd;
                var oneServingGrams, servingsDelta;

                if($scope.selected.servingType == 0){
                    oneServingGrams = $scope.foodServingTypes[0].grams;
                    servingsDelta = oneServingGrams / $scope.foodServingTypes[1].grams;

                    $scope.gramsDisplay = oneServingGrams * $scope.selected.servings;
                }
                else{
                    oneServingGrams = $scope.foodServingTypes[1].grams;
                    servingsDelta = (oneServingGrams / $scope.foodServingTypes[0].grams);

                    $scope.gramsDisplay = oneServingGrams * $scope.selected.servings;
                }

                if($scope.selected.foodToAdd.selectedFood) {
                    food = fillFoodNutrients(food, $scope.selected.foodToAdd.selectedFood, oneServingGrams, $scope.selected.servingType, servingsDelta);

                    food = fillFoodNutrients(food.selectedFood, food, oneServingGrams, $scope.selected.servingType, 1);
                }
                else{
                    food = fillFoodNutrients(food, $scope.selected.foodToAdd, oneServingGrams, $scope.selected.servingType, servingsDelta);
                }

                $scope.selected.caloriesDisplay = food.calories,
                    $scope.selected.proteinDisplay = food.protein,
                    $scope.selected.fatDisplay = food.fat,
                    $scope.selected.carbsDisplay = food.carbohydrates,
                    $scope.selected.gramsDisplay = food.grams,
                    $scope.selected.sodiumDisplay = food.sodium,
                    $scope.selected.fiberDisplay = food.fiber,
                    $scope.selected.cholesterolDisplay = food.cholesterol,
                    $scope.selected.sugarDisplay = food.sugar,
                    $scope.selected.saturatedFatDisplay = food.saturatedFat
            };

            var initializeUserFoods = function(userFoods){
                userFoods.sort(function compare(a,b) {
                    var foodNameA = a.name.toLowerCase();
                    var foodNameB = b.name.toLowerCase();

                    if (foodNameA < foodNameB)
                        return -1;
                    if (foodNameA > foodNameB)
                        return 1;
                    return 0;
                });

                for(var f = 0 ; f < userFoods.length; f++){
                    $scope.foods.push(userFoods[f]);
                }
            };

            initializeUserFoods(userFoods);

            if($scope.foodToAdd) {
                $scope.caloriesDisplay = $scope.foodToAdd.selectedFood ? $scope.foodToAdd.selectedFood.calories : $scope.foodToAdd.calories;
            }

            $scope.clearFoodInput = function(){
                $scope.selected.foodSearchTxt = '';
                $scope.foodInputChange();
            };

            $scope.selected = {
                showFoodDetails: $scope.showFoodDetails,
                foodToAdd: $scope.foodToAdd,
                oldFood: food,
                isUpdate: $scope.isUpdate,
                servings: $scope.servings,
                foodSearchTxt: $scope.foodSearchTxt,
                mealTypes: $scope.mealTypes,
                mealTypeSelected: $scope.mealTypeSelected,
                customMeal: $scope.customMeal,
                customMealInput: $scope.customMealInput,

                caloriesDisplay: $scope.caloriesDisplay,
                proteinDisplay: $scope.proteinDisplay,
                fatDisplay: $scope.fatDisplay,
                carbsDisplay: $scope.carbsDisplay,
                gramsDisplay: $scope.gramsDisplay,
                sodiumDisplay: $scope.sodiumDisplay,
                fiberDisplay: $scope.fiberDisplay,
                cholesterolDisplay: $scope.cholesterolDisplay,
                sugarDisplay: $scope.sugarDisplay,
                saturatedFatDisplay: $scope.saturatedFat,

                servingType: $scope.servingType,

                mealSelected: $scope.mealSelected


            };

            var setUpGramsDisplay = function(){
                var oneServingGrams;

                if($scope.selected.foodToAdd.selectedFood){
                    oneServingGrams = $scope.selected.foodToAdd.selectedFood.grams;
                }
                else{
                    oneServingGrams = $scope.selected.foodToAdd.grams;
                }

                $scope.gramsDisplay = oneServingGrams * $scope.selected.servings;
            };



            $scope.changeFood = function(){
                $scope.showFoodDetails = false;
                $scope.findFoodsByFirstLetter = false;
            };

            $scope.calculateCaloriesDisplay = function(){
                var caloriesDisplay = 0, proteinDisplay = 0, fatDisplay = 0, sodiumDisplay = 0, gramsDisplay = 0,
                    carbsDisplay = 0, saturatedFatDisplay = 0, cholesterolDisplay = 0, fiberDisplay = 0, sugarDisplay = 0;

                if($scope.selected.foodToAdd && $scope.selected.servings > 0) {

                    caloriesDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.calories : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.calories;
                    proteinDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.protein : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.protein;
                    fatDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.fat : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.fat;
                    sodiumDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.sodium : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.sodium;
                    gramsDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.grams : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.grams;
                    carbsDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.carbohydrates : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.carbohydrates;
                    saturatedFatDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.saturatedFat : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.saturatedFat;
                    cholesterolDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.cholesterol : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.cholesterol;
                    sodiumDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.sodium : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.sodium;
                    fiberDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.fiber : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.fiber;
                    sugarDisplay = $scope.selected.foodToAdd.selectedFood ? parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.selectedFood.sugar : parseFloat($scope.selected.servings) * $scope.selected.foodToAdd.sugar;
                }

                $scope.selected.caloriesDisplay = caloriesDisplay % 1 != 0 ? caloriesDisplay.toFixed(1) : caloriesDisplay;
                $scope.selected.proteinDisplay = proteinDisplay % 1 != 0 ? proteinDisplay.toFixed(1) : proteinDisplay;
                $scope.selected.fatDisplay = fatDisplay % 1 != 0 ? fatDisplay.toFixed(1) : fatDisplay;
                $scope.selected.sodiumDisplay = sodiumDisplay % 1 != 0 ? sodiumDisplay.toFixed(1) : sodiumDisplay;
                $scope.selected.gramsDisplay = gramsDisplay % 1 != 0 ? gramsDisplay.toFixed(1) : gramsDisplay;
                $scope.selected.carbsDisplay = carbsDisplay % 1 != 0 ? carbsDisplay.toFixed(1) : carbsDisplay;
                $scope.selected.saturatedFatDisplay = saturatedFatDisplay % 1 != 0 ? saturatedFatDisplay.toFixed(1) : saturatedFatDisplay;
                $scope.selected.cholesterolDisplay = cholesterolDisplay % 1 != 0 ? cholesterolDisplay.toFixed(1) : cholesterolDisplay;
                $scope.selected.sodiumDisplay = sodiumDisplay % 1 != 0 ? sodiumDisplay.toFixed(1) : sodiumDisplay;
                $scope.selected.fiberDisplay = fiberDisplay % 1 != 0 ? fiberDisplay.toFixed(1) : fiberDisplay;
                $scope.selected.sugarDisplay = sugarDisplay % 1 != 0 ? sugarDisplay.toFixed(1) : sugarDisplay;


            };

            var initializeServingTypes = function(food){
                if(food) {
                    var foodServingsGrams1 = food.servingGrams1;
                    var foodServingsGrams2 = food.servingGrams2;

                    $scope.foodServingTypes = [];

                    if (!foodServingsGrams1) {
                        foodServingsGrams1 = food.grams;
                        food.servingDescription1 = '1 Serving';
                    }

                    $scope.foodServingTypes.push({
                        id: 0,
                        grams: foodServingsGrams1,
                        description: food.servingDescription1
                    });

                    if (foodServingsGrams2) {
                        $scope.foodServingTypes.push({
                            id: 1,
                            grams: foodServingsGrams2,
                            description: food.servingDescription2
                        });
                    }

                    setUpGramsDisplay();
                }

            };

            $scope.foodSelectionChange = function(food){

                if(food) {
                    $scope.selected.foodToAdd = food;
                    $scope.foodDialogDisplaySection = 'foodDetails';

                    $scope.skipFoods = 0;
                    $scope.findFoodsByFirstLetter = false;

                    $scope.calculateCaloriesDisplay();

                    showMacrosChart();

                    //reset food to 1 size of servingType1
                    var oneServingGrams, servingsDelta;

                    initializeServingTypes(food);

                    if (food.servingType == 1) {
                        oneServingGrams = $scope.foodServingTypes[0].grams;
                        servingsDelta = (oneServingGrams / $scope.foodServingTypes[1].grams);

                        food = fillFoodNutrients(food, food, oneServingGrams, 0, servingsDelta);
                        $scope.selected.foodToAdd = food;

                        $scope.calculateCaloriesDisplay();
                    }

                    food.servingType = 0;
                    $scope.selected.servingType = 0;


                }
            };

            if(food){
                initializeServingTypes(food);
            }

            $scope.foodInputChange = function(){

                $scope.skipFoods = 0;
                $scope.findFoodsByFirstLetter = false;

                if($scope.searchFoodsCategorySelected == 'myFoods'){
                    $scope.foods = CoreUtilities.filterMyFoods($scope.findFoodsByFirstLetter, $scope.userFoods, $scope.selected.foodSearchTxt, 0, 1000);
                }
                else{
                    $scope.updateFoodList();
                }

                $scope.hideMoreFoodsLink = false;
            };





            $scope.getFoodsList = function(radioBtnValue){
                $scope.skipFoods = 0;
                $scope.findFoodsByFirstLetter = false;
                $scope.foods = [];
               // $scope.foodsRadioBtn = radioBtnValue;

                //TODO: put myFoods find in core utility
                if(radioBtnValue == 'myFoods'){
                    $scope.foods = CoreUtilities.filterMyFoods($scope.findFoodsByFirstLetter, $scope.userFoods, $scope.selected.foodSearchTxt, $scope.skipFoods);
                }
                else if(radioBtnValue == 'allFoods'){
                    $scope.updateFoodList();
                }
                else{
                    $scope.foods = getSuggestedFoods();
                }
            };

            var validateFood = function(foodToCheck){
                if(foodToCheck.type !== '12'
                    && foodToCheck.type !== '6'
                    && foodToCheck.categoryId !== '1400' //beverages
                    && foodToCheck.categoryId !== '3600' //restaurant foods
                    && foodToCheck.categoryId !== '2200' //Meals, Entrees, and Side Dishes
                    && foodToCheck.categoryId !== '2100' //Fastfood
                    && foodToCheck.categoryId !== '1900' //sweets
                    && foodToCheck.categoryId !== '2100' //Fastfood
                    && foodToCheck.categoryId !== '0700' //Sausages and Luncheon Meats
                    && foodToCheck.categoryId !== '0600' //Soups, Sauces, and Gravies
                    && foodToCheck.categoryId !== '0300' //Baby Foods
                    && foodToCheck.categoryId !== '0200' //Spices and Herbs
                    && foodToCheck.categoryId !== '1800' //Baked Products
                )
                {
                    return true;

                }

                return false;
            };

            var getSuggestedFoods = function(){
                var proteinTarget = window.user.nutritionProfile.proteinPercentageTarget;
                var carbsTarget = window.user.nutritionProfile.carbohydratesPercentageTarget;
                var fatTarget = window.user.nutritionProfile.fatPercentageTarget;
                var planTotalCalories = $scope.plan.totalPlanCalories;

                var currentDeficit = $scope.currentDeficit;
                var deficitTarget = window.user.nutritionProfile.deficitTarget;
                var currentCaloriesIn = $scope.plan.totalPlanCalories;

                var caloriesTarget = (currentDeficit - deficitTarget) + currentCaloriesIn;

                var suggestedFoodsAry = [];

                for (var i = 0; i < $scope.userFoods.length; i++) {
                    var foodToCheck = $scope.userFoods[i];
                    var score = 0;

                    var isFoodValid = validateFood(foodToCheck);

                    if(isFoodValid){
                        var macrosTotal = ($scope.plan.totalPlanFat + foodToCheck.fat) +
                            ($scope.plan.totalPlanProtein + foodToCheck.protein) +
                            ($scope.plan.totalPlanCarbs + foodToCheck.carbohydrates);

                        var newProteinTarget = (($scope.plan.totalPlanProtein + foodToCheck.protein) / macrosTotal) * 100;
                        var newCarbsTarget = (($scope.plan.totalPlanCarbs + foodToCheck.carbohydrates) / macrosTotal) * 100;
                        var newFatTarget = (($scope.plan.totalPlanFat + foodToCheck.fat) / macrosTotal) * 100;
                        var newCaloriesTarget = planTotalCalories + foodToCheck.calories;

                        var caloriesTargetDiff = (caloriesTarget - newCaloriesTarget) / caloriesTarget;
                        var proteinTargetDiff = (proteinTarget - newProteinTarget) / proteinTarget;
                        var carbsTargetDiff = (carbsTarget - newCarbsTarget) / carbsTarget;
                        var fatTargetDiff = (fatTarget - newFatTarget) / fatTarget;

                        if (caloriesTargetDiff < 0) {
                            caloriesTargetDiff = -caloriesTargetDiff;
                        }
                        if (proteinTargetDiff < 0) {
                            proteinTargetDiff = -proteinTargetDiff;
                        }
                        if (carbsTargetDiff < 0) {
                            carbsTargetDiff = -carbsTargetDiff;
                        }
                        if (fatTargetDiff < 0) {
                            fatTargetDiff = -fatTargetDiff;
                        }

                        score = (caloriesTargetDiff * 3) + proteinTargetDiff + carbsTargetDiff + fatTargetDiff;

                        foodToCheck.score = score;

                        suggestedFoodsAry.push(foodToCheck);
                    }
                }

                suggestedFoodsAry.sort(function compare(a,b) {
                    if (a.score < b.score)
                        return -1;
                    if (a.score > b.score)
                        return 1;
                    return 0;
                });

                var suggestedFoodsTop5 = [];

                var length = suggestedFoodsAry.length > 5 ? 5 : suggestedFoodsAry.length;
                for(i = 0; i < length; i++){
                    var suggestedFood = suggestedFoodsAry[i];

                    suggestedFoodsTop5.push(suggestedFood);
                }

                return suggestedFoodsTop5;


            };





            if(!userFoods || userFoods.length == 0){
                $scope.updateFoodList();
            }

            $scope.findFoodsByLetter = function(letter){
                $scope.findFoodsByFirstLetter = true;

                if(letter){
                    $scope.selected.foodSearchTxt = letter;
                    $scope.skipFoods = 0;
                }

                if($scope.searchFoodsCategorySelected == 'myFoods'){
                    $scope.foods = CoreUtilities.filterMyFoods($scope.findFoodsByFirstLetter, $scope.userFoods, $scope.selected.foodSearchTxt, $scope.skipFoods);
                }
                else{
                    $scope.isLoading = true;
                    CoreUtilities.getFoods($scope.selected.foodSearchTxt, $scope.skipFoods, true).then(function(data){
                        $scope.foods = data;
                        $scope.isLoading = false;
                    });
                }


            };

            $scope.servingsChange = function(){
                $scope.calculateCaloriesDisplay();

                setUpGramsDisplay();
            };

            if($scope.isUpdate){
                $scope.selected.servings = food.servings;

                $scope.calculateCaloriesDisplay();

                setUpGramsDisplay();

            };

            $scope.ok = function () {
                if($scope.selected.mealTypeSelected || $scope.selected.customMealInput){
                    var model = {
                        name: $scope.selected.customMealInput || '',
                        type: $scope.selected.mealTypeSelected || 5,
                        foods: [],
                        totalCalories: 0,
                        totalCarbohydrates: 0,
                        totalFat: 0,
                        totalProtein: 0,
                        isEditable: false,
                        isVisible: true
                    };

                    $scope.meals.push(model);

                    $scope.selected.mealSelected = model;
                }

                if($scope.selected.isUpdate) {
                    //set final nutrient values to foodToAdd
                    $scope.selected.foodToAdd.calories = parseFloat($scope.selected.caloriesDisplay);
                    $scope.selected.foodToAdd.protein = parseFloat($scope.selected.proteinDisplay);
                    $scope.selected.foodToAdd.sodium = parseFloat($scope.selected.sodiumDisplay);
                    $scope.selected.foodToAdd.carbohydrates = parseFloat($scope.selected.carbsDisplay);
                    $scope.selected.foodToAdd.saturatedFat = parseFloat($scope.selected.saturatedFatDisplay);
                    $scope.selected.foodToAdd.cholesterol = parseFloat($scope.selected.cholesterolDisplay);
                    $scope.selected.foodToAdd.fiber = parseFloat($scope.selected.fiberDisplay);
                    $scope.selected.foodToAdd.sugar = parseFloat($scope.selected.sugarDisplay);
                    $scope.selected.foodToAdd.grams = parseFloat($scope.selected.gramsDisplay);
                    $scope.selected.foodToAdd.fat = parseFloat($scope.selected.fatDisplay);
                }
                $modalInstance.close($scope.selected);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            var showMacrosChart = function() {
                if($scope.selected.proteinDisplay < 1 && $scope.selected.carbsDisplay < 1 &&
                    $scope.selected.fatDisplay < 1){
                    $scope.selected.proteinDisplay = Math.ceil($scope.selected.proteinDisplay);
                    $scope.selected.carbsDisplay = Math.ceil($scope.selected.carbsDisplay);
                    $scope.selected.fatDisplay = Math.ceil($scope.selected.fatDisplay);
                }


                var config = {};
                config.bindto = "#foodMacrosChart";
                config.data = {};
                config.data.json = {};
                config.data.json.Protein = parseInt($scope.selected.proteinDisplay);
                config.data.json.Carbs = parseInt($scope.selected.carbsDisplay);
                config.data.json.Fat = parseInt($scope.selected.fatDisplay);
                config.axis = {"y": {"label": {"text": "Macros", "position": "outer-middle"}}};
                config.data.types = {"Protein": "pie", "Carbs": "pie", "Fat": "pie"};
                config.size = {width: 200, height: 200};
                $scope.chart = c3.generate(config);

            };



            if(food) {
                window.setTimeout(function () {
                    showMacrosChart()
                }, 100);
            }
        };

        function NotesModalInstanceCtrl($scope, $modalInstance, parentScope, planNotes) {
            $scope.notesToSave = null;
            $scope.parentScope = parentScope;
            $scope.notesToSave = planNotes;

            $scope.selected = {
                notesToSave: $scope.notesToSave
            };

            $scope.ok = function () {
                $modalInstance.close($scope.selected.notesToSave);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        function getActivityByDate(planDateIn) {
            planDate = planDateIn;

            var request = $http({
                method: "get",
                url: "/activities/" + planDate + '/' + 1,
                params: {
                    action: "get"
                }


            });

            return( request.then( handleActivityByDateSuccess, handleError ) );
        }

//        function getPlanByDate(planDateIn) {
//            planDate = planDateIn;
//
//            var request = $http({
//                method: "get",
//                url: "/plans/" + planDate + '/' + 1 + '/' + 1,
//                params: {
//                    action: "get"
//                }
//
//
//            });
//
//            return request;
//
//            //return( request.then( handlePlanByDateSuccess, handleError ) );
//        }






        // ---
        // PRIVATE METHODS.
        // ---


        function handlePlanByDateSuccess(response){
            if(response.data !== 'null') {
                return response.data;
            }
            else{
                return "empty";
            }
        };

        // I transform the successful response, unwrapping the application data
        // from the API response payload.
        function handleActivityByDateSuccess( response ) {

            return response.data;
        }




        // I transform the error response, unwrapping the application dta from
        // the API response payload.
        function handleError( response ) {

            // The API response from the server should be returned in a
            // nomralized format. However, if the request was not handled by the
            // server (or what not handles properly - ex. server error), then we
            // may have to normalize it on our end, as best we can.
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );

            }

            // Otherwise, use expected error message.
            return( $q.reject( response.data.message ) );

        }


    }
);