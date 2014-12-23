/**
 * Created by jason on 8/10/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Activity = mongoose.model('Activity'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'activity already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }

    return message;
};

var addActivityToUserActivitiesList = function(planToSave, req, res){
    User.findOne({
        _id: req.user.id
    }).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));

        var userActivitiesList = user._doc.nutritionProfile.userActivities;

        if(!userActivitiesList){
            userActivitiesList = [];
        }

        for(var e = 0; e < planToSave.activities.length; e++) {
            var activityExistsInProfile = false;

            var planActivity = planToSave.activities[e]._doc.activityType.toString();

            for (var a = 0; a < userActivitiesList.length; a++) {
                var nutritionProfileActivity = userActivitiesList[a];

                if (nutritionProfileActivity === planActivity) {
                    activityExistsInProfile = true;
                    break;
                }
            }
            if (!activityExistsInProfile) {
                userActivitiesList.push(planActivity);
                //req.user._doc.nutritionProfile.userActivities.push(planActivity);
                //req.user.nutritionProfile.userActivities.push(planActivity);
            }
        }

        //req.user._doc.nutritionProfile.userActivities = userActivitiesList;

        user.save(function(err) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(planToSave);
            }
        });
    });
};

var getAllExercises = function(){
    var activityTypes = [
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
        {id: 32, type: 3, name: 'Yoga'},
        {id: 33, type: 4, name: 'Daily Steps'}

    ];

    return activityTypes;
};


exports.getMyExercises = function(req, res){
    User.findOne({
        _id: req.user.id
    }).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));

        var userActivitiesList = user._doc.nutritionProfile.userActivities;

        var allExercises = getAllExercises();

        var myExercises = [];

        for(var e = 0; e < allExercises.length; e++){
            var exerciseCompare = allExercises[e];

            for(var t = 0; t < userActivitiesList.length; t++){
                var myExerciseIdCompare = parseInt(userActivitiesList[t]);

                if(exerciseCompare.id === myExerciseIdCompare){
                    myExercises.push(exerciseCompare);
                    break;
                }
            }
        }

        res.jsonp(myExercises);
    });
};

/**
 * Create an Activity
 */
exports.create = function(req, res) {

    var planClient = req.body;
    var planClientPlanDate = planClient.planDateForDB;
    var planDateYear = planClient.planDateYear;
    var planDateMonth = planClient.planDateMonth;
    var planDateDay = planClient.planDateDay;

    //check if already existing activity in database for this activity date
    //if so, just update the activity, not create new one
    Activity.findOne({'planDateYear': planDateYear, 'planDateMonth': planDateMonth, 'planDateDay': planDateDay, 'user': req.user.id}).exec(function(err, planDb) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            var planToSave = planDb;

            if (planDb) {
                planDb.steps = planClient.steps;

                for(var i = 0; i < planClient.activities.length; i++){
                    planDb.activities.push(planClient.activities[i]);
                }

                planDb.userRoles = req.user.roles;
                planDb.planDateAsMili = planClient.planDateAsMili;
                planDb.planDateAsConcat = planClient.planDateAsConcat;


            }
            else{
                var plan = new Activity(req.body);
                plan.user = req.user;
                plan.totalCaloriesBurned = planClient.totalCaloriesBurned;
                plan.dailySteps = planClient.dailySteps;
                plan.dailyStepsCaloriesBurned = planClient.dailyStepsCaloriesBurned;
                plan.planDateAsUtc = planClientPlanDate;
                plan.planDateNonUtc = planClient.planDateForDB;
                plan.activities  = planClient.activities;
                plan.planDateYear = planClient.planDateYear;
                plan.planDateMonth = planClient.planDateMonth;
                plan.planDateDay = planClient.planDateDay;
                plan.planDateAsMili = planClient.planDateAsMili;
                plan.planDateAsConcat = planClient.planDateAsConcat;
                plan.userRoles = req.user.roles;
                plan.injuries = planClient.injuries;
                planToSave = plan;

            }

            planToSave.planDateForDB = planClient.planDateForDB;

            planToSave.save(function(err) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    addActivityToUserActivitiesList(planToSave, req, res);
                }
            });
        }
    });
};

