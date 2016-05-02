'use strict'
/**
 * Manages the billing address view.
 */
angular.module('provaMrkCldApp')
  .controller('checkOutBilling', function ($scope, $rootScope, marketcloud, cartFactory, $log, $window, paymentFactory) {
    //console.log("checkOutBilling controller")
    if ($rootScope.loggedIn == undefined || !$rootScope.loggedIn) {
      $window.location.assign('/#');
    }

    $scope.sameAsShipping = false

    $scope.retrievedId = 0;

    $scope.billingInfos = {
      'id': '',
      'full_name': '',
      'address1': '',
      'city': '',
      'postal_code': '',
      'country': ''
    };

    //Manages the 'back' button
    $scope.back = function () {
      $window.history.back();
    }

    //Checks if all fields has been filled.
    $scope.validate = function () {
      if ($scope.billingInfos.address1 == "" || $scope.billingInfos.city == "" || $scope.billingInfos.full_name == "" ||
        $scope.billingInfos.postal_code == "" || $scope.billingInfos.country == "") {
        return false
      }
      if ($scope.billingInfos.address1 == undefined || $scope.billingInfos.city == undefined || $scope.billingInfos.full_name == undefined ||
        $scope.billingInfos.postal_code == undefined || $scope.billingInfos.country == undefined) {
        return false
      }
      return true
    }

    /**
     * Retireves the last shipping address id and copies its fields.
     */
    $scope.copyAddress = function () {
      if ($scope.sameAsShipping) {
        if (paymentFactory.shippingInfosFilled()) {
          $scope.billingInfos = angular.copy(paymentFactory.getLastShippingInfos())
        } else {
          $log.log("Errore in copyAddress")
          $scope.sameAsShipping = !$scope.sameAsShipping
        }
      }
    }


    /*
     This functions confirms the billing address. There are 3 possible scenarios.
     ______________________________________________________________________________________________
     [A] user asked to copy the shipping address datas. The '$scope.copyAddress' method has been called.
     User can continue to the recap view.
     ______________________________________________________________________________________________
     [B]  user didn't ask to copy the shipping address datas and filled the fields with a new address.
         This address has not been used previously for the shipping or billing.
         The new address will be registered and the id will be retireved in order to move to the recap view.
     ______________________________________________________________________________________________
     [C] This is similar to the B scenario but user setted an address that has already been used in the past
     by the same user. The address will not be registered again and the address id will be retrieved.
     The user will eventually move to the recap view.
     */
    $scope.save = function () {
      if ($scope.sameAsShipping) {
        paymentFactory.setBillingInfos($scope.billingInfos)
        $log.log("[A] : Billing infos setted |  OK")
        paymentFactory.checkBillingAndProceed()
      }
      else {
        $log.log("I have to check if  ", $scope.billingInfos + " has not been previously used")
        if ($scope.newAddress($scope.billingInfos)) {
          marketcloud.addresses.create($scope.billingInfos, function (err, data) {
            if (err) {
              $log.warn("Error in creating a new address (billing) :( ", err);
            } else {
              $log.warn("the new address has been created -> ", data)
              $scope.billingInfos.id = data.id
              paymentFactory.setBillingInfos($scope.billingInfos)
              $log.log("[B] : Billing infos setted |  OK")
              paymentFactory.addToAddressesList(data)
              paymentFactory.checkBillingAndProceed()
            }
          })
        }
        else {
          $log.info("This address has been previously used")
          $scope.billingInfos.id = $scope.retrievedId
          paymentFactory.setBillingInfos($scope.billingInfos)
          $log.log("[C] : Billing infos setted |  OK")
          paymentFactory.checkBillingAndProceed()
        }
      }
    }


    //Checks if an address has been previously used.
    $scope.newAddress = function (address) {
      var lastSavedAddresses = angular.copy(paymentFactory.getAddressesList())
      $log.info("List of the last addresses -> ", lastSavedAddresses)
      //$log.log("verify this -> " + address.full_name + ", " + address.address1 + ", " + address.city + ", " + address.country)
      for (var i = 0; i < lastSavedAddresses.length; i++) {
        if ((address.address1 == lastSavedAddresses[i].address1)
          && (address.city == lastSavedAddresses[i].city)
          && (address.country == lastSavedAddresses[i].country)
          && (address.full_name == lastSavedAddresses[i].full_name)) {
          $scope.retrievedId = lastSavedAddresses[i].id
          $log.log("Address has already been used -> Id will be retrieved. \n ID is "+$scope.retrievedId)
          return false
        }
      }
      $log.log("This is a new address. Will be sent to the server")
      return true
    }
  });
