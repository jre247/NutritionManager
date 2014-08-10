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
    calories: {
        type: Number,
        default: 0
    },
    Protein: {
        type: Number,
        default: 0
    },
    Fat: {
        type: Number,
        default: 0
    },
    Carbohydrates: {
        type: Number,
        default: 0
    }

});

mongoose.model('Food', FoodSchema);