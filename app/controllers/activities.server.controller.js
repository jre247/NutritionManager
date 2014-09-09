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
    var activityClient = req.body;
    var activityClientDate = new Date(activityClient.activityDate);

    //convert both database date and client date to UTC
    activityClientDate = createDateAsUTC(activityClientDate);

    var activityDateMonth = activityClientDate.getMonth();
    var activityDateDay = activityClientDate.getDate();
    var activityDateYear = activityClientDate.getFullYear();

    var activityDate = new Date(activityDateYear, activityDateMonth, activityDateDay);

    //check if already existing activity in database for this activity date
    //if so, just update the activity, not create new one
    Activity.findOne({'activityDate': activityDate, 'user': req.user.id}).exec(function(err, activityDb) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            var activityToSave = activityDb;

            if (activityDb) {
                activityDb.steps = activityClient.steps;
                activityDb.activityType = activityClient.activityType;
            }
            else{
                var activity = new Activity(req.body);
                activity.user = req.user;
                activity.activityDate = activityDate;
                activity.activityDateNonUtc = activityClient.activityDate;
                activityToSave = activity;

            }

            activityToSave.save(function(err) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    res.jsonp(activityToSave);
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
        }).sort('activityDate').populate('user', 'displayName').exec(function(err, activities) {
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



