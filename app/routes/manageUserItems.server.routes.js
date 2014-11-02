

var users = require('../../app/controllers/users'),
    manageUserItems = require('../../app/controllers/manageUserItems');


module.exports = function(app) {

    // nutrition profile Routes

    app.route('/manageUserItems')
        .get(manageUserItems.read)
        .post(users.requiresLogin, manageUserItems.update)
        .put(manageUserItems.update);

};
