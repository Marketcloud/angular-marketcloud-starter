'use strict'

/**
 * Manages the navbar view
 */

angular.module('provaMrkCldApp')
  .controller('navBarCtrl', function (cartFactory, $scope, $rootScope, $window, $log, marketcloud, Notification, paymentFactory) {
    //keeps track of how many elements are in the cart
    $scope.cartCount = 0;

    //Manages the logout
    $scope.logMeOut = function () {
      swal({
          title: "Logged Out!",
          text: "Page will be updated"
        }, function () {

          $log.info("calling marketcloud.users.logout")
          marketcloud.users.logout(function (err, data) {
            if(err) {
              $log.error(err)
            } else {
              $log.info("Logout ok " ,data)
            }
            $log.info("Function end")
          });
          $log.info("---end---")
          $rootScope.loggedIn = false;

          $scope.cookie_del();

          $log.log("loggedOut -> removing cookies")
          //cartFactory.cleanCart();
          $window.location.reload();
        }
      );
    }

    //Updates cartCount
    $scope.$on('cartUpdated', function (event, count) {
      $log.log("navBarCtrl -> Received cartUpdated Broadcast");
      $scope.cartCount = count;
      $log.log("count is " +count);
      $scope.$applyAsync();
    });


    //--------------------------------- DEBUG --------------------------------------
    /*
     |DEBUG| Removes all cookies
     */
    $scope.cookie_del = function () {
      marketcloud.storage.del("mc-cart-id")
      $log.info('marketcloud.storage.del("mc-cart-id")')
    }

    /*$scope.lastAddress_info = function(){
      paymentFactory.printAddresRecap(0)
    }

    $scope.address_info = function(){
      paymentFactory.printAddresRecap(1)
    }*/
    // --------------------------------- DEBUG --------------------------------------

  }).directive('navBar', function () { //directive x l'inserimento della navbar
  return {
    restrict: 'E',
    templateUrl: '../views/navBarView.html'
  };
});


