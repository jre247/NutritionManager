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
        type: Number,
        default: 30
    },
    sex: {
        type: String,
        default: 'Female'
    },
    weight: {
        type: Number,
        default: 0
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
    }
});

mongoose.model('NutritionProfile', NutritionProfileSchema);