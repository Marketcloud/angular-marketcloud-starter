'use strict'

/**
 * Manages the login view
 */

angular.module('provaMrkCldApp')
  .controller('loginCtrl', function ($scope, $cookies, $rootScope, marketcloud, $window, cartFactory, $log, Notification, $location) {
    //$log.log("$rootScope: " + $rootScope.greet + " loginCtrl Controller!");

    //if page is refreshed user will return to the main page
    if (!marketcloud.appStarted) {
      $location.url('/#');
      return
    }

    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        $log.info('was logged in.');
        FB.logout()
        $log.info("now is logged out...")
      }
    });

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

    /**
     * Login with facebook SDK
     */
    $scope.facebookLogin = function () {
      FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
          $log.info('Already logged in');
          var access_token = response.authResponse.accessToken;
          var user_id = response.authResponse.userID;
          $log.log(access_token)
          $log.log(user_id)

        }
        else {
          $log.log("Loggin in...")
          FB.login(function (res) {
            $log.info("Logged in")

            var access_token = res.authResponse.accessToken;
            var user_id = res.authResponse.userID;

            $log.log("Access Token is "+access_token)
            $log.log("User Id is " +user_id)

            marketcloud.users.authenticateWithFacebook(user_id, access_token, function (err, data) {
              if (err) {
                $log.error("ERROR! -> ", err)
              }
              else {
                $log.info("OK! -> ", data)
              }
            })
          })
        }
      });
    }
  });


/*
 $log.info("Logged in -> managing data")

 marketcloud.users.authenticateWithFacebook(response.authResponse.userID, response.authResponse.accessToken, function (err, data) {

 if (err) {
 $log.error("ERROR! -> ", err)
 }
 else {
 $log.info("OK! -> ", data)
 }
 })
 */
