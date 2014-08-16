/**
 * Created by jason on 8/10/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
    foods = require('../../app/controllers/foods');


module.exports = function(app) {
    // food Routes
    app.route('/foods')
        .get(foods.list)
        .post(users.requiresLogin, foods.create);

    app.route('/foods/:foodId')
        .get(foods.read)
        .put(foods.update)
        .delete(foods.delete);

    // Finish by binding the article middleware
    app.param('foodId', foods.foodByID);
};