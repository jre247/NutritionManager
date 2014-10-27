/**
 * Created by jason on 9/8/14.
 */
// Configuring the Articles module
angular.module('activities').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        //Menus.addMenuItem('topbar', 'Activities', 'activities', 'dropdown', '/activities(/create)?');
        Menus.addMenuItem('topbar', 'Activities', 'activities', '/activities');
       // Menus.addSubMenuItem('topbar', 'activities', 'List Activities', 'activities');
        //Menus.addSubMenuItem('topbar', 'activities', 'New Activity', 'activities/create');
    }
]);