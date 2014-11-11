'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
	plans = require('../../app/controllers/plans');

module.exports = function(app) {
	// plan Routes
	app.route('/plans')
		.get(plans.list)
		.post(users.requiresLogin, plans.create);

	app.route('/plans/:planId')
		.get(plans.read)
		.put(users.requiresLogin, plans.hasAuthorization, plans.update)
		.delete(users.requiresLogin, plans.hasAuthorization, plans.delete);



    app.route('/plans/:planDate/:dateRange')
        .get(plans.planByDate);

    app.route('/plans/:planDateAsConcat/:planDateAsConcatRange/:planDateAsConcatDirection')
        .get(plans.planByPlanDateAsConcat);


	// Finish by binding the article middleware
	app.param('planId', plans.planByID);

    app.param('planDate', plans.planByDate);

    app.param('dateRange', plans.planByDate);

    app.param('planDateAsConcat', plans.planByPlanDateAsConcat);
    app.param('planDateAsConcatRange', plans.planByPlanDateAsConcat);
    app.param('planDateAsConcatDirection', plans.planByPlanDateAsConcat);

};