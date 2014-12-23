/**
 * Created by jason on 9/12/14.
 */
// I act a repository for the remote friend collection.
angular.module('plans').service(
    "ActivitiesDialogService",
    function( $http, $q ) {

        // Return public API.
        return({
            CreateExerciseInstanceCtrl: CreateExerciseInstanceCtrl,
            CreateInjuriesInstanceCtrl: CreateInjuriesInstanceCtrl,
            NotesModalInstanceCtrl: NotesModalInstanceCtrl,
            StepsModalInstanceCtrl: StepsModalInstanceCtrl
        });


        // ---
        // PUBLIC METHODS.
        // ---

        function StepsModalInstanceCtrl($scope, $modalInstance, parentScope, dailySteps) {
            $scope.notesToSave = null;
            $scope.parentScope = parentScope;
            $scope.dailySteps = dailySteps;

            $scope.selected = {
                dailySteps: $scope.dailySteps
            };

            $scope.ok = function () {
                $modalInstance.close($scope.selected.dailySteps);
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

        function CreateInjuriesInstanceCtrl($scope, $modalInstance, injury){
            $scope.painLevelList = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ];

            $scope.selectedPainLevel = $scope.painLevelList[0];
            $scope.injuryNotes = '';
            $scope.injuryLocation = '';

            $scope.selected = {
                painLevel: $scope.selectedPainLevel,
                injuryNotes: $scope.injuryNotes,
                injuryLocation: $scope.injuryLocation,
                isUpdate: injury ? true : false,

            };

            if(injury){
                $scope.selected.painLevel = injury.painLevel;
                $scope.selected.injuryNotes = injury.injuryNotes;
                $scope.selected.injuryLocation = injury.injuryLocation;
                $scope.selected._id = injury._id;
            }

            $scope.ok = function () {
                $modalInstance.close($scope.selected);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        function CreateExerciseInstanceCtrl($scope, $modalInstance, parentScope, activityTypes, activityTypesDictionary, activity, dailySteps, showExerciseDetailsImmediately, hideDailyStepsSection) {
            $scope.intensityList = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ];

            window.exerciseDialogScope = $scope;

            $scope.parentScope = parentScope;
            $scope.activityTypes = activityTypes;
            $scope.activityTypesDictionary = activityTypesDictionary;
            $scope.selectedActivityType = activityTypes[0];
            $scope.newActivity = activity ? activity : {};
            $scope.activitySearchTxt = '';
            $scope.dailySteps = dailySteps ? dailySteps : null;
            $scope.hideDailyStepsSection = hideDailyStepsSection;
            $scope.sectionToDisplay = dailySteps ? 'dailySteps' : false;
            $scope.exerciseCategorySelected = 'myExercises';

            getMyExercises().then(function(data){
                 $scope.myExercises = data;
            });

            $scope.isActivityEndurance = function(activity){
                if(activity) {
                    var activityTypeId = activity.activityType >= 0 ? activity.activityType : activity.id;

                    var type = $scope.activityTypesDictionary[activityTypeId].type;

                    return type === 0;
                }
            };

            $scope.selected = {
                activity: $scope.newActivity,
                dailySteps: $scope.dailySteps,
                activitySearchTxt: $scope.activitySearchTxt,
                sectionToSave: $scope.sectionToDisplay
            };

            if(dailySteps){
                $scope.sectionToDisplay = 'dailySteps';
                $scope.selected.activity.isUpdate = false;
            }
            else if(activity){
                $scope.sectionToDisplay = 'exerciseDetails';
                $scope.newActivity.isUpdate = true;
                $scope.selectedActivityType = activityTypesDictionary[activity.activityType];
                $scope.selected.activity.isCardio = $scope.isActivityEndurance(activity);
            }
            else if (showExerciseDetailsImmediately){
                $scope.sectionToDisplay = 'exerciseCategories';
                $scope.newActivity.isUpdate = false;

            }
            else{
                $scope.sectionToDisplay = 'categories';
                $scope.selected.activity.isUpdate = false;
            }

            $scope.myExercisesClick = function(){
                $scope.sectionToDisplay = 'myExercises';
                $scope.exerciseCategorySelected = 'myExercises';


            };
            $scope.allExercisesClick = function(){
                $scope.sectionToDisplay = 'exercises';
                $scope.exerciseCategorySelected = 'allExercises';
            };

            $scope.activitiesNav = function(){
                $scope.sectionToDisplay = 'categories';
            };

            $scope.dailyStepsSelected = function(){
                $scope.sectionToDisplay = 'dailySteps';
            };

            $scope.exercisesSelected = function(){
                if($scope.exerciseCategorySelected == 'myExercises'){
                    $scope.sectionToDisplay = 'myExercises';
                }
                else{
                    $scope.sectionToDisplay = 'exercises';
                }

            };

            $scope.exercisesCategorySelected = function(){
                $scope.sectionToDisplay = 'exerciseCategories';
            };



            $scope.isActivityDistanceRelated = function(activity){
                var activityTypeId = activity.activityType;

                var type = $scope.activityTypesDictionary[activityTypeId].name;

                return type === 'Running' || type === 'Walking';
            };

            $scope.activityInputChange = function(){

            };

            $scope.activitySelectionChange = function(activity){
                $scope.selected.activity.id = activity.id;
                $scope.selected.activity.activityType = activity.id;
                $scope.selectedActivityType = activity;
                $scope.sectionToDisplay = 'exerciseDetails';

                $scope.selected.activity.isCardio = $scope.isActivityEndurance(activity);
            };



            $scope.ok = function () {
                $modalInstance.close($scope.selected);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };






        // ---
        // PRIVATE METHODS.
        // ---


        // I transform the successful response, unwrapping the application data
        // from the API response payload.
        function getMyExercises(){
            var request = $http({
                method: "get",
                url: "/myActivities",
                params: {
                    action: "get"
                }


            });

            return( request.then( handleSuccess, handleError ) );
        }


        function handleSuccess( response ) {

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