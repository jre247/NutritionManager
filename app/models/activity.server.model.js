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
    activityDateNonUtc:{
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
    activityType: {
        type: String,
        enum: ['cardiovascular', 'weight lifting', 'stretching', 'yoga', 'meditation'],
        default: ['cardiovascular']
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
    weight: {
        type: Number,
        default: 0
    },
    activityDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

mongoose.model('Activity', ActivitySchema);