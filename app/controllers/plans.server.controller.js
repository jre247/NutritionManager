'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Plan = mongoose.model('Plan'),
    Food = mongoose.model('Food'),
    Activity = mongoose.model('Activity'),
    NutritionProfile = mongoose.model('NutritionProfile'),
    UserFoods = mongoose.model('UserFoods'),
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
				message = 'plan already exists';
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
 * Create a plan
 */
exports.create = function(req, res) {
    var planClient = req.body;
    var planClientPlanDate = planClient.planDateForDB;
    var planDateYear = planClient.planDateYear;
    var planDateMonth = planClient.planDateMonth;
    var planDateDay = planClient.planDateDay;

    //check if already existing plan in database for this plan date
    //if so, just update the plan, not create new one
    Plan.findOne({'planDateYear': planDateYear, 'planDateMonth': planDateMonth, 'planDateDay': planDateDay, 'user': req.user.id}).exec(function(err, planDb) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            var planToSave = planDb;

            if (planDb !== null && planDb !== 'undefined' && planDb !== undefined) {
                for(var i = 0; i < planClient.meals.length; i++){
                    planDb.meals.push(planClient.meals[i]);
                }

                planToSave.userRoles = req.user.roles;

            }
            else{
                var plan = new Plan(req.body);
                plan.user = req.user;
                plan.userRoles = req.user.roles;
                plan.planDateAsUtc = planClientPlanDate;
                plan.planDateNonUtc = planClient.planDateForDB;
                plan.planDateYear = planClient.planDateYear;
                plan.planDateMonth = planClient.planDateMonth;
                plan.planDateDay = planClient.planDateDay;
                plan.notes = planClient.notes;
                plan.planDateAsMili = planClient.planDateAsMili;
                plan.planDateAsConcat = planClient.planDateAsConcat;

                planToSave = plan;
            }

            planToSave.planDateForDB = planClient.planDateForDB;

            planToSave.save(function(err) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    saveUserFoods(planToSave, req, res);
                }
            });
        }
    });
};

var saveUserFoods = function(planToSave, req, res){
    //save user foods in database
    UserFoods.findOne({userId: req.user.id}).exec(function(userFoodsErr, userFoodsDb){
        if (userFoodsErr) {
            return res.send(400, {
                message: getErrorMessage(userFoodsErr)
            });
        }
        else{
            for(var i = 0; i < planToSave.meals.length; i++){
                var meal = planToSave.meals[i];

                for(var f = 0; f < meal.foods.length; f++){
                    var foodId = meal.foods[f].id;

                    if(userFoodsDb && userFoodsDb.userFoods && userFoodsDb.userFoods.length > 0) {
                        var foodExistsInDb = findFoodInUserFoods(userFoodsDb, foodId);

                        if (!foodExistsInDb) {
                            userFoodsDb.userFoods.push(foodId);
                        }
                    }
                    else{
                        userFoodsDb = new UserFoods();
                        userFoodsDb.userId = req.user.id;
                        userFoodsDb.userFoods = [];
                        userFoodsDb.userFoods.push(foodId);
                    }

                }
            }

            userFoodsDb.save(function(err){
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    res.jsonp(planToSave);
                }
            });
        }
    });

};

var findFoodInUserFoods = function(userFoodsDb, foodId){
    var foodExists = false;

    for(var f = 0; f < userFoodsDb.userFoods.length; f++){
        var foodDbCompare = userFoodsDb.userFoods[f];

        if(foodDbCompare === foodId){
            foodExists = true;
            break;
        }
    }

    return foodExists;
};

/**
 * Show the current plan
 */
exports.read = function(req, res) {
	res.jsonp(req.plan);
};

/**
 * Update a plan
 */
exports.update = function(req, res) {
	var plan = req.plan;
    plan = _.extend(plan, req.body);

    plan.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
            saveUserFoods(plan, req, res);
			//res.jsonp(plan);
		}
	});
};

/**
 * Delete a plan
 */
exports.delete = function(req, res) {
	var plan = req.plan;

    plan.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(plan);
		}
	});
};

/**
 * List of Plans
 */
exports.list = function(req, res, skipPlans) {
    var nSkip = req.param('skipPlans') || 0;

    //Plan.count({user:req.user.id}, function(err, count)
    //{
        Plan.find({
            user:req.user.id // Search Filters
        })
            .skip(nSkip).limit(14)
            .sort({
                planDateAsConcat: -1
            })
            .populate('user', 'displayName').exec(function(err, plans) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    res.jsonp(plans);



                }
            });
    //});



};

/**
 * Plan middleware
 */
var getPlanByDate = function(req, res, planDate){
    var nPlanDate = parseInt(planDate);

    Plan.findOne({'planDateAsConcat': nPlanDate, 'user': req.user.id}).populate('user', 'displayName').exec(function(err, plan) {
        if (err) return next(err);
        //if (!plan) return next(new Error('Failed to load plan ' + id));

        if(plan) {
            plan.userRoles = req.user.roles;
        }
        else
        {
            plan = {};
        }
        // req.plan = plan;



        res.jsonp(plan);
    });
};

exports.planByID = function(req, res, next, id) {
    if (id.length === 8){
        return getPlanByDate(req, res, id);

    }
    else {
        Plan.findById(id).populate('user', 'displayName').exec(function (err, plan) {
            if (err) return next(err);
            if (!plan) return next(new Error('Failed to load plan ' + id));

            plan.userRoles = req.user.roles;
            req.plan = plan;
            next();


        });
    }
};

