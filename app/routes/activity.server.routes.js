/**
 * Created by jason on 9/8/14.
 */

'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
    activities = require('../../app/controllers/activities');


module.exports = function(app) {
    // activities Routes
    app.route('/activities')
        .get(activities.list)
        .post(users.requiresLogin, activities.create);

    app.route('/activities/:activityId')
        .get(activities.read)
        .put(users.requiresLogin, activities.hasAuthorization, activities.update)
        .delete(users.requiresLogin, activities.hasAuthorization, activities.delete);


    app.route('/activities/:activityDate/:dateRange')
        .get(activities.activityByDate);





    // Finish by binding the article middleware
    app.param('activityId', activities.activityByID);

    app.param('activityDate', activities.activityByDate);
};