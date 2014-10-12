'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * User Schema
 */
var UserFoodsSchema = new Schema({
    userId:{
      type: String
    },
    userFoods: [
        {
            type: String
        }

    ]
});


mongoose.model('UserFoods', UserFoodsSchema);