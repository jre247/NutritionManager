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
    planDateForDB: {
        type: String
        //required: 'Plan Date cannot be blank'
    },
    created: {
        type: Date,
        default: Date.now
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
//            exercises: [
//                {
//                    reps: {
//                        type: Number,
//                        default: 0
//                    },
//                    sets: {
//                        type: Number,
//                        default: 0
//                    },
//                    weight: {
//                        type: Number,
//                        default: 0
//                    },
//                    Name:{
//                        type: String,
//                        default: '',
//                        trim: true
//                    },
//                    ExerciseType:{
//                        type: String,
//                        default: '',
//                        trim: true
//                    },
//                    PrimaryMuscleGroupName:{
//                        type: String,
//                        default: '',
//                        trim: true
//                    },
//                    PrimaryMuscleGroupId:{
//                        type: Number
//                    },
//                    SecondaryMuscleGroup:{
//                        type: String,
//                        default: '',
//                        trim: true
//                    },
//                    SecondaryMuscleGroupId:{
//                        type: Number
//                    },
//                    ExerciseId:{
//                        type: Number
//                    }
//                }
//            ],

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