/**
 * Show the current activity
 */
exports.read = function(req, res) {
    res.jsonp(req.activity);
};

/**
 * Update an activity
 */
exports.update = function(req, res) {
    var activity = req.activity;

    activity = _.extend(activity, req.body);

    activity.userRoles = req.user.roles;

    activity.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
           // res.jsonp(activity);

            addActivityToUserActivitiesList(activity, req, res);
        }
    });


//
//
//    var planClient = req.body;
//    var planDateYear = planClient.planDateYear;
//    var planDateMonth = planClient.planDateMonth;
//    var planDateDay = planClient.planDateDay;
//
//    //check if already existing activity in database for this activity date
//    //if so, just update the activity, not create new one
//    Activity.findOne({'planDateYear': planDateYear, 'planDateMonth': planDateMonth, 'planDateDay': planDateDay, 'user': req.user.id}).exec(function(err, planDb) {
//        if (err) {
//            return res.send(400, {
//                message: getErrorMessage(err)
//            });
//        } else {
//            if (planDb) {
//                var activity = req.activity;
//
//                activity = _.extend(activity, req.body);
//                activity.userRoles = req.user.roles;
//                activity.planExistsInDb = true;
//                res.jsonp(activity);
//            }
//            else{
//                var activity = req.activity;
//
//                activity = _.extend(activity, req.body);
//
//                activity.userRoles = req.user.roles;
//                activity.planExistsInDb = false;
//                activity.save(function(err) {
//                    if (err) {
//                        return res.send(400, {
//                            message: getErrorMessage(err)
//                        });
//                    } else {
//                        res.jsonp(activity);
//                    }
//                });
//
//            }
//
//
//        }
//    });
};

/**
 * Delete a activity
 */
exports.delete = function(req, res) {
    var activity = req.activity;

    activity.remove(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(activity);
        }
    });
};

/**
 * List of Activities
 */
exports.list = function(req, res) {
    Activity.find(
        {
            user:req.user.id
        })
        .sort({
            planDateAsMili: -1 //Sort by Date Added DESC
        })
        .populate('user', 'displayName').exec(function(err, activities) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(activities);
        }
    });
};

/**
 * Activity middleware
 */
var getPlanByDate = function(req, res, planDate){
    var nPlanDate = parseInt(planDate);

    Activity.findOne({'planDateAsConcat': nPlanDate, 'user': req.user.id}).populate('user', 'displayName').exec(function(err, activity) {
        if (err) return next(err);
        //if (!plan) return next(new Error('Failed to load plan ' + id));

        if(activity) {
            activity.userRoles = req.user.roles;
        }
        else
        {
            activity = {};
        }
        // req.plan = plan;



        res.jsonp(activity);
    });
};

exports.activityByID = function(req, res, next, id) {
    if (id.length === 8){
        return getPlanByDate(req, res, id);

    }
    else {
        Activity.findById(id).populate('user', 'displayName').exec(function (err, activity) {
            if (err) return next(err);
            if (!activity) return next(new Error('Failed to load activity ' + id));

            activity.userRoles = req.user.roles;
            req.activity = activity;
            next();


        });
    }
};

exports.activityByDate = function(req, res, next, activityDate) {
    if(req.user) {
        var split = activityDate.split('_');
        var month = parseInt(split[0]);
        var day = parseInt(split[1]);
        var year = parseInt(split[2]);


        Activity.findOne({'planDateYear': year, 'planDateMonth': month, 'planDateDay': day, 'user': req.user.id}).exec(function (err, activity) {
            if (err) return next(err);
            //if (!activity) return next(new Error('Failed to load activity with date: ' + activityDate));
            res.jsonp(activity);
        });
    }


};

exports.hasAuthorization = function(req, res, next) {
    if (req.activity.user.id !== req.user.id) {
        return res.send(403, {
            message: 'User is not authorized'
        });
    }
    next();
};



