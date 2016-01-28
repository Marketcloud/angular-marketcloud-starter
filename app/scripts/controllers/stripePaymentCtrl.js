'use strict'
/**
 * Gestisce la view per l'inserimento dei dati della carta di credito
 */
angular.module('provaMrkCldApp')
  .controller('stripePaymentCtrl', function ($scope, $log, paymentFactory, cartFactory, $location, $window, $rootScope) {
    if ($rootScope.loggedIn == undefined || !$rootScope.loggedIn) {
      $window.location.assign('/#');
    }

    $log.log("Stripe payment is on")
    $log.log($rootScope.loggedIn)

    $scope.total = cartFactory.getPrice();

    $scope.cardInfos = {
      'card': '4242424242424242',
      'CVC': '999',
      'expiration': '01/2019'
    }

    //Verifica che tutti i campi siano stati riempiti
    $scope.validate = function () {
      if (/*$scope.cardInfos.mail == "" ||*/ $scope.cardInfos.card == "" || $scope.cardInfos.CVC == "" ||
        $scope.cardInfos.expiration == "" ) {
        return false
      }
      if (/*$scope.cardInfos.mail == undefined ||*/ $scope.cardInfos.card == undefined || $scope.cardInfos.CVC == undefined ||
        $scope.cardInfos.expiration == undefined ) {
        return false
      }
      return true
    }

    //Verifica che i campi siano riempiti, validi e passa al controller successivo
    $scope.continue = function () {
      if (!validateCard($scope.cardInfos.card)) {
        swal("Oops...", "Numero carta errato", "error");
        $scope.cardInfos.card = '';
        return
      }
      if (!validateDate($scope.cardInfos.expiration)) {
        swal("Oops...", "Il formato della scadenza deve essere MM/YYYY", "error");

        $scope.cardInfos.expiration = '';
        return
      }
      if(!validateCVC($scope.cardInfos.CVC)){
        $log.info($scope.cardInfos.CVC)
        swal("Oops...", "Il CVC deve essere composto da 3 numeri", "error");
        $scope.cardInfos.CVC = '';
        return
      }
      paymentFactory.setCardInfos($scope.cardInfos)
      $window.location.assign('/#/checkOutBilling');
    }

    $scope.back = function () {
      $window.history.back();
    }


    //----------------funzioni per validare i campi---------------------------------
    function validateDate(date) {
      var filter = new RegExp("(0[123456789]|10|11|12)([/])([1-2][0-9][0-9][0-9])");
      if (filter.test(date)) {
        return true;
      }
      else {
        return false;
      }
    }

    function validateCard(card) {
      var filter = new RegExp("^\\d{16}$");
      if (filter.test(card)) {
        return true;
      }
      else {
        return false;
      }
    }

    function validateCVC(CVC) {
      var filter = new RegExp("[0-9][0-9][0-9]");
      if (filter.test(CVC)) {
        return true;
      }
      else {
        return false;
      }
    }
  });
