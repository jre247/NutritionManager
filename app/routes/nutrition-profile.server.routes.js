/**
 * Created by jason on 9/4/14.
 */
/**
 * Module dependencies.
 */
//var nutritionProfile = require('../../app/controllers/nutrition-profile');
//
//module.exports = function(app) {
//
//    // nutrition profile Routes
//    app.route('/nutritionProfile')
//        .get(nutritionProfile.list)
//        .put(nutritionProfile.update)
//        .post(nutritionProfile.create);
//        //.delete(nutritionProfile.delete);
//    app.route('/nutritionProfile/:nutritionProfileId')
//        .get(nutritionProfile.read)
//        .put(nutritionProfile.update)
//        .delete(nutritionProfile.delete);
//
//    // Finish by binding the article middleware
//    app.param('nutritionProfileID', nutritionProfile.nutritionProfileByID);
//};
//
//


var users = require('../../app/controllers/users'),
    nutritionProfile = require('../../app/controllers/nutrition-profile');


module.exports = function(app) {
    // nutritionProfile Routes
    app.route('/nutritionProfile')
        .get(nutritionProfile.list)
        .post(users.requiresLogin, nutritionProfile.create)
        .put(nutritionProfile.update);

    app.route('/nutritionProfile/:nutritionProfileId')
        .get(nutritionProfile.read)
        .put(nutritionProfile.update)
        .delete(nutritionProfile.delete);

    // Finish by binding the article middleware
    app.param('nutritionProfileId', nutritionProfile.nutritionProfileByID);
};




//
//var mongoose = require('mongoose'),
//    NutritionProfile = mongoose.model('NutritionProfile'),
//    _ = require('lodash');
//
//
//
//module.exports = function(app) {
//
//    // api ---------------------------------------------------------------------
//    // get all nutritionProfile
//    app.get('/api/nutritionProfile', function(req, res) {
//
//        NutritionProfile.findOne({
//            user:req.user.id // Search Filters
//        }).exec(function(err, nutritionProfile) {
//            if (err) {
//                return res.send(400, {
//                    //message: getErrorMessage(err)
//                });
//            } else {
//                res.jsonp(nutritionProfile);
//            }
//        });
//    });
//
//    // create nutritionProfile and send back all todos after creation
//    app.post('/api/nutritionProfile', function(req, res) {
//
//        var nutritionProfile = new NutritionProfile(req.body);
//        nutritionProfile.user = req.user;
//
//        nutritionProfile.save(function(err) {
//            if (err) {
//                return res.send(400, {
//                    //message: getErrorMessage(err)
//                });
//            } else {
//                // nutritionProfile.nutritionProfileId = nutritionProfileDb.id;
//                res.jsonp(nutritionProfile);
//            }
//        });
//
//    });


//    // application -------------------------------------------------------------
//    app.get('*', function(req, res) {
//        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
//    });
//};