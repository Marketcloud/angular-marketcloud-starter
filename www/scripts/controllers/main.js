'use strict';

/**
 * @ngdoc function
 * @name boilerplateMarketcloudAngularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the boilerplateMarketcloudAngularApp
 */
angular.module('boilerplateMarketcloudAngularApp')
  .controller('MainCtrl', ['$scope','marketcloud',function ($scope,marketcloud) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.products = [];
    marketcloud.products.list({},function(err,products){
    	$scope.products = products;
    	$scope.$apply()
    })
  }]);
