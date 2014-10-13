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
            if(userFoodsDb) {
                var userFoodIds = userFoodsDb.userFoods;

                // if(getFoodByFirstLetterOnly !== 'true'){
                Food.find({_id: {$in: userFoodIds}}).exec(function (err, foods) {
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
                res.jsonp([]);
            }
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
    var oneServingGrams = rowData[48].columnData;
    var servingsDelta = oneServingGrams / 100;

    food.foodToken = rowData[0].columnData;
    food.name = rowData[1].columnData;
    food.water = rowData[2].columnData * servingsDelta;
    food.calories = rowData[3].columnData * servingsDelta;
    food.protein = rowData[4].columnData * servingsDelta;
    food.fat = rowData[5].columnData * servingsDelta;
    food.carbohydrates = rowData[7].columnData * servingsDelta;
    food.fiber = rowData[8].columnData * servingsDelta;
    food.sugar = rowData[9].columnData * servingsDelta;
    food.calcium = rowData[10].columnData * servingsDelta;
    food.iron = rowData[11].columnData * servingsDelta;
    food.magnesium = rowData[12].columnData * servingsDelta;
    food.phosphorus = rowData[13].columnData * servingsDelta;
    food.potassium = rowData[14].columnData * servingsDelta;
    food.sodium = rowData[15].columnData * servingsDelta;
    food.zinc = rowData[16].columnData * servingsDelta;
    food.copper = rowData[17].columnData * servingsDelta;
    food.manganese = rowData[18].columnData * servingsDelta;
    food.selenium = rowData[19].columnData * servingsDelta;
    food.vitaminC = rowData[20].columnData * servingsDelta;
    food.thiamin = rowData[21].columnData * servingsDelta;
    food.riboflavin = rowData[22].columnData * servingsDelta;
    food.niacin = rowData[23].columnData * servingsDelta;
    food.vitaminB6 = rowData[25].columnData * servingsDelta;
    food.folate = rowData[26].columnData * servingsDelta;
    food.folicAcid = rowData[27].columnData * servingsDelta;
    food.vitaminB12 = rowData[31].columnData * servingsDelta;
    food.vitaminA = rowData[33].columnData * servingsDelta;
    food.vitaminE = rowData[40].columnData * servingsDelta;
    food.vitaminD = rowData[41].columnData * servingsDelta;
    food.vitaminK = rowData[43].columnData * servingsDelta;
    food.saturatedFat = rowData[44].columnData * servingsDelta;
    food.monoFat = rowData[45].columnData * servingsDelta;
    food.polyFat = rowData[46].columnData * servingsDelta;
    food.cholesterol = rowData[47].columnData * servingsDelta;
    food.importSource = 'usda';
    food.isImported = true;
    food.grams = oneServingGrams;
    food.servingDescription = rowData[49].columnData;

    return food;
};

var findFoodForRow = function(workbook, currentRow, isDone, columns, res){
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
//    if (currentRow == 8) {
//        isDone = true;
//
//        isDone = true;
//    }



    if(isDone){
        res.jsonp({isDone: true});
    }


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

                            isDone = findFoodForRow(workbook, currentRow, isDone, columns, res);
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

exports.importFoodDataFromExcel = function(req, res){
    var workbook = XLS.readFile('usda_foods/usda_food_list_2014_10_9.xls');

    var columns = getColumns(workbook);

    var isDone = false;
    var currentRow = 2;


    findFoodForRow(workbook, currentRow, isDone, columns, res);
};



