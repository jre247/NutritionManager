/**
 * Created by jason on 8/10/14.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Food = mongoose.model('Food'),
    UserFoods = mongoose.model('UserFoods'),
    XLS = require('xlsjs'),
    _ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'food already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }

    return message;
};

/**
 * Create a Food
 */
exports.create = function(req, res) {
    var food = new Food(req.body);

    food.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(food);
        }
    });
};

/**
 * Show the current food
 */
exports.read = function(req, res) {
    res.jsonp(req.food);
};

/**
 * Update a food
 */
exports.update = function(req, res) {
    var food = req.food;

    food = _.extend(food, req.body);



    food.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(food);
        }
    });
};

/**
 * Delete a food
 */
exports.delete = function(req, res) {
    var food = req.food;

    food.remove(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(food);
        }
    });
};

/**
 * List of Foods
 */
exports.list = function(req, res) {
    Food.find().sort('name').exec(function(err, foods) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(foods);
        }
    });
};

exports.getUserFoodsByPartialText = function(req, res, callback) {
    var getFoodByFirstLetterOnly = req.param('searchByFirstLetterOnlyForUser');
    var skip = req.param('userFoodsSkip');
    var userId = req.param('userId');
    var userFoodTyped = req.param('userFoodTyped');

    var nSkip = parseInt(skip);
    if(skip === 'undefined'){
        nSkip = 0;
    }

    var typedText;
    if(userFoodTyped === 'null'){
        typedText = '';
    }

    UserFoods.findOne({'userId' : userId}).exec(function(err, userFoodsDb){
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            var userFoodIds = userFoodsDb.userFoods;

           // if(getFoodByFirstLetterOnly !== 'true'){
                Food.find({_id : {$in: userFoodIds}}).exec(function(err, foods) {
                    if (err) {
                        return res.send(400, {
                            message: getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(foods);
                    }
                });
          //  }
//            else{
//               // Food.find({'name' : new RegExp('^' + typedText, 'i')}, {'id' : {$in: userFoodIds}}).sort('name').skip(nSkip).limit(8).exec(function(err, foods) {
//                Food.find({_id : {$in: userFoodIds}}).exec(function(err, foods) {
//                    if (err) {
//                        return res.send(400, {
//                            message: getErrorMessage(err)
//                        });
//                    } else {
//                        res.jsonp(foods);
//                    }
//                });
//            }
        }
    });




};


exports.getFoodByPartialText = function(req, res, callback, typedText, foodsRange) {
    var getFoodByFirstLetterOnly = req.param('foodsRange');
    var skip = req.param('skip');

    var nSkip = parseInt(skip);
    if(skip === 'undefined'){
        nSkip = 0;
    }

    if(typedText === 'null'){
        typedText = '';
    }

    if(getFoodByFirstLetterOnly !== 'true'){
        Food.find({'name' : new RegExp(typedText, 'i')}).sort('name').skip(nSkip).limit(8).exec(function(err, foods) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(foods);
            }
        });
    }
    else{
        Food.find({'name' : new RegExp('^' + typedText, 'i')}).sort('name').skip(nSkip).limit(8).exec(function(err, foods) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(foods);
            }
        });
    }


};

/**
 * Food middleware
 */
exports.foodByID = function(req, res, next, id) {
    Food.findById(id).exec(function(err, food) {
        if (err) return next(err);
        if (!food) return next(new Error('Failed to load food ' + id));
        req.food = food;
        next();
    });
};

var getColumns = function(workbook){
    var columns = [];
    var sheet_name_list = workbook.SheetNames;

    var column = workbook.Sheets[sheet_name_list[0]]['A1'].v;
    var charPosition = 'A';
    var charPadding = '';
    var charPaddingChanged = false;

    var columnModel = {
        value: column,
        location: charPosition
    };

    columns.push(columnModel);

    while(column && column.length > 0){
        if(charPosition == 'Z'){
            if(charPadding.length <= 0){
                charPadding = 'A';
            }

            if(charPaddingChanged){
                charPadding = String.fromCharCode(charPadding.charCodeAt(0) + 1);
            }
            else{
                charPaddingChanged = true;
            }

            charPosition = 'A';
        }
        else {
            charPosition = String.fromCharCode(charPosition.charCodeAt(0) + 1);
        }
        var fullPosition = charPadding + charPosition + '';
        var fullPositionFirstRow = fullPosition + '' + 1;

        var columnField = workbook.Sheets[sheet_name_list[0]][fullPositionFirstRow];

        if(columnField) {
            column = columnField.v;

            var columnModel = {
                value: column,
                location: fullPosition
            };

            columns.push(columnModel);
        }
        else{
            column = null;
        }
    }

    return columns;
};

