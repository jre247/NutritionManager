'use strict';

var mongoose = require('mongoose'),
    Plan = mongoose.model('Plan'),
    Activity = mongoose.model('Activity'),
    NutritionProfile = mongoose.model('NutritionProfile'),
    BodyStats = mongoose.model('BodyStats'),
    _ = require('lodash');


/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null
	});
};

exports.getDailyDashboardData = function(req, res){
    if(req.user) {
        var dashboardData = {};

        var planDate = req.param("planDate");


        var split = planDate.split('_');
        var month = parseInt(split[0]);
        var day = parseInt(split[1]);
        var year = parseInt(split[2]);



        Plan.findOne({'planDateYear': year, 'planDateMonth': month, 'planDateDay': day, 'user': req.user.id}).exec(function (err, plan) {
            if (err) return next(err);

            dashboardData.nutritionPlan = plan;

            Activity.findOne({'planDateYear': year, 'planDateMonth': month, 'planDateDay': day, 'user': req.user.id}).exec(function (err, activity) {
                if (err) return next(err);
                //if (!activity) return next(new Error('Failed to load activity with date: ' + activityDate));
                dashboardData.activityPlan = activity;

                BodyStats.findOne({'planDateYear': year, 'planDateMonth': month, 'planDateDay': day, 'user': req.user.id}).exec(function (err, bodyStat) {
                    if (err) return next(err);
                    dashboardData.dailyBodyStats = bodyStat;

                    //if (!activity) return next(new Error('Failed to load activity with date: ' + activityDate));
                    res.jsonp(dashboardData);
                });
            });

        });



    }
};

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