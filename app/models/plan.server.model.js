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
	planDate: {
		type: Date,
        required: 'Plan Date cannot be blank'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    meals:
        [
            {
                type: {
                    type: Number
                },
                foods: [
                    {
                        selectedFood: {
                            foodId: {
                                type: String
                            },
                            name: {
                                type: String
                            },
                            type: {
                                type: String
                            },
                            calories: {
                                type: Number,
                                default: 0
                            },
                            carbohydrates: {
                                type: Number,
                                default: 0
                            },
                            fat: {
                                type: Number,
                                default: 0
                            },
                            protein: {
                                type: Number,
                                default: 0
                            },
                            grams: {
                                type: Number,
                                default: 0
                            }
                        },
                        servings: {
                            type: Number,
                            default: 0
                        },
                        calories: {
                            type: Number,
                            default: 0
                        },
                        carbohydrates: {
                            type: Number,
                            default: 0
                        },
                        fat: {
                            type: Number,
                            default: 0
                        },
                        protein: {
                            type: Number,
                            default: 0
                        },
                        grams: {
                            type: Number,
                            default: 0
                        },
                        isEditable: {
                            type: Boolean,
                            default: false
                        }

                    }
                ],

                isActive: {
                    type: Boolean,
                    default: true
                },
                isVisible: {
                    type: Boolean,
                    default: true

                },
                isEditable: {
                    type: Boolean,
                    default: true
                }
            }
        ]

});

mongoose.model('Plan', PlanSchema);