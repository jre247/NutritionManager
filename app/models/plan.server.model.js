'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    FoodSchema = mongoose.model('Food');

/**
 * Plan Schema
 */
var PlanSchema = new Schema({
    planDateNonUtc:{
        type: Date
    },
    planDateAsUtc:{
        type: String
    },
	created: {
		type: Date,
		default: Date.now
	},
	planDate: {
		type: Date
        //required: 'Plan Date cannot be blank'
	},
    planDateForDB: {
        type: String
        //required: 'Plan Date cannot be blank'
    },
    isUpdate:{
        type: Boolean,
        default: false
    },
    userRoles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
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
                            },
                            saturatedFat:{
                                type: Number,
                                default: 0
                            },
                            fiber:{
                                type: Number,
                                default: 0
                            },
                            transfat:{
                                type: Number,
                                default: 0
                            },
                            cholesterol:{
                                type: Number,
                                default: 0
                            },
                            sugar:{
                                type: Number,
                                default: 0
                            },
                            vitaminA:{
                                type: Number,
                                default: 0
                            },
                            vitaminC:{
                                type: Number,
                                default: 0
                            },
                            calcium:{
                                type: Number,
                                default: 0
                            },
                            iron:{
                                type: Number,
                                default: 0
                            },
                            sodium:{
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
                        saturatedFat:{
                            type: Number,
                            default: 0
                        },
                        fiber:{
                            type: Number,
                            default: 0
                        },
                        transfat:{
                            type: Number,
                            default: 0
                        },
                        cholesterol:{
                            type: Number,
                            default: 0
                        },
                        sugar:{
                            type: Number,
                            default: 0
                        },
                        sodium:{
                            type: Number,
                            default: 0
                        },
                        vitaminA:{
                            type: Number,
                            default: 0
                        },
                        vitaminC:{
                            type: Number,
                            default: 0
                        },
                        calcium:{
                            type: Number,
                            default: 0
                        },
                        iron:{
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