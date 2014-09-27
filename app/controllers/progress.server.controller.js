/**
 * Created by jason on 9/4/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Plan = mongoose.model('Plan'),
    Food = mongoose.model('Food'),
    Activity = mongoose.model('Activity'),
    BodyStats = mongoose.model('BodyStats'),
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
              //  message = 'user nutrition profile already exists';
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

exports.progressByID = function(req, res){
    var test = "test";
};

exports.list = function(req, res){
    if(req.user) {
        var startDate = req.param("startDate");
        var split = startDate.split('_');
        var startDateMonth = parseInt(split[1]);
        var startDateDay = parseInt(split[2]);
        var startDateYear = parseInt(split[0]);

        var endDate = req.param("endDate");
        var split2 = endDate.split('_');
        var endDateMonth = parseInt(split2[1]);
        var endDateDay = parseInt(split2[2]);
        var endDateYear = parseInt(split2[0]);

        var miliPadding = 76000000;

        var endDateAsMili = new Date(new Date(endDateYear,endDateMonth,endDateDay).toUTCString()).getTime() + miliPadding;
        var startDateAsMili = new Date(new Date(startDateYear,startDateMonth,startDateDay).toUTCString()).getTime();
        //planDate

        NutritionProfile.findOne({
            user: req.user.id // Search Filters
        }).exec(function (err, nutritionProfile) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            }
            else {
                Plan.find({
                        'user': req.user.id,
                        'planDateAsMili': {$gte: startDateAsMili, $lte: endDateAsMili}
                    }
                )
                  .sort({
                        planDateAsMili: 1 //Sort by Date Added DESC
                  }).exec(function (err, plans) {
                    if (err) return next(err);

                    else {
                        var bmr = calculateBmr(nutritionProfile);

                        var plansDict = [];

                        for (var i = 0; i < plans.length; i++) {
                            var singlePlan = plans[i];

                            var dateForDict = singlePlan.planDateYear + '_' + singlePlan.planDateMonth + '_' + singlePlan.planDateDay;
                            plansDict.push({
                                planDate: dateForDict,
                                plan: singlePlan
                            });

                            for (var nMeal = 0; nMeal < singlePlan.meals.length; nMeal++) {
                                doMealTotaling(singlePlan.meals[nMeal]);
                            }

                            calculatePlanTotalMacros(singlePlan);

                        }

//                        BodyStats.find({'planDateYear': {$lte: endDateYear, $gte: startDateYear}, 'planDateMonth': {$lte: endDateMonth, $gte: startDateMonth}, 'planDateDay': {$lte: endDateDay, $gte: startDateDay}, 'user': req.user.id})
//                            .sort({
//                                planDateYear: 1, //Sort by Date Added DESC
//                                planDateMonth: 1, //Sort by Date Added DESC
//                                planDateDay: 1 //Sort by Date Added DESC
//                            })
//                            .exec(function (err, bodyStats) {
//                            if (err) return next(err);
//
//                            var bodyStatsNonZeroList = [];
//
//                            for (var i = 0; i < plansDict.length; i++) {
//                                if(bodyStats && bodyStats.length > 0) {
//                                    var isPlanWeightMatchFound = false;
//
//                                    for(var b = 0; b < bodyStats.length; b++){
//                                        var bodyStatFromDb = bodyStats[b];
//
//                                        var bodyStatPlanDt = bodyStatFromDb.planDateYear + '_' + bodyStatFromDb.planDateMonth + '_' + bodyStatFromDb.planDateDay;
//
//                                        if (plansDict[i].planDate == bodyStatPlanDt) {
//                                            bodyStatsNonZeroList.push(
//                                                {
//                                                    dateYear: plansDict[i].plan.planDateYear,
//                                                    dateMonth: plansDict[i].plan.planDateMonth,
//                                                    dateDay: plansDict[i].plan.planDateDay,
//                                                    weight: bodyStatFromDb.weight
//                                                }
//                                            );
//
//                                            plansDict[i].plan.bodyWeight = bodyStatFromDb.weight;
//
//                                            isPlanWeightMatchFound = true;
//                                           // break;
//                                        }
//                                    }
//
//                                    if(!isPlanWeightMatchFound){
//                                        plansDict[i].plan.bodyWeight = bodyStatsNonZeroList[bodyStatsNonZeroList.length - 1].weight;
//
//                                        bodyStatsNonZeroList.push(plansDict[i].plan.bodyWeight);
//                                    }
//                                }
//
//                            }
//
//                            Activity.find({'planDateYear': {$lte: endDateYear, $gte: startDateYear}, 'planDateMonth': {$lte: endDateMonth, $gte: startDateMonth}, 'planDateDay': {$lte: endDateDay, $gte: startDateDay}, 'user': req.user.id}).exec(function (err, activities) {
//                                if (err) return next(err);
//
//                                for (var i = 0; i < plansDict.length; i++) {
//                                    var activityFoundPlan = null;
//
//                                    if(activities && activities.length > 0) {
//                                        for(var act = 0; act < activities.length; act++){
//                                            var activityFromDb = activities[act];
//
//                                            var activityPlanDt = activityFromDb.planDateYear + '_' + activityFromDb.planDateMonth + '_' + activityFromDb.planDateDay;
//
//                                            if (plansDict[i].planDate == activityPlanDt) {
//                                                activityFoundPlan = activities[act];
//                                            }
//                                        }
//                                    }
//
//                                    var deficit = calculateDeficit(plansDict[i].plan, activityFoundPlan, bmr);
//                                    plansDict[i].plan.deficit = deficit;
//                                }
//
//                                res.jsonp(plans);
//
//                            });
//
//
//                        });
//


                        Activity.find({'planDateYear': {$lte: endDateYear, $gte: startDateYear}, 'planDateMonth': {$lte: endDateMonth, $gte: startDateMonth}, 'planDateDay': {$lte: endDateDay, $gte: startDateDay}, 'user': req.user.id}).exec(function (err, activities) {
                            if (err) return next(err);

                            for (var i = 0; i < plansDict.length; i++) {
                                var activityFoundPlan = null;

                                if(activities && activities.length > 0) {
                                    for(var act = 0; act < activities.length; act++){
                                        var activityFromDb = activities[act];

                                        var activityPlanDt = activityFromDb.planDateYear + '_' + activityFromDb.planDateMonth + '_' + activityFromDb.planDateDay;

                                        if (plansDict[i].planDate == activityPlanDt) {
                                            activityFoundPlan = activities[act];
                                        }
                                    }
                                }

                                var deficit = calculateDeficit(plansDict[i].plan, activityFoundPlan, bmr);
                                plansDict[i].plan.deficit = deficit;
                            }

                            res.jsonp(plans);

                        });

                    }
                });
            }
        });
    }
};


exports.progressByDate = function(req, res){
    var test = "test";
};

exports.create = function(req, res){
    var test = "test";
};

exports.update = function(req, res){
    var test = "test";
};

exports.delete = function(req, res){
    var test = "test";
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
 * Plan middleware
 */
