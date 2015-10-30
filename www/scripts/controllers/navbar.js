'use strict';

/**
 * @ngdoc function
 * @name boilerplateMarketcloudAngularApp.controller:NavbarCtrl
 * @description
 * # NavbarCtrl
 * Controller of the boilerplateMarketcloudAngularApp
 */
angular.module('boilerplateMarketcloudAngularApp')
  .controller('NavbarCtrl', ['$scope','$rootScope','$cookies','marketcloud',function ($scope,root,cookies,marketcloud) {
  	$scope.itemsInCart = 0;
  	root.$on('cartUpdated',function(event,cart){
  		
  		$scope.itemsInCart = 0;
  		root.cart = cart;
  		$scope.cart = root.cart;
  		
  		

  		cart.items.forEach(function(e){
  			$scope.itemsInCart += e.quantity;
  		})
  		
  		$scope.$apply();
  		root.$apply();

  	})

  	if(!cookies.get('mc-cart-id'))
    	marketcloud.carts.create({},function(err,cart){
    		console.log("Carrello creato",cart)
    		cookies.put('mc-cart-id',cart.id);
    		root.$broadcast('cartUpdated',cart);
    	})
   	else {
   		marketcloud.carts.getById(cookies.get('mc-cart-id'),function(err,cart){
   			console.log("Ho ricaricato il carrello precedentemente creato",cart)
   			root.$broadcast('cartUpdated',cart);
   		})
   	}

   	$scope.showMobileSidebar = false;
   	$scope.toggleMobileSidebar = function() {
   		$("#side-nav").toggle('slide',{direction:'left'},400);
		      	$scope.showMobileSidebar = !$scope.showMobileSidebar;
		      
   	};

   		/*$("#page-wrapper").swipe( {
		    //Generic swipe handler for all directions
		    swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
		      if ('right' === direction && false === $scope.showMobileSidebar) {
		      	$("#side-nav").toggle('slide',{direction:'left'},400);
		      	$scope.showMobileSidebar = true;
		      }
		    }
		  });
		*/
   		$("#side-nav").swipe( {
		    //Generic swipe handler for all directions
		    swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
		      if ('left' === direction && true === $scope.showMobileSidebar) {
		      	$("#side-nav").toggle('slide',{direction:'left'},400);
		      	$scope.showMobileSidebar = false;
		      }
		    }
		  });
   		$(".side-nav-entry").click(function(){
   			$("#side-nav").toggle('slide',{direction:'left'},400);
		      	$scope.showMobileSidebar = false;
   		})
  }]);
