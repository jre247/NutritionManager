'use strict';


angular.module('core').controller('HomeController', ['$scope', '$stateParams', 'Authentication',
	function($scope, $stateParams, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);

