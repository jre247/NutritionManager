'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    FoodSchema = mongoose.model('Food');
  //  FoodSchema = require('Food');

/**
 * Plan Schema
 */
var PlanSchema = new Schema({
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
	planDate: {
		type: Date,
        required: 'Plan Date cannot be blank'
	},
    allFoods: [
        {
            id:{
              type: String
            },
            name:{
                type: String,
                trim: true,
                default: ''
            }
        }
    ],
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    meals:
        [
            {
                name: {
                    type: String,
                    trim: true,
                    default: ''
                },
                type: {
                    type: String,
                    trim: true,
                    default: ''
                },
                foods: [{
                    food: {
                        type: Schema.ObjectId,
                        ref: 'Food'
                    },
                    servings:{
                        type: Number,
                        default: 0
                    },
                    totalCalories:{
                        type: Number,
                        default: 0
                    },
                    totalCarbohydrates:{
                        type: Number,
                        default: 0
                    },
                    totalFat:{
                        type: Number,
                        default: 0
                    },
                    totalProtein:{
                        type: Number,
                        default: 0
                    },
                    totalGrams:{
                        type: Number,
                        default: 0
                    },
                    isEditable:{
                        type: Boolean,
                        default: false
                    }
                }],

                isActive: {
                    type: Boolean,
                    default: true
                }

            }
        ]

});

mongoose.model('Plan', PlanSchema);