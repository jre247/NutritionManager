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
 * Food Schema
 */
var ActivitySchema = new Schema({
    planDateNonUtc: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
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
            name: {
                type: String,
                trim: true,
                default: ''
            },
            equipment: {
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
            averageSpeed: {
                type: Number,
                default: 0
            },
            reps: {
                type: Number,
                default: 0
            },
            sets: {
                type: Number,
                default: 0
            },
            weight: {
                type: Number,
                default: 0
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