exports.progressByStartDateAndEndDate = function(req, res, next, startDate) {

};


var calculateDeficit = function(nutritionPlan, activityPlan, bmr){
    var additionalCaloriesExpended = 300;
    var caloriesOut = additionalCaloriesExpended + bmr;

    if (activityPlan){
        caloriesOut = activityPlan.totalCaloriesBurned + bmr + additionalCaloriesExpended;

    }

    var caloriesIn = nutritionPlan.totalPlanCalories;

    return -(caloriesIn - caloriesOut);

};

//BMR for Men = 66 + (13.8 x weight in kg.) + (5 x height in cm) - (6.8 x age in years)
//BMR for Women = 655 + (9.6 x weight in kg.) + (1.8 x height in cm) - (4.7 x age in years).
var calculateBmr = function(nutritionProfile){
    var age = nutritionProfile.age;
    var weightInLbs = nutritionProfile.weight; //TODO get most recent weight instead of static one
    var heightFeet = nutritionProfile.heightFeet;
    var heightInches = nutritionProfile.heightInches;
    var totalHeight = (heightFeet * 12) + heightInches;
    var gender = nutritionProfile.sex;

    //convert weight from lbs to kg:
    // kg = (weight in lbs) * .454
    var weightInKg = weightInLbs * .454;

    //convert height from inches to cms
    //height in cms = (height in inches * 2.54)
    var heightInCms = totalHeight * 2.54

    var bmr = 0;

    //BMR for Men = 66.47 + (13.75 x weight in kg.) + (5 x height in cm) - (6.75 x age in years)
    if(gender == "Male"){
        bmr = 66.47 + (13.75 * weightInKg) + (5 * heightInCms) - (6.75 * age);
    }
    //BMR for Women = 655 + (9.6 x weight in kg.) + (1.8 x height in cm) - (4.7 x age in years).
    else{
        bmr = 655.09 + (9.56 * weightInKg) + (1.84 * heightInCms) - (4.67 * age);
    }

    return bmr;
};


var doMealTotaling = function(meal){
    var carbsTotal = 0, fatTotal = 0, proteinTotal = 0, caloriesTotal = 0, sodiumTotal = 0;

    for(var i = 0; i < meal.foods.length; i++){
        var foodCarbs = meal.foods[i].carbohydrates;

        carbsTotal += foodCarbs;
        fatTotal += meal.foods[i].fat;
        proteinTotal += meal.foods[i].protein;
        caloriesTotal += meal.foods[i].calories;
        sodiumTotal += meal.foods[i].sodium;
    }

    meal.totalCarbohydrates = carbsTotal;
    meal.totalProtein = proteinTotal;
    meal.totalCalories = caloriesTotal;
    meal.totalFat = fatTotal;
    meal.totalSodium = sodiumTotal;
};

var calculatePlanTotalMacros = function(plan){
    var carbsTotal = 0, fatTotal = 0, proteinTotal = 0, caloriesTotal = 0;

    for (var i = 0; i < plan.meals.length; i++){
        carbsTotal += plan.meals[i].totalCarbohydrates;
        fatTotal += plan.meals[i].totalFat;
        proteinTotal += plan.meals[i].totalProtein;
        caloriesTotal += plan.meals[i].totalCalories;
    }

    plan.totalPlanCarbs = carbsTotal;
    plan.totalPlanFat = fatTotal;
    plan.totalPlanProtein = proteinTotal;
    plan.totalPlanCalories = caloriesTotal;

    //calculate totals as percent
    var macroTotals = carbsTotal + fatTotal + proteinTotal;
    plan.totalPlanCarbsAsPercent = (carbsTotal / macroTotals) * 100;
    plan.totalPlanFatAsPercent = (fatTotal / macroTotals) * 100;
    plan.totalPlanProteinAsPercent = (proteinTotal / macroTotals) * 100;
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