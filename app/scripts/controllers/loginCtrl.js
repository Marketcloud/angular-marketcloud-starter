'use strict'

/**
 * Manages the login view
 */

angular.module('provaMrkCldApp')
  .controller('loginCtrl', function ($scope, $cookies, $rootScope, marketcloud, $window, cartFactory, $log, Notification) {
    //$log.log("$rootScope: " + $rootScope.greet + " loginCtrl Controller!");

    //IMPORTANT: manages the status of the current user
    $rootScope.loggedIn = false;

    if(!/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent) && $rootScope.fromUpdatedCart){
      Notification.success({message: 'The cart has been updated', delay: 2500});
      $rootScope.fromUpdatedCart = false;
    }
    $scope.email = "";
    $scope.password = "";
    $scope.error = false;

    /*
     Manages the login 
     */
    $scope.login = function () {

      $log.log("email -> " + $scope.email + "  password -> " + $scope.password + " Error State = " + $scope.error);

        marketcloud.users.authenticate($scope.email, $scope.password, function (err, data) {
        if (err) {
          $log.log("Login failed \n" + err);
          $scope.error = true;
          $scope.$applyAsync()
        }
        else {
         // $log.info("logged in :  data is " ,data)

          var infoCookie = data.token
          var expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 1); //session will be 1 day long

          $cookies.put('mc-user-token', infoCookie), {'expires': expireDate};
          //mc-user.token is the token's name. infoCookie will cointains all the session's info.
          //$log.log(infoCookie);

          $scope.error = false;

          $rootScope.loggedIn = true;
          $rootScope.email = $scope.email

          cartFactory.createUserCart();
          
          $window.location.assign('/#');

          
          $log.log("Logged in with "+$scope.email);
          $log.log("Switching to logged cart....")
        }
      })
    }
  });
