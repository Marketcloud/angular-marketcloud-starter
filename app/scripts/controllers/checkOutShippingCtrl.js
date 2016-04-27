'use strict'
/**
 * Controller per la shippingView
 */
angular.module('provaMrkCldApp')
  .controller('checkOutShipping', function ($scope, $rootScope, cartFactory, $log, $location, $window, paymentFactory, $uibModal, $uibModalStack) {
   // $log.log("checkOutCtrl Controller!")
    if (($rootScope.loggedIn == undefined || !$rootScope.loggedIn)) {
      $window.location.assign('/#');
      return
    }

    $scope.shippingInfos = {
      'id': '',
      'full_name': '',
      'address1': '',
      'city': '',
      'postal_code': '',
      'country': ''
    };
    //copia la copia locale lista degli indirizzi dalla factory (per poi eventualmente aggiornarla)
    $scope.addresses = angular.copy(paymentFactory.getAddressesList())

    //Recupera gli indirizzi dal server
    marketcloud.addresses.list({}, function (err, data) {
      if (err) {
        $log.warn("Errore in download indirizzi -", err);
      }
      else {
        $log.info("Trovati " + data.length + " indirizzi")
        paymentFactory.setAddressesList(data)
        $scope.addresses = data
        $log.log("$scope.addresses settato a ", data)
      }
    })

    $scope.cancelFromShipping = function () {
      $window.location.assign('/#/cart');
    }

    //Valida i campi dell'indirizzo e procede al prossimo controller
    $scope.saveFromShipping = function () {
      $scope.shippingInfos.email = $rootScope.email
      $log.log("Email è "+$rootScope.email)
      $log.log("Sta iniziando il controllo newAddress")
      /**
       * Verifica che l'indirizzo sia un indirizzo nuovo
       * o uno già esistente
       */
      if ($scope.newAddress($scope.shippingInfos)) { //Verifica nuovo indirizzo
        marketcloud.addresses.create($scope.shippingInfos, function (err, data) {
          //CASO INDIRIZZO NUOVO
          if (err) {
            $log.warn("errore in creazione indirizzo :( ", err);
          } else {
            $log.warn("shipping_address salvato sul server -> ", data)
            $scope.shippingInfos.id = data.id
            $log.info("$scope.shippingInfos è ora", $scope.shippingInfos)
            paymentFactory.setShippingInfos($scope.shippingInfos)
            paymentFactory.addToAddressesList(data)
            $scope.addresses = angular.copy(paymentFactory.getAddressesList())
            $scope.$applyAsync()
            $window.location.assign('/#/stripePayment');
          }
        })
      }
      else {
        //CASO INDIRIZZO ESISTENTE
        paymentFactory.setShippingInfos($scope.shippingInfos)
        $log.info(paymentFactory.getLastShippingInfos())
        $window.location.assign('/#/stripePayment');
      }
    }

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

    //Seleziona un indirizzo fra quelli esistenti e ne copia i campi
    $scope.selectAddress = function (address) {
      $log.log(address)
      $scope.shippingInfos = address
      paymentFactory.setShippingInfos(address);
      $log.info($scope.shippingInfos)
      $uibModalStack.dismissAll()
    }

    //Rimuove (lato server) un indirizzo e aggiorna la lista locale nella factory
    $scope.deleteAddress = function (idArray) {
      marketcloud.addresses.delete(idArray, function (err, data) {
        if (err) {
          $log.log("error!!!!!!");
          return;
        }
        else {
          $log.log("Rimosso (server-side)")
          if (paymentFactory.removeFromAddressesList(idArray)) {
            $scope.addresses = angular.copy(paymentFactory.getAddressesList())
            $scope.$applyAsync()
            $log.log("Rimosso anche lato client")
          } else {
            $log.error("ERRORE IN RIMOZIONE INDIRIZZO LATO CLIENT")
          }
        }
      })
    }

    //controlla che tutti i campi siano stati riempiti
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

    //Verifica se un indirizzo sia nuovo o meno
    $scope.newAddress = function (address) {
      var lastSavedAddresses = angular.copy(paymentFactory.getAddressesList())
      $log.info("Lista ultimi indirizzi salvati -> ", lastSavedAddresses)
      $log.log("Indirizzo di verifica -> " + address.full_name + ", " + address.address1 + ", " + address.city + ", " + address.country)
      for (var i = 0; i < lastSavedAddresses.length; i++) {
        if ((address.address1 == lastSavedAddresses[i].address1)
          && (address.city == lastSavedAddresses[i].city)
          && (address.country == lastSavedAddresses[i].country)
          && (address.full_name == lastSavedAddresses[i].full_name)) {
          $log.log("indirizzo già usato -> non sarà aggiunto")
          return false
        }
      }
      $log.log("indirizzo nuovo -> sarà aggiunto")
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
