/**
 * Created by jason on 8/10/14.
 */
'use strict';

angular.module('foods').controller('FoodsParentContainerController', ['$scope', '$stateParams', '$location', 'Authentication', 'Foods', 'CoreUtilities',
    function($scope, $stateParams, $location, Authentication, Foods, CoreUtilities) {
        window.scope = $scope;


        $scope.selectedTab = 'myFoods';

        $scope.selectTab = function(tabName){
            $scope.selectedTab = tabName;
        };



    }
]);