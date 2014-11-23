/**
 * Created by jason on 9/4/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    NutritionProfile = mongoose.model('NutritionProfile'),
    User = mongoose.model('User'),
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

//var createDefaultBodyStat = function(user){
//    var planDateAsString = (new Date()).toUTCString();
//    var planDate = new Date(planDateAsString);
//
//    var planSplit = planDate.toISOString().substr(0, 10).split('-');
//    var planDateYear = parseInt(planSplit[0]);
//    var planDateMonth = parseInt(planSplit[1]) - 1;
//    var planDateDay = parseInt(planSplit[2]);
//
//    var plan = new BodyStats({
//        planDateForDB: planDateAsString,
//        planDateYear: planDateYear,
//        planDateMonth: planDateMonth,
//        planDateDay: planDateDay,
//        planDateAsMili: planDate.getTime(),
//        planDateAsConcat: parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),
//        weight: nutritionProfile.weight,
//        bodyFatPercentage: nutritionProfile.bodyFatPercentage,
//        user: req.user,
//        userRoles: req.user.roles,
//        templateMeals: req.templateMeals,
//        hideWeightOnHomeScreen: req.hideWeightOnHomeScreen,
//        activityLevel: req.activityLevel
//    });
//
//    plan.save(function(err) {
//        if (err) {
//            return res.send(400, {
//                message: getErrorMessage(err)
//            });
//        } else {
//           // res.jsonp(nutritionProfile);
//            res.jsonp(user.nutritionProfile);
//        }
//    });
//};

/**
 * Create a nutrition profile
 */
exports.create = function(req, res) {
//    //var nutritionProfile = new NutritionProfile(req.body);
//    //nutritionProfile.user = req.user;
//
//    var user = req.user;
//
//
//    var nutritionProfile = req.body;
//
//
//
//
//    if (user) {
//        // Merge existing user
//       // user = _.extend(user, req.body);
//        user.updated = Date.now();
//        //user.displayName = user.firstName + ' ' + user.lastName;
//        user.nutritionProfile = nutritionProfile;
//
//        user.save(function(err) {
//            if (err) {
//                return res.send(400, {
//                    message: getErrorMessage(err)
//                });
//            } else {
//                createDefaultBodyStat(user);
//            }
//        });
//    } else {
//        res.send(400, {
//            message: 'User is not signed in'
//        });
//    }




//
//    nutritionProfile.save(function(err) {
//        if (err) {
//            return res.send(400, {
//                message: getErrorMessage(err)
//            });
//        } else {
//            //create new Body Stat for today (so user has at least one by default)
//            var planDateAsString = (new Date()).toUTCString();
//            var planDate = new Date(planDateAsString);
//
//            var planSplit = planDate.toISOString().substr(0, 10).split('-');
//            var planDateYear = parseInt(planSplit[0]);
//            var planDateMonth = parseInt(planSplit[1]) - 1;
//            var planDateDay = parseInt(planSplit[2]);
//
//            var plan = new BodyStats({
//                planDateForDB: planDateAsString,
//                planDateYear: planDateYear,
//                planDateMonth: planDateMonth,
//                planDateDay: planDateDay,
//                planDateAsMili: planDate.getTime(),
//                planDateAsConcat: parseInt(planDateYear + '' + (planDateMonth < 10 ? '0' + planDateMonth : planDateMonth) + '' + (planDateDay < 10 ? '0' + planDateDay : planDateDay)),
//                weight: nutritionProfile.weight,
//                bodyFatPercentage: nutritionProfile.bodyFatPercentage,
//                user: req.user,
//                userRoles: req.user.roles,
//                templateMeals: req.templateMeals,
//                hideWeightOnHomeScreen: req.hideWeightOnHomeScreen,
//                activityLevel: req.activityLevel
//            });
//
//            plan.save(function(err) {
//                if (err) {
//                    return res.send(400, {
//                        message: getErrorMessage(err)
//                    });
//                } else {
//                    res.jsonp(nutritionProfile);
//                }
//            });
//        }
//    });


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
//exports.update = function(req, res) {
//    User.findById(
//        req.user.id
//    ).exec(function(err, user) {
//        if (err) {
//            return res.send(400, {
//                message: getErrorMessage(err)
//            });
//        } else {
//            user.nutritionProfile.deficitTarget = req.body.deficitTarget;
//            user.nutritionProfile.carbohydratesPercentageTarget = req.body.carbohydratesPercentageTarget;
//            user.nutritionProfile.fatPercentageTarget = req.body.fatPercentageTarget;
//            user.nutritionProfile.proteinPercentageTarget = req.body.proteinPercentageTarget;
//            user.nutritionProfile.hideWeightOnHomeScreen = req.body.hideWeightOnHomeScreen;
//            user.nutritionProfile.activityLevel = req.body.activityLevel;
//
//            user.nutritionProfile.age = req.body.age;
//            user.nutritionProfile.weight = req.body.weight;
//            user.nutritionProfile.heightInches = req.body.heightInches;
//            user.nutritionProfile.heightFeet = req.body.heightFeet;
//            user.nutritionProfile.sex = req.body.sex;
//            user.nutritionProfile.templateMeals = req.body.templateMeals;
//            user.nutritionProfile.isAdvancedNutrientTargets = req.body.isAdvancedNutrientTargets;
//
//            user.save(function(err) {
//                if (err) {
//                    return res.send(400, {
//                        message: getErrorMessage(err)
//                    });
//                } else {
//                    res.jsonp(user.nutritionProfile);
//                }
//            });
//        }
//    });
//};

exports.update = function(req, res) {
//    // Init Variables
//    var user = req.user;
//    var message = null;
//
//    // For security measurement we remove the roles from the req.body object
//    //delete req.body.roles;
//
//    if (user) {
//        // Merge existing user
//        user = _.extend(user, req.body);
//        user.updated = Date.now();
//
//        user.save(function(err) {
//            if (err) {
//                return res.send(400, {
//                    message: getErrorMessage(err)
//                });
//            } else {
//                res.jsonp(user);
//            }
//        });
//    } else {
//        res.send(400, {
//            message: 'User is not signed in'
//        });
//    }
};
/**
 * Delete a profile
 */
exports.delete = function(req, res) {
//    var nutritionProfile = req.nutritionProfile;
//
//    nutritionProfile.remove(function(err) {
//        if (err) {
//            return res.send(400, {
//                message: getErrorMessage(err)
//            });
//        } else {
//            res.jsonp(nutritionProfile);
//        }
//    });
};


/**
 * Plan middleware
 */
exports.nutritionProfileByID = function(req, res, next, id) {
//    NutritionProfile.findOne({
//        user:req.user.id // Search Filters
//    }).exec(function(err, nutritionProfile) {
//        if (err) {
//            return res.send(400, {
//                message: getErrorMessage(err)
//            });
//        } else {
//            res.jsonp(nutritionProfile);
//        }
//    });
};

/**
 * List of Plans
 */
exports.list = function(req, res) {
//    if(req.user) {
//        NutritionProfile.findOne({
//            user: req.user.id // Search Filters
//        }).exec(function (err, nutritionProfile) {
//            if (err) {
//                return res.send(400, {
//                    message: getErrorMessage(err)
//                });
//            } else {
//                res.jsonp(nutritionProfile);
//            }
//        });
//    }

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