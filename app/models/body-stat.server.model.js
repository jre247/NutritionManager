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
var BodyStatsSchema = new Schema({
    planDateNonUtc: {
        type: Date
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
    weight:{
        type: Number,
        default: 0
    },
    bodyFatPercentage:{
        type: Number,
        default: 0
    },
    planDate: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('BodyStats', BodyStatsSchema);