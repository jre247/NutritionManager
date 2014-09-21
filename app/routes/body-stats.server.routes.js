/**
 * Created by jason on 9/8/14.
 */

'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
    bodyStats = require('../../app/controllers/body-stats');


module.exports = function(app) {
    // body stats Routes
    app.route('/body-stats')
        .get(bodyStats.list)
        .post(users.requiresLogin, bodyStats.create);

    app.route('/body-stats/:bodyStatId')
        .get(bodyStats.read)
        .put(users.requiresLogin, bodyStats.hasAuthorization, bodyStats.update)
        .delete(users.requiresLogin, bodyStats.hasAuthorization, bodyStats.delete);

    app.route('/body-stats/:startDate/:endDate')
        .get(bodyStats.bodyStatsByDate)
       // .put(users.requiresLogin, bodyStats.hasAuthorization, bodyStats.update)
       // .delete(users.requiresLogin, bodyStats.hasAuthorization, bodyStats.delete);


    // Finish by binding the article middleware
    app.param('bodyStatId', bodyStats.bodyStatByID);

    // Finish by binding the article middleware
    app.param('startDate', bodyStats.bodyStatsByDate);

    // Finish by binding the article middleware
    app.param('endDate', bodyStats.bodyStatsByDate);


};