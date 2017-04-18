var app = angular.module('GroupApp', ['ngMaterial', 'ngMdIcons']);

app.controller('GroupCtrl', ['$scope', '$mdSidenav', '$http', function($scope, $mdSidenav, $http) {
	$scope.toggleSidenav = function(menuId) {
		$mdSidenav(menuId).toggle();
	};

	$scope.member = [];
	// $scope.showfriend()
	$scope.value = $scope.name_group;
	console.log('test test', $scope.value)


	$scope.showmember = function(name_group) {

		//var url = "http://localhost:3000/showfriend"

		$http.get('http://localhost:3000/member/' + name_group).success(function(data) {
			$scope.member = data;
			console.log(data)
		}).error(function(data) {
			alert("error")
		})

		// $http({
		// 	method: 'GET',
		// 	url: 'http://localhost:3000/showfriend'
		// }).then(function successCallback(response) {
		// 	// this callback will be called asynchronously
		// 	// when the response is available
		// 	$scope.Friendlist = data;
		// }, function errorCallback(response) {
		// 	// called asynchronously if an error occurs
		// 	// or server returns response with an error status.
		// 	alert("error")
		// });

	}

}]);
