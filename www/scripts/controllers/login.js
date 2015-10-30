'use strict';

/**
 * @ngdoc function
 * @name boilerplateMarketcloudAngularApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the boilerplateMarketcloudAngularApp
 */
angular.module('boilerplateMarketcloudAngularApp')
  .controller('LoginCtrl', ['$scope','$cookies','marketcloud',function ($scope,$cookies,marketcloud) {
    $scope.email = null;
    $scope.password = null;

    $scope.error = null;
    $scope.login = function() {
    	marketcloud.users.authenticate($scope.email,$scope.password,function(err,data){
    		if (err)
    			$scope.error = 'Wrong credentials';
    		else {
    			$cookies.put('mc-user-token',data.token);
    		}
    	})
    }
  }]);
