/**
 * Created by jason on 8/10/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
                message = 'food already exists';
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
 * Create a Food
 */
exports.create = function(req, res) {
    var food = new Food(req.body);

    food.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(food);
        }
    });
};

/**
 * Show the current food
 */
exports.read = function(req, res) {
    res.jsonp(req.food);
};

/**
 * Update a food
 */
exports.update = function(req, res) {
    var food = req.food;

    food = _.extend(food, req.body);



    food.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(food);
        }
    });
};

/**
 * Delete a food
 */
exports.delete = function(req, res) {
    var food = req.food;

    food.remove(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(food);
        }
    });
};

/**
 * List of Foods
 */
exports.list = function(req, res) {
    Food.find().sort('name').exec(function(err, foods) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(foods);
        }
    });
};

exports.getFoodByPartialText = function(req, res, callback, typedText, foodsRange) {
    if(typedText === 'null'){
        typedText = '';
    }

    Food.find({'name' : new RegExp(typedText, 'i')}).sort('name').limit(9).exec(function(err, foods) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(foods);
        }
    });
};

/**
 * Food middleware
 */
exports.foodByID = function(req, res, next, id) {
    Food.findById(id).exec(function(err, food) {
        if (err) return next(err);
        if (!food) return next(new Error('Failed to load food ' + id));
        req.food = food;
        next();
    });
};



