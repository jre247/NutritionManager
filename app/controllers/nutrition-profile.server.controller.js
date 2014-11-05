/**
 * Created by jason on 9/4/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    NutritionProfile = mongoose.model('NutritionProfile'),
    BodyStats = mongoose.model('BodyStats'),
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

    nutritionProfile.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            //create new Body Stat for today (so user has at least one by default)
            var planDateAsString = (new Date()).toUTCString();
            var planDate = new Date(planDateAsString);

            var planSplit = planDate.toISOString().substr(0, 10).split('-');
            var planDateYear = parseInt(planSplit[0]);
            var planDateMonth = parseInt(planSplit[1]) - 1;
            var planDateDay = parseInt(planSplit[2]);

            var plan = new BodyStats({
                planDateForDB: planDateAsString,
                planDateYear: planDateYear,
                planDateMonth: planDateMonth,
                planDateDay: planDateDay,
                planDateAsMili: planDate.getTime(),
                planDateAsConcat: parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),
                weight: nutritionProfile.weight,
                bodyFatPercentage: nutritionProfile.bodyFatPercentage,
                user: req.user,
                userRoles: req.user.roles,
                templateMeals: req.templateMeals,
                hideWeightOnHomeScreen: req.hideWeightOnHomeScreen,
                activityLevel: req.activityLevel
            });

            plan.save(function(err) {
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
            nutritionProfile.deficitTarget = req.body.deficitTarget;
            nutritionProfile.carbohydratesPercentageTarget = req.body.carbohydratesPercentageTarget;
            nutritionProfile.fatPercentageTarget = req.body.fatPercentageTarget;
            nutritionProfile.proteinPercentageTarget = req.body.proteinPercentageTarget;
            nutritionProfile.hideWeightOnHomeScreen = req.body.hideWeightOnHomeScreen;
            nutritionProfile.activityLevel = req.body.activityLevel;

            nutritionProfile.age = req.body.age;
            nutritionProfile.weight = req.body.weight;
            nutritionProfile.heightInches = req.body.heightInches;
            nutritionProfile.heightFeet = req.body.heightFeet;
            nutritionProfile.sex = req.body.sex;
            nutritionProfile.templateMeals = req.body.templateMeals;
            nutritionProfile.isAdvancedNutrientTargets = req.body.isAdvancedNutrientTargets;

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