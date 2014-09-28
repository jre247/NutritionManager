'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
    progress = require('../../app/controllers/progress');

module.exports = function(app) {
    // progress Routes
    app.route('/progress')
        .get(progress.list)
        .post(progress.create);

    app.route('/progress/:progressId')
        .get(progress.progressByID)
        .put(progress.update)
        .delete(progress.delete);

    app.route('/progress/:startDate/:endDate')
        .get(progress.progressByDate);

    // Finish by binding the article middleware
    app.param('progressId', progress.progressByID);


    app.param('startDate', progress.progressByDate);

    app.param('endDate', progress.progressByDate);
};