/**
 * Created by jason on 8/10/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Activity = mongoose.model('Activity'),
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

var createDateAsUTC = function(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}

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


            }
            else{
                var plan = new Activity(req.body);
                plan.user = req.user;
                plan.totalCaloriesBurned = req.totalCaloriesBurned;
                plan.planDateAsUtc = planClientPlanDate;
                plan.planDateNonUtc = planClient.planDateForDB;
                plan.activities  = planClient.activities;
                plan.planDateYear = planClient.planDateYear;
                plan.planDateMonth = planClient.planDateMonth;
                plan.planDateDay = planClient.planDateDay;
                plan.userRoles = req.user.roles;
                planToSave = plan;

            }

            planToSave.planDateForDB = planClient.planDateForDB;

            planToSave.save(function(err) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    res.jsonp(planToSave);
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
            res.jsonp(activity);
        }
    });
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
        }).sort('planDate').populate('user', 'displayName').exec(function(err, activities) {
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
exports.activityByID = function(req, res, next, id) {
    Activity.findById(id).populate('user', 'displayName').exec(function(err, activity) {
        if (err) return next(err);
        if (!activity) return next(new Error('Failed to load activity ' + id));
        req.activity = activity;
        next();
    });
};

exports.activityByDate = function(req, res, next, activityDate, dateRange) {
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



