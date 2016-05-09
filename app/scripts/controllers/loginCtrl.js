'use strict'

/**
 * Manages the login view
 */

angular.module('provaMrkCldApp')
  .controller('loginCtrl', function ($scope, $rootScope, marketcloud, $window, cartFactory, $log, Notification, $location) {
    //$log.log("$rootScope: " + $rootScope.greet + " loginCtrl Controller!");

    //if page is refreshed user will return to the main page
    if (!marketcloud.appStarted) {
      $location.url('/#');
      return
    }

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
         $log.info("logged in :  data is " ,data)

          $scope.error = false;

          $rootScope.loggedIn = true;
          $rootScope.email = $scope.email
          
          $log.log("Logged in with "+$scope.email);
          $log.log("Switching to logged cart....")

          cartFactory.createUserCart();

          $window.location.assign('/#');

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
          marketcloud.users.authenticateWithFacebook(user_id, access_token, function (err, data) {
            if (err) {
              $log.error("ERROR! -> ", err)
              $scope.error = true;
              $scope.$applyAsync()
            }
            else {
              $log.info("OK! -> ", data)
              $scope.error = false;

              $rootScope.loggedIn = true;

              //todo: ricava email da data
              $rootScope.email = data.user.email
              $log.log("Logged in with "+$rootScope.email);

              cartFactory.createUserCart();
              $log.log("Switching to logged cart....")

              $window.location.assign('/#');

            }
          })
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
                $scope.error = true;
                $scope.$applyAsync()

              }
              else {
                $log.info("OK! -> ", data)

                $scope.error = false;

                $rootScope.loggedIn = true;

                $rootScope.email = data.user.email
                $log.log("Logged in with "+$rootScope.email);

                cartFactory.createUserCart();
                $log.log("Switching to logged cart....")

                $window.location.assign('/#');
              }
            })
          }, {
            scope: 'public_profile,email'
          })
        }
      });
    }
  });
