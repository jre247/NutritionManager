/**
 * Created by jason on 9/4/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    UserFoods = mongoose.model('UserFoods'),
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
                message = 'userFood already exists';
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
 * Show the current profile
 */
//exports.read = function(req, res) {
//    UserFoods.findOne({
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
//};



/**
 * Update a profile
 */
exports.update = function(req, res) {
    UserFoods.findOne({'userId' : req.user.id}).exec(function(err, userFoodsDb){
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            var userFoodIds = [];

            for(var f = 0; f < req.body.userFoods.length; f++){
                var userFoodToSave = req.body.userFoods[f];

                userFoodIds.push(userFoodToSave._id);
            }

            userFoodsDb.userFoods = userFoodIds;


            userFoodsDb.save(function(err) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                   // res.jsonp(userFoodsDb);
                    exports.read(req, res);
                }
            });
        }
    });
};


/**
* List of Plans
*/
exports.read = function(req, res) {
    if(req.user) {
        UserFoods.findOne({'userId' : req.user.id}).exec(function(err, userFoodsDb){
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                var userFoodIds = userFoodsDb.userFoods;

                // if(getFoodByFirstLetterOnly !== 'true'){
                Food.find({_id: {$in: userFoodIds}}).exec(function (err, foods) {
                    if (err) {
                        return res.send(400, {
                            message: getErrorMessage(err)
                        });
                    } else {
                        var dbModel = {
                            userFoods: foods,
                            userId: req.user.id
                        };

                        res.jsonp(dbModel);
                    }
                });

                //res.jsonp(userFoodsDbModel);
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