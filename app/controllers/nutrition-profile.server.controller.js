/**
 * Created by jason on 9/4/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    NutritionProfile = mongoose.model('NutritionProfile'),
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
                message = 'user nutrition profile already exists';
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
 * Create a nutrition profile
 */
exports.create = function(req, res) {
    var nutritionProfile = new NutritionProfile(req.body);
    nutritionProfile.user = req.user;

    nutritionProfile.save(function(err, nutritionProfileDb) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
           // nutritionProfile.nutritionProfileId = nutritionProfileDb.id;
            res.jsonp(nutritionProfile);
        }
    });


};

/**
 * Show the current profile
 */
exports.read = function(req, res) {
    NutritionProfile.findOne({
        user:req.user.id // Search Filters
    }).exec(function(err, nutritionProfile) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(nutritionProfile);
        }
    });
};


/**
 * Update a profile
 */
exports.update = function(req, res) {
    NutritionProfile.findOne({
        user:req.user.id // Search Filters
    }).exec(function(err, nutritionProfile) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            nutritionProfile.averageCaloriesTarget = req.body.averageCaloriesTarget;
            nutritionProfile.carbohydratesPercentageTarget = req.body.carbohydratesPercentageTarget;
            nutritionProfile.fatPercentageTarget = req.body.fatPercentageTarget;
            nutritionProfile.proteinPercentageTarget = req.body.proteinPercentageTarget;

            nutritionProfile.age = req.body.age;
            nutritionProfile.weight = req.body.weight;
            nutritionProfile.heightInches = req.body.heightInches;
            nutritionProfile.heightFeet = req.body.heightFeet;
            nutritionProfile.sex = req.body.sex;

            nutritionProfile.save(function(err) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    res.jsonp(nutritionProfile);
                }
            });
        }
    });
};

/**
 * Delete a profile
 */
exports.delete = function(req, res) {
    var nutritionProfile = req.nutritionProfile;

    nutritionProfile.remove(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(nutritionProfile);
        }
    });
};


/**
 * Plan middleware
 */
exports.nutritionProfileByID = function(req, res, next, id) {
    NutritionProfile.findOne({
        user:req.user.id // Search Filters
    }).exec(function(err, nutritionProfile) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(nutritionProfile);
        }
    });
};

/**
 * List of Plans
 */
exports.list = function(req, res) {
    if(req.user) {
        NutritionProfile.findOne({
            user: req.user.id // Search Filters
        }).exec(function (err, nutritionProfile) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(nutritionProfile);
            }
        });
    }

};

///**
// * user authorization middleware
// */
//exports.hasAuthorization = function(req, res, next) {
//    if (req.plan.user.id !== req.user.id) {
//        return res.send(403, {
//            message: 'User is not authorized'
//        });
//    }
//    next();
//};