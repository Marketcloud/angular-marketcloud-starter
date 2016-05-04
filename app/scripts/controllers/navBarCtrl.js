'use strict'

/**
 * Manages the navbar view
 */

angular.module('provaMrkCldApp')
  .controller('navBarCtrl', function (cartFactory, $scope, $cookies, $rootScope, $window, $log, marketcloud, Notification, paymentFactory) {

    $scope.cartCount = 0;

    /**
     * Manages the logout
     */
    $scope.logMeOut = function () {
      swal({
          title: "Logged Out!",
          text: "Page will be updated"
        }, function () {
          $rootScope.loggedIn = false; 
        
          $scope.cookie_del(); 
        
          $log.log("loggedOut -> removing cookies")
          cartFactory.cleanCart();
          $window.location.reload();
        }
      );
    }

    $scope.$on('cartUpdated', function (event, count) {
      $log.log("navBarCtrl -> Received cartUpdated Broadcast");
      $scope.cartCount = count;
      $log.log("count is " +count);
      $scope.$applyAsync();
    });

    cartFactory.createCart();

    //--------------------------------- DEBUG --------------------------------------
    /*
     |DEBUG| Removes all cookies
     */
    $scope.cookie_del = function () {
      var cookies = $cookies.getAll();
      angular.forEach(cookies, function (v, k) {
        $cookies.remove(k);
      });
      $log.log("Cookie removed -> ", $cookies);
    }

    $scope.lastAddress_info = function(){
      paymentFactory.printAddresRecap(0)
    }

    $scope.address_info = function(){
      paymentFactory.printAddresRecap(1)
    }
    // --------------------------------- DEBUG --------------------------------------

  }).directive('navBar', function () { //directive x l'inserimento della navbar
  return {
    restrict: 'E',
    templateUrl: '../views/navBarView.html'
  };
});


