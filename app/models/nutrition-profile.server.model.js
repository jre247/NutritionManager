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
        type: Number
    },
    carbohydratesPercentageTarget: {
        type: Number
    },
    fatPercentageTarget: {
        type: Number
    },
    averageCaloriesTarget: {
        type: Number
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    age: {
        type: Number
    },
    sex: {
        type: String,
        default: 'Female'
    },
    weight: {
        type: Number
    },
    height: {
        type: Number
    },
    restingHeartRate: {
        type: Number
    },
    bodyFatPercentage: {
        type: Number
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('NutritionProfile', NutritionProfileSchema);