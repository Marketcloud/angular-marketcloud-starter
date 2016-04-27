'use strict'

angular.module('provaMrkCldApp')
  .controller('navBarCtrl', function (cartFactory, $scope, $cookies, $rootScope, $window, $log, marketcloud, Notification, paymentFactory) {
   // $log.log("$rootScope: " + $rootScope.greet + " navBarCtrl Controller!");

    $scope.cartCount = 0;
    //Funzione per il logOut
    $scope.logMeOut = function () {
      swal({
          title: "Logged Out!",
          text: "La pagina verrà aggiornata"
        }, function () {
          $rootScope.loggedIn = false; //cambiamenti nella view
          $scope.cookie_del(); //elimino cookie
          $log.log("loggedOut -> Cookie rimosso")
          cartFactory.svuota();
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
     |DEBUG| Rimuove tutti i cookie
     */
    $scope.cookie_del = function () {
      var cookies = $cookies.getAll();
      angular.forEach(cookies, function (v, k) {
        $cookies.remove(k);
      });
      $log.log("Cookie rimossi -> ", $cookies);
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


