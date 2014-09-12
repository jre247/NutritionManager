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
//    var planClient = req.body;
//
//    var planClientDate = new Date(planClient.planDate);
//
//    //convert both database date and client date to UTC
//    planClientDate = createDateAsUTC(planClientDate);
//
//    var planDateMonth = planClientDate.getMonth();
//    var planDateDay = planClientDate.getDate();
//    var planDateYear = planClientDate.getFullYear();
//
//    var planDate = new Date(planDateYear, planDateMonth, planDateDay);

    var planClient = req.body;
    var planClientPlanDate = planClient.planDateForDB;

    //check if already existing activity in database for this activity date
    //if so, just update the activity, not create new one
    Activity.findOne({'planDateAsUtc': planClientPlanDate, 'user': req.user.id}).exec(function(err, planDb) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            var planToSave = planDb;

            if (planDb) {
                planDb.steps = planClient.steps;
                planDb.activities = planClient.activities;
            }
            else{
                var plan = new Activity(req.body);
                plan.user = req.user;
                plan.totalCaloriesBurned = req.totalCaloriesBurned;
                plan.planDateAsUtc = planClientPlanDate;
                plan.planDateNonUtc = planClient.planDateForDB;
                plan.activities  = planClient.activities;
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

exports.hasAuthorization = function(req, res, next) {
    if (req.activity.user.id !== req.user.id) {
        return res.send(403, {
            message: 'User is not authorized'
        });
    }
    next();
};



