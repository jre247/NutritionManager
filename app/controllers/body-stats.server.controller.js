/**
 * Created by jason on 9/19/14.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    BodyStats = mongoose.model('BodyStats'),
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
                message = 'body stat already exists';
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



/**
 * Create a Body Stat
 */
exports.create = function(req, res) {

    var planClient = req.body;
    var planClientPlanDate = planClient.planDateForDB;
    var planDateYear = planClient.planDateYear;
    var planDateMonth = planClient.planDateMonth;
    var planDateDay = planClient.planDateDay;

    //check if already existing bodyStat in database for this bodyStat date
    //if so, just update the bodyStat, not create new one
    BodyStats.findOne({'planDateYear': planDateYear, 'planDateMonth': planDateMonth, 'planDateDay': planDateDay, 'user': req.user.id}).exec(function(err, planDb) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            var planToSave = planDb;

            if (planDb) {
                planDb.weight = planClient.weight;
                planDb.bodyFatPercentage = planClient.bodyFatPercentage;

                planDb.userRoles = req.user.roles;


            }
            else{
                var plan = new BodyStats(req.body);
                plan.user = req.user;
                plan.weight = planClient.weight;
                plan.planDateAsUtc = planClientPlanDate;
                plan.planDateNonUtc = planClient.planDateForDB;
                plan.bodyFatPercentage  = planClient.bodyFatPercentage;
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


exports.bodyStatsByDate = function(req, res) {
    if(req.user) {
        var startDate = req.param("startDate");
        var split = startDate.split('_');
        var startDateMonth = parseInt(split[1]);
        var startDateDay = parseInt(split[2]);
        var startDateYear = parseInt(split[0]);

        var endDate = req.param("endDate");
        var split2 = endDate.split('_');
        var endDateMonth = parseInt(split2[1]);
        var endDateDay = parseInt(split2[2]);
        var endDateYear = parseInt(split2[0]);

        BodyStats.find({'planDateYear': {$lte: endDateYear, $gte: startDateYear}, 'planDateMonth': {$lte: endDateMonth, $gte: startDateMonth}, 'planDateDay': {$lte: endDateDay, $gte: startDateDay}, 'user': req.user.id})
            .sort({
                planDateYear: 1, //Sort by Date Added DESC
                planDateMonth: 1, //Sort by Date Added DESC
                planDateDay: 1 //Sort by Date Added DESC
            })
            .exec(function (err, bodyStats) {
                if (err) return next(err);

                res.jsonp(bodyStats);

            });
    }
};

/**
 * Show the current body stat
 */
exports.read = function(req, res) {
    res.jsonp(req.bodyStat);
};

/**
 * Update an bodyStat
 */
exports.update = function(req, res) {
    var bodyStat = req.bodyStat;

    bodyStat = _.extend(bodyStat, req.body);

    bodyStat.userRoles = req.user.roles;

    bodyStat.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(bodyStat);
        }
    });
};

/**
 * Delete a bodyStat
 */
exports.delete = function(req, res) {
    var bodyStat = req.bodyStat;

    bodyStat.remove(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(bodyStat);
        }
    });
};

/**
 * List of Activities
 */
exports.list = function(req, res) {
    BodyStats.find(
        {
            user:req.user.id
        }).sort('planDate').populate('user', 'displayName').exec(function(err, bodyStats) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(bodyStats);
            }
        });
};

/**
 * bodyStat middleware
 */
exports.bodyStatByID = function(req, res, next, id) {
    BodyStats.findById(id).populate('user', 'displayName').exec(function(err, bodyStat) {
        if (err) return next(err);
        if (!bodyStat) return next(new Error('Failed to load body stat ' + id));
        req.bodyStat = bodyStat;
        next();
    });
};


exports.hasAuthorization = function(req, res, next) {
    if (req.bodyStat.user.id !== req.user.id) {
        return res.send(403, {
            message: 'User is not authorized'
        });
    }
    next();
};


