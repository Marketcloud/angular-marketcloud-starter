'use strict'
/**
 * shipping view controller
 */
angular.module('provaMrkCldApp')
  .controller('checkOutShipping', function ($scope, $rootScope, cartFactory, $log, $location, $window, paymentFactory, $uibModal, $uibModalStack) {
   // $log.log("checkOutCtrl Controller!")
    if ($rootScope.loggedIn == undefined || !$rootScope.loggedIn) {
      $window.location.assign('/#');
    }

    $scope.shippingInfos = {
      'id': '',
      'full_name': '',
      'address1': '',
      'city': '',
      'postal_code': '',
      'country': ''
    };
    
    $scope.addresses = angular.copy(paymentFactory.getAddressesList())

    //retrieves the addresses list from the server
    marketcloud.addresses.list({}, function (err, data) {
      if (err) {
        $log.warn("Error in downloading addresses -", err);
      }
      else {
        $log.info("found " + data.length + " addresses")
        paymentFactory.setAddressesList(data)
        $scope.addresses = data
        $log.log("$scope.addresses setted to", data)
      }
    })

    //manages he 'back' button
    $scope.cancelFromShipping = function () {
      $window.location.assign('/#/cart');
    }

    /*
     * Checks if the address is a valid and moves to the next controller
     */
    $scope.saveFromShipping = function () {
      $scope.shippingInfos.email = $rootScope.email
      $log.log("Email is "+$rootScope.email)
      $log.log("Will check for the new address")
      // Checks if the address has already been used or is a new one
      if ($scope.newAddress($scope.shippingInfos)) { 
        marketcloud.addresses.create($scope.shippingInfos, function (err, data) {
          //new address
          if (err) {
            $log.warn("Error in creating the new address :( ", err);
          } else {
            $log.info("a new address has been created -> ", data)
            $scope.shippingInfos.id = data.id
            
            $log.info("$scope.shippingInfos is now", $scope.shippingInfos)
            paymentFactory.setShippingInfos($scope.shippingInfos)
            paymentFactory.addToAddressesList(data)
            
            $scope.addresses = angular.copy(paymentFactory.getAddressesList())
            $scope.$applyAsync()
            $window.location.assign('/#/stripePayment');
          }
        })
      }
      else {
        //already used address
        paymentFactory.setShippingInfos($scope.shippingInfos)
        $log.info(paymentFactory.getLastShippingInfos())
        $window.location.assign('/#/stripePayment');
      }
    }

    /**
     * Creates a modal with all the addresses previously created
     */
    $scope.checkAddresses = function () {
      $scope.addresses = angular.copy(paymentFactory.getAddressesList())
      $scope.$applyAsync()

      $uibModal.open({
        animation: 1,
        templateUrl: 'views/addressesPopUp.html',
        scope: $scope,
        size: 'lg'
      });
    }

    //Selects a previously used addresses and copies its data.
    $scope.selectAddress = function (address) {
      $log.log(address)
      $scope.shippingInfos = address
      
      paymentFactory.setShippingInfos(address);
      
      $log.info($scope.shippingInfos)
      $uibModalStack.dismissAll()
    }
      /**
       * Deletes a previously used address and updates the local addresses list.
       * @param idArray address id
       */
    $scope.deleteAddress = function (idArray) {
      marketcloud.addresses.delete(idArray, function (err, data) {
        if (err) {
          alert("error in deleting address : see log");
          $log.log(err)
          return;
        }
        else {
          $log.log("address removed (server-side)")
          if (paymentFactory.removeFromAddressesList(idArray)) {
            $scope.addresses = angular.copy(paymentFactory.getAddressesList())
            $scope.$applyAsync()
          } else {
            $log.error("error in removing address from the local list (client-side)")
          }
        }
      })
    }

    /**
     * Checks if all fields have been filled
     * @returns {boolean}
     */
    $scope.validate = function () {
      if ($scope.shippingInfos.address1 == "" || $scope.shippingInfos.city == "" || $scope.shippingInfos.full_name == "" ||
        $scope.shippingInfos.postal_code == "" || $scope.shippingInfos.country == "") {
        return false
      }
      if ($scope.shippingInfos.address1 == undefined || $scope.shippingInfos.city == undefined || $scope.shippingInfos.full_name == undefined ||
        $scope.shippingInfos.postal_code == undefined || $scope.shippingInfos.country == undefined) {
        return false
      }
      return true
    }
    
      /**
       * Checks if an address has been already used
       * @param address array with address datas
       * @returns {boolean}
       */
    $scope.newAddress = function (address) {
      var lastSavedAddresses = angular.copy(paymentFactory.getAddressesList())
      $log.info("list of the last addresses -> ", lastSavedAddresses)

      for (var i = 0; i < lastSavedAddresses.length; i++) {
        if ((address.address1 == lastSavedAddresses[i].address1)
          && (address.city == lastSavedAddresses[i].city)
          && (address.country == lastSavedAddresses[i].country)
          && (address.full_name == lastSavedAddresses[i].full_name)) {
          $log.log("This address has already been used.")
          return false
        }
      }
      $log.log("This address is a new one.")
      return true
    }


    //----DEBUG------------------------------------------
    $scope.switchModules = function () {
      $scope.shippingModule = !$scope.shippingModule
      $scope.billingModule = !$scope.billingModule
    }

    $scope.printInfos = function () {
      console.log($scope.shippingInfos)
      console.log($scope.billingInfos)
    }
    //----DEBUG------------------------------------------
  })
