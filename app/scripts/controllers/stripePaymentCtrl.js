'use strict'
/**
 * Manages the Stripe payment view
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

    //checks if all fields are valid
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

    //Checks if all fields have been filled and moves to the next view
    $scope.continue = function () {
      if (!validateCard($scope.cardInfos.card)) {
        swal("Whops...", "Card format error", "error");
        $scope.cardInfos.card = '';
        return
      }
      if (!validateDate($scope.cardInfos.expiration)) {
        swal("Whops...", "expiration date format must be MM/YYYY", "error");

        $scope.cardInfos.expiration = '';
        return
      }
      if(!validateCVC($scope.cardInfos.CVC)){
        $log.info($scope.cardInfos.CVC)
        swal("Whops...", "CVC must be 3 numbers long", "error");
        $scope.cardInfos.CVC = '';
        return
      }
      paymentFactory.setCardInfos($scope.cardInfos)
      $window.location.assign('/#/checkOutBilling');
    }

    //manages the back button
    $scope.back = function () {
      $window.history.back();
    }


    //------------------------validation functions---------------------------------
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
