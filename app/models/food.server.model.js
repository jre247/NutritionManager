'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Food Schema
 */
var FoodSchema = new Schema({
    foodId:{
        type: String
    },
	created: {
		type: Date,
		default: Date.now
	},
	name: {
		type: String,
		default: '',
		trim: true,
		required: 'Name cannot be blank'
	},
    type: {
        type: String,
        default: '',
        trim: true,
        required: 'Type cannot be blank'
    },
    calories: {
        type: Number,
        default: 0
    },
    protein: {
        type: Number,
        default: 0
    },
    fat: {
        type: Number,
        default: 0
    },
    carbohydrates: {
        type: Number,
        default: 0
    },
    grams: {
        type: Number,
        default: 0
    },
    milliliters: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }



});

mongoose.model('Food', FoodSchema);