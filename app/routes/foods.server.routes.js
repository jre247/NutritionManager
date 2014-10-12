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

    app.route('/foods/:importFoodsFileFormat/:foodsCountImport')
        .get(foods.importFoodDataFromExcel);


    app.route('/foods/:foodTyped/:foodsRange/:skip')
        .get(foods.getFoodByPartialText);

    app.route('/foods/userFoods/:userId/:userFoodTyped/:searchByFirstLetterOnlyForUser/:userFoodsSkip')
        .get(foods.getUserFoodsByPartialText);

    // Finish by binding the article middleware
    app.param('foodId', foods.foodByID);
    app.param('foodTyped', foods.getFoodByPartialText);
    app.param('foodsRange', foods.getFoodByPartialText);
    app.param('skip', foods.getFoodByPartialText);
    app.param('importFoodsFileFormat', foods.importFoodDataFromExcel);
    app.param('foodsCountImport', foods.importFoodDataFromExcel);
    app.param('userId', foods.getUserFoodsByPartialText);
    app.param('userFoodTyped', foods.getUserFoodsByPartialText);
    app.param('searchByFirstLetterOnlyForUser', foods.getUserFoodsByPartialText);
    app.param('userFoodsSkip', foods.getUserFoodsByPartialText);
};