var fillFoodWithData = function(food, rowData){
    food.foodToken = rowData[0].columnData;
    food.name = rowData[1].columnData;
    food.water = rowData[2].columnData;
    food.calories = rowData[3].columnData;
    food.protein = rowData[4].columnData;
    food.fat = rowData[5].columnData;
    food.carbohydrates = rowData[7].columnData;
    food.fiber = rowData[8].columnData;
    food.sugar = rowData[9].columnData;
    food.calcium = rowData[10].columnData;
    food.iron = rowData[11].columnData;
    food.magnesium = rowData[12].columnData;
    food.phosphorus = rowData[13].columnData;
    food.potassium = rowData[14].columnData;
    food.sodium = rowData[15].columnData;
    food.zinc = rowData[16].columnData;
    food.copper = rowData[17].columnData;
    food.manganese = rowData[18].columnData;
    food.selenium = rowData[19].columnData;
    food.vitaminC = rowData[20].columnData;
    food.thiamin = rowData[21].columnData;
    food.riboflavin = rowData[22].columnData;
    food.niacin = rowData[23].columnData;
    food.vitaminB6 = rowData[25].columnData;
    food.folate = rowData[26].columnData;
    food.folicAcid = rowData[27].columnData;
    food.vitaminB12 = rowData[31].columnData;
    food.vitaminA = rowData[32].columnData;
    food.vitaminE = rowData[40].columnData;
    food.vitaminD = rowData[41].columnData;
    food.vitaminK = rowData[43].columnData;
    food.saturatedFat = rowData[44].columnData;
    food.monoFat = rowData[45].columnData;
    food.polyFat = rowData[46].columnData;
    food.cholesterol = rowData[47].columnData;
    food.importSource = 'usda';
    food.isImported = true;
    food.grams = 100;

    return food;
};

var findFoodForRow = function(workbook, currentRow, isDone, columns){
    var sheet_name_list = workbook.SheetNames;

    var column = columns[0];
    //var columnName = column.value;
    var columnLocation = column.location;
    var columnLocationForRow = columnLocation + '' + currentRow;

    var fieldForRow = workbook.Sheets[sheet_name_list[0]][columnLocationForRow];

    if(fieldForRow) {
        var foodToken = fieldForRow.v;
    }
    else{
        isDone = true;
    }
    //TODO: comment this out when ready
    //if (currentRow == 8) {
       // isDone = true;

      //  return isDone;
    //}

    if(!isDone) {
        Food.findOne({foodToken: foodToken}).exec(function (err, food) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                var rowData = [];

                var isRowFilled = false;

                for (var c = 0; c < columns.length; c++) {
                    var column = columns[c];
                    var columnName = column.value;
                    var columnLocation = column.location;
                    var columnLocationForRow = columnLocation + '' + currentRow;

                    var fieldForRow = workbook.Sheets[sheet_name_list[0]][columnLocationForRow];

                    if (fieldForRow) {
                        isRowFilled = true;
                    }

                    var rowColumnsDataModel = {
                        columnName: columnName,
                        columnData: fieldForRow ? fieldForRow.v : null
                    };

                    rowData.push(rowColumnsDataModel);

                }


                if (isRowFilled) {
                    if (food) {
                        food = fillFoodWithData(food, rowData);
                    }
                    else {
                        food = new Food();
                        food = fillFoodWithData(food, rowData);
                    }

                    food.save(function (err) {
                        if (err) {
                            return res.send(400, {
                                message: getErrorMessage(err)
                            });
                        } else {
                            currentRow++;

                            isDone = findFoodForRow(workbook, currentRow, isDone, columns);
                        }
                    });
                }
                else {
                    isDone = true;
                }
            }
        });
    }

};

exports.importFoodDataFromExcel = function(){
    var workbook = XLS.readFile('usda_foods/usda_food_list_2014_10_9.xls');

    var columns = getColumns(workbook);

    var isDone = false;
    var currentRow = 2;


    var isDone = findFoodForRow(workbook, currentRow, isDone, columns);
};



