'use strict';

/**
 * @ngdoc function
 * @name boilerplateMarketcloudAngularApp.controller:SignupCtrl
 * @description
 * # SignupCtrl
 * Controller of the boilerplateMarketcloudAngularApp
 */
angular.module('boilerplateMarketcloudAngularApp')
  .controller('SignupCtrl', ['$scope','marketcloud',function ($scope,marketcloud) {
  	$scope.email = null;
  	$scope.password = null;
  	$scope.confirm_password = null;
  	$scope.error = null;
  	$scope.formStatus = null;
    $scope.signup = function() {
    	console.log($scope.email,$scope.password)
    	marketcloud.users.create({
    		email : $scope.email,
    		password : $scope.password
    	},function(err,user){
    		if (err){
    			$scope.error = 'An error has occurred, please try again';
    			$scope.formStatus = 'error';

    		}
    		else
    			$scope.formStatus = 'completed'
    		$scope.$apply()
    	})
    }
  }]);
