var app = angular.module('GroupApp', ['ngMaterial', 'ngMdIcons']);

app.controller('GroupCtrl', ['$scope', '$mdSidenav', '$http', '$element', function($scope, $mdSidenav, $http, $element) {
	$scope.toggleSidenav = function(menuId) {
		$mdSidenav(menuId).toggle();
	};
	$scope.Friendlist = [];
	// $scope.showfriend()




	$scope.showfriend = function() {

			//var url = "http://localhost:3000/showfriend"

			$http.get('http://localhost:3000/showfriend').success(function(data) {
				$scope.Friendlist = data;
				console.log('data')
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
		// $scope.items = [1, 2, 3, 4, 5];
	$scope.keep = function(data, select) {
		console.log('data', data)

	}
	$scope.selected = [1];
	$scope.toggle = function(item, list) {
		var idx = list.indexOf(item);

		if (idx > -1) {
			var uu = list.splice(idx, 1);
			console.log("idx", idx)
			console.log(uu)
		} else {
			list.push(item);
		}
	};

	$scope.exists = function(item, list) {
		return list.indexOf(item) > -1;
	};

	$scope.isIndeterminate = function() {
		return ($scope.selected.length !== 0 &&
			$scope.selected.length !== $scope.Friendlist.length);
	};

	$scope.isChecked = function() {
		return $scope.selected.length === $scope.Friendlist.length;
	};

	$scope.toggleAll = function() {
		if ($scope.selected.length === $scope.Friendlist.length) {
			// $scope.selected = $scope.items.slice(0);
			$scope.selected = [];
		} else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
			$scope.selected = $scope.Friendlist.slice(0);
			// $scope.selected = [];
		}
	};
}]);

// var app = angular.module('MyApp', ['ngMaterial'])
// app.controller('AppCtrl', function($scope) {
// 	$scope.items = [1, 2, 3, 4, 5];
// 	$scope.selected = [1];
// 	$scope.toggle = function(item, list) {
// 		var idx = list.indexOf(item);
// 		if (idx > -1) {
// 			list.splice(idx, 1);
// 		} else {
// 			list.push(item);
// 		}
// 	};

// 	$scope.exists = function(item, list) {
// 		return list.indexOf(item) > -1;
// 	};

// 	$scope.isIndeterminate = function() {
// 		return ($scope.selected.length !== 0 &&
// 			$scope.selected.length !== $scope.items.length);
// 	};

// 	$scope.isChecked = function() {
// 		return $scope.selected.length === $scope.items.length;
// 	};

// 	$scope.toggleAll = function() {
// 		if ($scope.selected.length === $scope.items.length) {
// 			// $scope.selected = $scope.items.slice(0);
// 			$scope.selected = [];
// 		} else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
// 			$scope.selected = $scope.items.slice(0);
// 			// $scope.selected = [];
// 		}
// 	};
// });
