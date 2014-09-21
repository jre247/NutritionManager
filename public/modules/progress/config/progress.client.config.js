/**
 * Created by jason on 9/19/14.
 */
// Configuring the Body module
angular.module('progress').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Progress', 'progress', 'dropdown', '/progress(/create)?');
        Menus.addSubMenuItem('topbar', 'progress', 'Show Progress', 'progress');
        //Menus.addSubMenuItem('topbar', 'progress', 'New Body Stat', 'body-stats/create');
    }
]);