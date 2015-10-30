'use strict';

/**
 * @ngdoc function
 * @name boilerplateMarketcloudAngularApp.controller:CheckoutCtrl
 * @description
 * # CheckoutCtrl
 * Controller of the boilerplateMarketcloudAngularApp
 */
angular.module('boilerplateMarketcloudAngularApp')
  .controller('CheckoutCtrl', ['$scope',function ($scope,stripe) {
  	$scope.shipping_address = {};
  	$scope.billing_address = {};
  	$scope.card_informations = {};
  }]);