exports.planByPlanDateAsConcat = function(req, res, next, id) {
    var planDate = req.param("planDateAsConcat");

    var nPlanDate = parseInt(planDate);

    Plan.findOne({'planDateAsConcat': nPlanDate, 'user': req.user.id}).populate('user', 'displayName').exec(function(err, plan) {
        if (err) return next(err);
        //if (!plan) return next(new Error('Failed to load plan ' + id));

        if(plan) {
            plan.userRoles = req.user.roles;
        }
       // req.plan = plan;

        res.jsonp(plan);


    });
};


exports.planByDate = function(req, res, next, planDate) {
    if(req.user) {
        var split = planDate.split('_');
        var month = parseInt(split[0]);
        var day = parseInt(split[1]);
        var year = parseInt(split[2]);

        var range = req.param("dateRange");
        var dateRange = 1;
        if (range) {
            dateRange = parseInt(range);
        }

        if (dateRange <= 1) {
            Plan.findOne({'planDateYear': year, 'planDateMonth': month, 'planDateDay': day, 'user': req.user.id}).exec(function (err, plan) {
                if (err) return next(err);
                //if (!activity) return next(new Error('Failed to load activity with date: ' + activityDate));
                res.jsonp(plan);
            });
        }
        else {
            NutritionProfile.findOne({
                user: req.user.id // Search Filters
            }).exec(function (err, nutritionProfile) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                }
                else {
                    Plan.find({'planDateYear': year, 'planDateMonth': month, 'planDateDay': {$lt: day + 7, $gte: day}, 'user': req.user.id}).exec(function (err, plans) {
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

                                for (var nMeal = 0; nMeal < singlePlan.meals.length; nMeal++){
                                    doMealTotaling(singlePlan.meals[nMeal]);
                                }

                                calculatePlanTotalMacros(singlePlan);
                            }

                            Activity.find({'planDateYear': year, 'planDateMonth': month, 'planDateDay': {$lt: day + 7, $gte: day}, 'user': req.user.id}).exec(function (err, activities) {
                                if (err) return next(err);

                                if(activities && activities.length > 0) {
                                    for(var act = 0; act < activities.length; act++){
                                        var activityFromDb = activities[act];

                                        var activityPlanDt = activityFromDb.planDateYear + '_' + activityFromDb.planDateMonth + '_' + activityFromDb.planDateDay;

                                        for (var a = 0; a < plansDict.length; a++) {
                                            if (plansDict[a].planDate == activityPlanDt) {
                                                var deficit = calculateDeficit(plansDict[a].plan, activityFromDb, nutritionProfile, bmr);
                                                plansDict[a].plan.deficit = deficit;
                                            }
                                        }
                                    }
                                }

                                res.jsonp(plans);

                            });


                        }
                    });
                }
            });



        }
    }
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


//TODO put in utilities
function calculateDeficitForAdvancedTargets(nutritionPlan, activityPlan, bmr){
    var additionalCaloriesExpended = 300;
    var caloriesOut = additionalCaloriesExpended + bmr;

    if (activityPlan && typeof activityPlan == 'object') {
        caloriesOut = activityPlan.totalCaloriesBurned + bmr + additionalCaloriesExpended;

    }

    var caloriesIn = nutritionPlan.totalPlanCalories;

    var deficit = -(caloriesIn - caloriesOut) || 0;

    return deficit;
};

//TODO put in utilities
function calculateCaloriesOut(nutritionProfile, bmr){
    var caloriesOut;

    switch(nutritionProfile.activityLevel){
        //Sedentary
        case 0:
            caloriesOut = bmr * 1.2;
            break;
        //Lightly Active
        case 1:
            caloriesOut = bmr * 1.375;
            break;
        //Moderately Active
        case 2:
            caloriesOut = bmr * 1.55;
            break;
        //Very Active
        case 3:
            caloriesOut = bmr * 1.725;
            break;
        //Extremely Active
        case 4:
            caloriesOut = bmr * 1.9;
            break;
    }

    return caloriesOut;
}

//TODO put in utilities
function calculateDeficitForBasicTargets(nutritionPlan, nutritionProfile, bmr){
    var caloriesOut = calculateCaloriesOut(nutritionProfile, bmr);

    var caloriesIn = nutritionPlan.totalPlanCalories;

    var deficit = -(caloriesIn - caloriesOut) || 0;

    return deficit;
};

//TODO put in utilities
var calculateDeficit = function(nutritionPlan, activityPlan, nutritionProfile, bmr){
    if(nutritionProfile.isAdvancedNutrientTargets) {
        return calculateDeficitForAdvancedTargets(nutritionPlan, activityPlan, bmr);
    }
    else{
        return calculateDeficitForBasicTargets(nutritionPlan, nutritionProfile, bmr);
    }
};

//var calculateDeficit = function(nutritionPlan, activityPlan, bmr){
//   var additionalCaloriesExpended = 300;
//    var caloriesOut = 300;
//
//    if (activityPlan){
//        caloriesOut = activityPlan.totalCaloriesBurned + bmr;
//
//    }
//
//    var caloriesIn = nutritionPlan.totalPlanCalories;
//
//    return -(caloriesIn - caloriesOut - additionalCaloriesExpended);
//
//};

//BMR for Men = 66 + (13.8 x weight in kg.) + (5 x height in cm) - (6.8 x age in years)
//BMR for Women = 655 + (9.6 x weight in kg.) + (1.8 x height in cm) - (4.7 x age in years).
var calculateBmr = function(nutritionProfile){
    var age = nutritionProfile.age;
    var weightInLbs = nutritionProfile.weight;
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

/**
 * plan authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.plan.user.id !== req.user.id) {
		return res.send(403, {
			message: 'User is not authorized'
		});
	}
	next();
};