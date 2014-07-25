'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Plan = mongoose.model('Plan'),
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

/**
 * Create a plan
 */
exports.create = function(req, res) {
	var plan = new Plan(req.body);
    plan.user = req.user;

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
	Plan.find().sort('-created').populate('user', 'displayName').exec(function(err, plans) {
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
		req.plan = plan;
		next();
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