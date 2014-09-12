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
    var planClientPlanDate = new Date(planClient.planDateForDB);

    var planDateMonth = planClientPlanDate.getMonth();
    var planDateDay = planClientPlanDate.getDate();
    var planDateYear = planClientPlanDate.getFullYear();

    var planDate = new Date(planDateYear, planDateMonth, planDateDay);

    //convert both database date and client date to UTC
    planDate = createDateAsUTC(planDate);

    //check if already existing plan in database for this plan date
    //if so, just update the plan, not create new one
    Plan.findOne({'planDate': planDate, 'user': req.user.id}).exec(function(err, planDb) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            var planToSave = planDb;

            if (planDb) {
                for(var i = 0; i < planClient.meals.length; i++){
                    planDb.meals.push(planClient.meals[i]);
                }

                planToSave.userRoles = req.user.roles;
            }
            else{
                var plan = new Plan(req.body);
                plan.user = req.user;
                plan.userRoles = req.user.roles;
                plan.planDate = planDate;
                plan.planDateNonUtc = planClient.planDateForDB;
                plan.planDateForDB = planClient.planDateForDB;
                planToSave = plan;

            }

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

       // var isDone = false;

//        for(var i = 0; i < plan.meals.length; i++){
//            for (var j = 0; j < plan.meals[i].foods.length; j++){
//                var mealFood = plan.meals[i].foods[j];
//
//                Food.findById(mealFood.id).exec(function(err, food){
//                    plan.meals[i].foods[j] = food;
//
//                    if (i == plan.meals.length - 1 && j == plan.meals[i].foods.length - 1){
//                        isDone = true;
//                    }
//
//                    if (isDone){
//                        req.plan = plan;
//                        next();
//                    }
//                });
//
//
//            }
//        }
        plan.userRoles = req.user.roles;
        req.plan = plan;
        next();

//
//
//        Food.populate(plan, {
//            path: 'author.phone',
//            select: 'name',
//            model: Phone // <== We are populating phones so we need to use the correct model, not User
//        }, function(){
//            req.plan = plan;
//            next();
//        });





	});
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