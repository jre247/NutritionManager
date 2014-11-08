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
            SuggestionsModalInstanceCtrl: SuggestionsModalInstanceCtrl,
            CreateFoodModalInstanceCtrl: CreateFoodModalInstanceCtrl,
            ModalInstanceCtrl: ModalInstanceCtrl,
            fillFoodNutrients: fillFoodNutrients,
            StartTourDialogCtrl: StartTourDialogCtrl
        });


        // ---
        // PUBLIC METHODS.
        // ---

        function StartTourDialogCtrl($scope, $modalInstance, parentScope) {
            $scope.ok = function () {
                $modalInstance.close();
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };


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

        function CreateFoodModalInstanceCtrl($scope, $modalInstance, parentScope, meal, food, CoreUtilities, isCreateMeal, mealTypes, userFoods) {
            $scope.foodToAdd = food;
            $scope.parentScope = parentScope;
            $scope.meal = meal;
            $scope.isUpdate = food !== 'undefined' && food !== null && food !== 'null' && food !== undefined;
            $scope.servings = 1;
            window.scopeCreateFoodDialog = $scope;
            $scope.showFoodDetails = $scope.isUpdate ? true : false;
            $scope.foods = [];
            $scope.foodSearchTxt = null;
            $scope.CoreUtilities = CoreUtilities;
            $scope.skipFoods = 0;
            $scope.findFoodsByFirstLetter = false;
            $scope.mealTypes = mealTypes;
            $scope.showCreateMealSection = isCreateMeal;
            $scope.userFoods = userFoods;
            $scope.myFoodsChecked = false;
            $scope.allFoodsChecked = true;
            $scope.foodsRadioBtn = userFoods && userFoods.length > 0 ? 'myFoods' : 'allFoods';
            $scope.servingType = food ? food.servingType : 0;
            $scope.isLoading = false;



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
                var userFoodsLength;
                if(userFoods.length > 8){
                    userFoodsLength = 8;
                }
                else{
                    userFoodsLength = userFoods.length;
                }

                for(var f = 0 ; f < userFoodsLength; f++){
                    $scope.foods.push(userFoods[f]);
                }
            };

            initializeUserFoods(userFoods);

            if($scope.foodToAdd) {
                $scope.caloriesDisplay = $scope.foodToAdd.selectedFood ? $scope.foodToAdd.selectedFood.calories : $scope.foodToAdd.calories;
            }

            $scope.nextFoods = function(){
                $scope.skipFoods += 8;

                if($scope.foodsRadioBtn == 'myFoods'){
                    $scope.foods = CoreUtilities.filterMyFoods($scope.findFoodsByFirstLetter, $scope.userFoods, $scope.selected.foodSearchTxt, $scope.skipFoods);
                }
                else{
                    $scope.updateFoodList();
                }
            };

            $scope.prevFoods = function(){
                $scope.skipFoods -= 8;

                if($scope.foodsRadioBtn == 'myFoods'){
                    $scope.foods = CoreUtilities.filterMyFoods($scope.findFoodsByFirstLetter, $scope.userFoods, $scope.selected.foodSearchTxt, $scope.skipFoods);
                }
                else{
                    $scope.updateFoodList();
                }
            };

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

                mealTypes: $scope.mealTypes


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
                var foodServingsGrams1 = food.servingGrams1;
                var foodServingsGrams2 = food.servingGrams2;

                $scope.foodServingTypes = [];

                if(!foodServingsGrams1){
                    foodServingsGrams1 = food.grams;
                    food.servingDescription1 = '1 Serving';
                }

                $scope.foodServingTypes.push({
                    id: 0,
                    grams: foodServingsGrams1,
                    description: food.servingDescription1
                });

                if(foodServingsGrams2) {
                    $scope.foodServingTypes.push({
                        id: 1,
                        grams: foodServingsGrams2,
                        description: food.servingDescription2
                    });
                }

                setUpGramsDisplay();


            };

            $scope.foodSelectionChange = function(food){


                $scope.selected.foodToAdd = food;
                $scope.showFoodDetails = true;

                $scope.skipFoods = 0;
                $scope.findFoodsByFirstLetter = false;

                $scope.calculateCaloriesDisplay();

                showMacrosChart();

                //reset food to 1 size of servingType1
                var oneServingGrams, servingsDelta;

                initializeServingTypes(food);

                if(food.servingType == 1){
                    oneServingGrams = $scope.foodServingTypes[0].grams;
                    servingsDelta = (oneServingGrams / $scope.foodServingTypes[1].grams);

                    food = fillFoodNutrients(food, food, oneServingGrams, 0, servingsDelta);
                    $scope.selected.foodToAdd = food;

                    $scope.calculateCaloriesDisplay();
                }

                food.servingType = 0;
                $scope.selected.servingType = 0;
            };

            if(food){
                initializeServingTypes(food);
            }

            $scope.foodInputChange = function(){
                $scope.skipFoods = 0;
                $scope.findFoodsByFirstLetter = false;

                if($scope.foodsRadioBtn == 'myFoods'){
                    $scope.foods = CoreUtilities.filterMyFoods($scope.findFoodsByFirstLetter, $scope.userFoods, $scope.selected.foodSearchTxt, $scope.skipFoods);
                }
                else{
                    $scope.updateFoodList();
                }
            };





            $scope.radioBtnCheckedChange = function(radioBtnValue){
                $scope.skipFoods = 0;
                $scope.findFoodsByFirstLetter = false;
                $scope.foodsRadioBtn = radioBtnValue;

                //TODO: put myFoods find in core utility
                if(radioBtnValue == 'myFoods'){
                    $scope.foods = CoreUtilities.filterMyFoods($scope.findFoodsByFirstLetter, $scope.userFoods, $scope.selected.foodSearchTxt, $scope.skipFoods);
                }
                else{
                    $scope.updateFoodList();
                }
            };



            $scope.updateFoodList = function(){
                $scope.isLoading = true;
                if($scope.findFoodsByFirstLetter){
                    $scope.findFoodsByLetter();
                }
                else {
                    var foodSearchTxt = $scope.selected.foodSearchTxt;
                    //$scope.calculateCaloriesDisplay();
                    if (!foodSearchTxt) {
                        foodSearchTxt = 'null';
                    }

                    CoreUtilities.getFoods(foodSearchTxt, $scope.skipFoods).then(function (data) {
                        $scope.foods = data;
                        $scope.isLoading = false;
                    });
                }
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

                if($scope.foodsRadioBtn == 'myFoods'){
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



            if(!isCreateMeal && food) {
                window.setTimeout(function () {
                    showMacrosChart()
                }, 100);
            }
        };


        function SuggestionsModalInstanceCtrl($scope, $modalInstance, parentScope, $timeout, suggestedFoods, mealForSuggestion, CoreUtilities) {
            $scope.parentScope = parentScope;
            $scope.suggestedFoods = suggestedFoods;
            $scope.mealForSuggestion = mealForSuggestion;
            $scope.selectedFood = $scope.suggestedFoods[0];
            $scope.CoreUtilities = CoreUtilities;



            $scope.selectedFoodClick = function(suggestedFood){
                $scope.selectedFood = suggestedFood;
            };

            $scope.ok = function () {
                $scope.selectedFood.IsSuggested = true;
                $scope.selectedFood.servings = 1;
                $scope.selectedFood.isEditable = false;
                $scope.selectedFood.foodId = $scope.selectedFood._id;

                for(var j = 0; j < $scope.parentScope.allFoods.length; j++){
                    if($scope.parentScope.allFoods[j]._id === $scope.selectedFood.foodId){
                        var newSelectedFood = $scope.parentScope.allFoods[j];

                        $scope.selectedFood.selectedFood =
                        {
                            calcium: newSelectedFood.calcium,
                            calories: newSelectedFood.calories,
                            carbohydrates: newSelectedFood.carbohydrates,
                            cholesterol: newSelectedFood.cholesterol,
                            fat: newSelectedFood.fat,
                            fiber: newSelectedFood.fiber,
                            foodId: newSelectedFood._id,
                            grams: newSelectedFood.grams,
                            iron: newSelectedFood.iron,
                            name: newSelectedFood.name,
                            protein: newSelectedFood.protein,
                            saturatedFat: newSelectedFood.saturatedFat,
                            sodium: newSelectedFood.sodium,
                            sugar: newSelectedFood.sugar,
                            transfat: newSelectedFood.transfat,
                            type: newSelectedFood.type,
                            vitaminA: newSelectedFood.vitaminA,
                            vitaminC: newSelectedFood.vitaminC,
                            servingGrams1: newSelectedFood.servingGrams1,
                            servingGrams2: newSelectedFood.servingGrams2,
                            servingDescription1: newSelectedFood.servingDescription1,
                            servingDescription2: newSelectedFood.servingDescription2,
                        };
                    }
                }

                var isFoodFoundInMeal = false;

                for(var m = 0; m < mealForSuggestion.foods.length; m++){
                    var foodId = mealForSuggestion.foods[m]._id;

                    if(foodId === $scope.selectedFood._id){
                        isFoodFoundInMeal = true;
                        mealForSuggestion.foods[m].servings += 1;
                        mealForSuggestion.foods[m].calories += mealForSuggestion.foods[m].calories;
                        mealForSuggestion.foods[m].IsSuggested = true;

                        $timeout(function(){mealForSuggestion.foods[m].IsSuggested = false;}, 4000);
                        break;
                    }
                }

                if(!isFoodFoundInMeal) {
                    mealForSuggestion.foods.push($scope.selectedFood);
                }


                $timeout(function(){$scope.selectedFood.IsSuggested = false;}, 4000);

                $timeout(function(){$scope.parentScope.savePlan();}, 4000);

                $modalInstance.close(mealForSuggestion);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
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







        // ---
        // PRIVATE METHODS.
        // ---


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