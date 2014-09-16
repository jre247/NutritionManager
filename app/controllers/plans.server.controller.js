'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Plan = mongoose.model('Plan'),
    Food = mongoose.model('Food'),
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
				message = 'plan already exists';
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
 * Create a plan
 */
exports.create = function(req, res) {
    var planClient = req.body;
    var planClientPlanDate = planClient.planDateForDB;
    var planDateYear = planClient.planDateYear;
    var planDateMonth = planClient.planDateMonth;
    var planDateDay = planClient.planDateDay;

    //check if already existing plan in database for this plan date
    //if so, just update the plan, not create new one
    Plan.findOne({'planDateYear': planDateYear, 'planDateMonth': planDateMonth, 'planDateDay': planDateDay, 'user': req.user.id}).exec(function(err, planDb) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            var planToSave = planDb;

            if (planDb !== null && planDb !== 'undefined' && planDb !== undefined) {
                for(var i = 0; i < planClient.meals.length; i++){
                    planDb.meals.push(planClient.meals[i]);
                }

                planToSave.userRoles = req.user.roles;
                planToSave.isUpdate = true;
            }
            else{
                var plan = new Plan(req.body);
                plan.user = req.user;
                plan.userRoles = req.user.roles;
                plan.planDateAsUtc = planClientPlanDate;
                plan.planDateNonUtc = planClient.planDateForDB;
                plan.planDateYear = planClient.planDateYear;
                plan.planDateMonth = planClient.planDateMonth;
                plan.planDateDay = planClient.planDateDay;

                planToSave = plan;
                planToSave.isUpdate = false;

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
 * Show the current plan
 */
exports.read = function(req, res) {
	res.jsonp(req.plan);
};

/**
 * Update a plan
 */
exports.update = function(req, res) {
	var plan = req.plan;
    plan = _.extend(plan, req.body);

    plan.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(plan);
		}
	});
};

/**
 * Delete a plan
 */
exports.delete = function(req, res) {
	var plan = req.plan;

    plan.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(plan);
		}
	});
};

/**
 * List of Plans
 */
exports.list = function(req, res) {
    Plan.find({
        user:req.user.id // Search Filters
    }).sort('planDate').populate('user', 'displayName').exec(function(err, plans) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(plans);



        }
    });

};

/**
 * Plan middleware
 */
exports.planByID = function(req, res, next, id) {
	Plan.findById(id).populate('user', 'displayName').exec(function(err, plan) {
		if (err) return next(err);
		if (!plan) return next(new Error('Failed to load plan ' + id));

        plan.userRoles = req.user.roles;
        req.plan = plan;
        next();


	});
};


exports.planByDate = function(req, res, next, planDate) {
    var split = planDate.split('_');
    var month = parseInt(split[0]);
    var day = parseInt(split[1]);
    var year = parseInt(split[2]);

    var range = req.param("dateRange");
    var dateRange = 1;
    if(range){
        dateRange = parseInt(range);
    }

    if(dateRange <= 1) {
        Plan.findOne({'planDateYear': year, 'planDateMonth': month, 'planDateDay': day, 'user': req.user.id}).exec(function (err, plan) {
            if (err) return next(err);
            //if (!activity) return next(new Error('Failed to load activity with date: ' + activityDate));
            res.jsonp(plan);
        });
    }
    else{
        Plan.find({'planDateYear': year, 'planDateMonth': month, 'planDateDay': {$lt: day + 7, $gte: day}, 'user': req.user.id}).exec(function (err, plans) {
            if (err) return next(err);

            res.jsonp(plans);
        });
    }
};

/**
 * plan authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.plan.user.id !== req.user.id) {
		return res.send(403, {
			message: 'User is not authorized'
		});
	}
	next();
};