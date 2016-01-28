'use strict'

angular.module('provaMrkCldApp')
  .controller('loginCtrl', function ($scope, $cookies, $rootScope, marketcloud, $window, cartFactory, $log, Notification) {
    $log.log("$rootScope: " + $rootScope.greet + " loginCtrl Controller!");

    //init variabili $rootScope
    $rootScope.loggedIn = false; //sempre che l'init serva a qualcosa....

    if(!/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent) && $rootScope.fromUpdatedCart){
      Notification.success({message: 'Salvataggio automatico del carrello ', delay: 2500});
      $rootScope.fromUpdatedCart = false;
    }

    //init variabili $scope
    $scope.email = "";
    $scope.password = "";
    $scope.error = false;

    $scope.login = function () {

      $log.log("email -> " + $scope.email + "  password -> " + $scope.password + " Error State = " + $scope.error);

        marketcloud.users.authenticate($scope.email, $scope.password, function (err, data) {
        if (err) {
          $log.log("Autenticazione Fallita \n" + err);
          $scope.error = true;
          $scope.$applyAsync()
        }
        else {
         // $log.info("logged in :  data is " ,data)

          var infoCookie = data.token
          var expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 1); //durata 1 giorno
        //  $log.log("Data attuale -> " + new Date() + "| Data scadenza cookie = " + expireDate);
          // Setting a cookie
          $cookies.put('mc-user-token', infoCookie), {'expires': expireDate};
          //mc-user.token è il nome dato al token. infoCookie contiene le informazioni restituite dalla chiamata alle api
          //$log.log(infoCookie);

          $scope.error = false;

          $rootScope.loggedIn = true;
          $rootScope.email = $scope.email

          cartFactory.creaCarrelloUtente();
          $window.location.assign('/#');
         // $location.path("");

          $log.log("Logged in with "+$scope.email);
          $log.log("Switching to logged cart....")
        }
      })
    }
  });
