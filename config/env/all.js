'use strict';

module.exports = {
	app: {
		title: 'Nutrition Manager',
		description: 'Manages Nutrition Tracking.',
		keywords: 'nutrition, fit2create, nutricreate, jason, evans, jenna, pocius'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: '1108',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
                'public/lib/bootstrap-tour/bootstrap-tour.css'
			],
			js: [
                'public/lib/jquery/jquery.js',
                'public/lib/jquery/jquery-ui.min.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-route/angular-route.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/bootstrap/dist/js/bootstrap.js',
                'public/lib/bootstrap-tour/bootstrap-tour.js'
                //'public/lib/bootstrap-tour/bootstrap-tour-popover.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};