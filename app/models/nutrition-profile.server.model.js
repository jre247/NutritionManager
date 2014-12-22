/**
 * Created by jason on 9/4/14.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Plan Schema
 */
var NutritionProfileSchema = new Schema({
    proteinPercentageTarget: {
        type: Number,
        default: 20
    },
    carbohydratesPercentageTarget: {
        type: Number,
        default: 40
    },
    fatPercentageTarget: {
        type: Number,
        default: 40
    },
    averageCaloriesTarget: {
        type: Number
    },
    deficitTarget: {
        type: Number,
        default: 500
    },
    isAdvancedNutrientTargets:{
        type: Boolean,
        default: false
    },
    activityLevel:{
        type: Number,
        default: 0
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    age: {
        type: Number,
        default: 30
    },
    sex: {
        type: String,
        default: 'Female'
    },
    weight: {
        type: Number,
        default: 130
    },
    heightFeet: {
        type: Number,
        default: 5
    },
    heightInches: {
        type: Number,
        default: 1
    },
    restingHeartRate: {
        type: Number,
        default: 0
    },
    bodyFatPercentage: {
        type: Number,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now
    },
    templateMeals: [
        {
            id: {
                type: Number
            },
            name: {
                type: String
            }
        }
    ],
    hideWeightOnHomeScreen:{
        type: Boolean,
        default: false
    },
    userActivities: [
        {
            activityId: String
        }

    ]
});

mongoose.model('NutritionProfile', NutritionProfileSchema);