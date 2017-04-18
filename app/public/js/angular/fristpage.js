var app = angular.module('StarterApp', ['ngMdIcons', 'ngMaterial']);

app.controller('AppCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav) {
	$scope.toggleSidenav = function(menuId) {
		$mdSidenav(menuId).toggle();
	};

}]);
// app.config(function($mdThemingProvider) {
// 	var customBlueMap = $mdThemingProvider.extendPalette('light-blue', {
// 		'contrastDefaultColor': 'light',
// 		'contrastDarkColors': ['50'],
// 		'50': 'ffffff'
// 	});
// 	$mdThemingProvider.definePalette('customBlue', customBlueMap);
// 	$mdThemingProvider.theme('default')
// 		.primaryPalette('customBlue', {
// 			'default': '500',
// 			'hue-1': '50'
// 		})
// 		.accentPalette('pink');
// 	$mdThemingProvider.theme('input', 'default')
// 		.primaryPalette('grey')
// });

///////////////////////////////////////////////////////////
// app.config(function($mdThemingProvider) {
// 	$mdThemingProvider.theme('default')
// 		.primaryPalette('pink')
// 		.accentPalette('orange');
// })
