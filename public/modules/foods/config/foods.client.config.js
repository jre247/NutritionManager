// Configuring the Articles module
angular.module('foods').run(['Menus',
    function(Menus) {
        // Set top bar menu items
       // Menus.addMenuItem('topbar', 'Foods', 'foods', 'dropdown', '/foods(/create)?');
        Menus.addMenuItem('topbar', 'Foods', 'foods', '/foods');
       // Menus.addSubMenuItem('topbar', 'foods', 'List Foods', 'foods');
        //Menus.addSubMenuItem('topbar', 'foods', 'New Food', 'foods/create');
    }
]);