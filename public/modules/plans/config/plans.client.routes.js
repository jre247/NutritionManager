'use strict';

// Setting up route
angular.module('plans').config(['$stateProvider',
	function($stateProvider) {
		// Plans state routing
		$stateProvider.
		state('listPlans', {
			url: '/plans',
			templateUrl: 'modules/plans/views/list-plans.client.view.html'
		}).
		state('createPlan', {
			url: '/plans/create',
			templateUrl: 'modules/plans/views/view-plan.client.view.html'
		}).
        state('createPlan2', {
            url: '/plans/create/:planDateForCreate',
            templateUrl: 'modules/plans/views/view-plan.client.view.html'
        }).
        state('createPlanForNewUser', {
            url: '/plans/create/:planDateForCreate/:isNewUser',
            templateUrl: 'modules/plans/views/view-plan.client.view.html'
        }).
		state('viewPlan', {
			url: '/plans/:planId',
            templateUrl: 'modules/plans/views/view-plan.client.view.html'
		}).
        state('editPlan', {
            url: '/plans/:planId/edit',
            templateUrl: 'modules/plans/views/create-plan.client.view.html'
        }).
        state('viewPlanForDate', {
            url: '/plans/:planDate/:planDateChangeDirection/:dayRange',
            templateUrl: 'modules/plans/views/view-plan.client.view.html'
        });

	}
]);