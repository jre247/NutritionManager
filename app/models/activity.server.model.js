/**
 * Created by jason on 9/8/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * activity Schema
 */
var ActivitySchema = new Schema({
    planDateNonUtc: {
        type: Date
    },
    planDateAsMili:{
        type: Number
    },
    planDateAsConcat:{
        type: Number
    },
    planDateForDB: {
        type: String
        //required: 'Plan Date cannot be blank'
    },
    planDateYear:{
        type: Number
    },
    planDateMonth:{
        type: Number
    },
    planDateDay:{
        type: Number
    },
    created: {
        type: Date,
        default: Date.now
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
    totalCaloriesBurned:{
        type: Number,
        default: 0
    },
    planDate: {
        type: Date,
        default: Date.now
    },
    activities: [{
            activityType: {
                type: Number,
                default: 0
            },
            caloriesBurned:{
                type: Number,
                default: 0
            },
            name: {
                type: String,
                trim: true,
                default: ''
            },
            surface: {
                type: String,
                trim: true,
                default: ''
            },
            steps: {
                type: Number,
                default: 0
            },
            duration: {
                type: Number,
                default: 0
            },
            distance: {
                type: Number,
                default: 0
            },
            averageSpeed: {
                type: Number,
                default: 0
            },
            averageHeartRate: {
                type: Number,
                default: 0
            },
            intensity:{
                type: Number,
                default: 0
            },
            notes:{
                type: String,
                trim: true,
                default: ''
            },
            isActive: {
                type: Boolean,
                default: true
            },
            isEditable: {
                type: Boolean,
                default: true
            },
            isVisible: {
                type: Boolean,
                default: true

            }

        }]
});

mongoose.model('Activity', ActivitySchema);