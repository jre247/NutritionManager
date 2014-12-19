'use strict';


angular.module('core').controller('HomeController', ['$scope', '$stateParams', 'Authentication', '$location',
	function($scope, $stateParams, Authentication, $location) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

        if($scope.authentication.user){
            $location.path('/dashboard');
        }
	}
]);

