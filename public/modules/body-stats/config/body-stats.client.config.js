/**
 * Created by jason on 9/19/14.
 */
// Configuring the Body module
angular.module('bodyStats').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        //Menus.addMenuItem('topbar', 'Body Stats', 'bodyStats', 'dropdown', '/body-stats(/create)?');
       // Menus.addMenuItem('topbar', 'Body Stats', 'body-stats', '/body-stats');
        //Menus.addSubMenuItem('topbar', 'bodyStats', 'List Body Stats', 'body-stats');
       //Menus.addSubMenuItem('topbar', 'bodyStats', 'New Body Stat', 'body-stats/create');
    }
]);