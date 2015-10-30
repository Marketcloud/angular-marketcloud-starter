'use strict';

/**
 * @ngdoc function
 * @name boilerplateMarketcloudAngularApp.controller:CartCtrl
 * @description
 * # CartCtrl
 * Controller of the boilerplateMarketcloudAngularApp
 */
angular.module('boilerplateMarketcloudAngularApp')
  .controller('CartCtrl', ['$scope','marketcloud','$rootScope',function ($scope,marketcloud,root) {
    $scope.update = function() {
    	var update = [];
    	
    	$scope.cart.items.forEach(function(i){
    		update.push({
    			product_id : i.id,
    			quantity : i.quantity
    		})
    	})

    	marketcloud.carts.update($scope.cart.id,update,function(err,cart){
    		
    		if (err)
    			console.log(err)
    		else{
    			update = []

    			root.$broadcast('cartUpdated',cart);
    			$scope.cart = {};
    			$scope.$apply();
    			console.log("WURSTELLLLONE",cart)
    			$scope.cart = cart;
    			$scope.$apply();
    		}
    		
    		
    	})
    };
    $scope.checkout = function() {};
    $scope.selectedShipping = {
        name : "Default shipping",
        price : 9.99
    }
    $scope.totalCartValue = function() {
        var total = 0;
        if ($scope.cart)
        $scope.cart.items.forEach(function(i){
            total += Number(i.price)*i.quantity;
        })
        return total;
    }
  }]);
