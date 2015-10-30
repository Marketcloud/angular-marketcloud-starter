'use strict';

/**
 * @ngdoc function
 * @name boilerplateMarketcloudAngularApp.controller:ProductCtrl
 * @description
 * # ProductCtrl
 * Controller of the boilerplateMarketcloudAngularApp
 */
angular.module('boilerplateMarketcloudAngularApp')
  .controller('ProductCtrl', ['$scope','marketcloud','$routeParams','$rootScope',
  	function ($scope,marketcloud,params,root) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    marketcloud.products.getById(params.id,function(err,product){
    	console.log(product)
    	$scope.product = product;
    	$scope.$apply();
    });

    $scope.addToCart = function(product) {
    	marketcloud.carts.add(root.cart.id,[{product_id:product.id,quantity:1}],function(err,cart){
    		if (err)
    			alert("ERR")
    		else {
    			console.log("Added stuff to the cart",cart)
    			root.$broadcast('cartUpdated',cart);
    		}
    		

    	});
    	
    }
  }]);
