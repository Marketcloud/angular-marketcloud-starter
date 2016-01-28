'use strict'
/**
 * Gestisce la view del billing address
 */
angular.module('provaMrkCldApp')
  .controller('checkOutBilling', function ($scope, $rootScope, marketcloud, cartFactory, $log, $window, paymentFactory) {
    console.log("checkOutBilling controller")
    if (($rootScope.loggedIn == undefined || !$rootScope.loggedIn)) {
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

    $scope.back = function () {
      $window.history.back();
    }

    //controlla che tutti i campi siano stati riempiti
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

    //recupera lo shipping address precedentemente inserito e ne copia i campi
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
     FUNZIONE PER CONFERMARE IL BILLING ADDRESS. Si divide in 3 casistiche
     ______________________________________________________________________________________________
     CASO 1: L'utente ha scelto di ricopiare le informazioni dell'indirizzo di spedizione  precedentemente inserito
     ed è  stata già fatta una copia delle informazioni (metodo copyAddress).
     Si procede quindi alla schermata riassuntiva
     ______________________________________________________________________________________________
     CASO 2: L'utente non ha scelto di ricopiare le informazioni dell'indirizzo di spedizione precedentemente inserito.
     L'utente ha quindi inserito un nuovo indirizzo, che non è stato trovato nell'archivio di spedizione
     L'indirizzo sarà quindi registrato sul server, in modo tale da ottenere un ID da utilizzare successivamente
     in fase di conferma dell'ordine.
     L'id ottenuto sarà settato come $scope.billingInfos.id e questi dati saranno quindi inviati al service.
     Si procede quindi alla schermata riassuntiva
     ______________________________________________________________________________________________
     CASO 3: A differenza del caso 2 l'indirizzo non è stato registrato sul server poiché l'utente ha inserito un
     indirizzo già esistente.
     Viene effetuata una scansione degli indirizzi presenti e viene recuperato l'id dell'indirizzo 'copia'.
     L'id ottenuto sarà settato come $scope.billingInfos.id e si procede infine alla schermata riassuntiva.
     */
    $scope.save = function () {
      if ($scope.sameAsShipping) {
        paymentFactory.setBillingInfos($scope.billingInfos)
        $log.log("CASO 1 : Billing infos setted |  OK")
        paymentFactory.checkBillingAndProceed()
      }
      else {
        $log.log("Devo controllare che ", $scope.billingInfos + " non sia uguale agli shipping address registrati")
        if ($scope.newAddress($scope.billingInfos)) {
          marketcloud.addresses.create($scope.billingInfos, function (err, data) {
            if (err) {
              $log.warn("Errore in creazione nuovo indirizzo (billing) :( ", err);
            } else {
              $log.warn("nuovo indirizzo salvato sul server -> ", data)
              $scope.billingInfos.id = data.id
              paymentFactory.setBillingInfos($scope.billingInfos)
              $log.log("CASO 2 : Billing infos setted |  OK")
              paymentFactory.addToAddressesList(data)
              paymentFactory.checkBillingAndProceed()
            }
          })
        }
        else {
          $log.info("l'indirizzo esiste già e quindi non sarà registrato")
          $scope.billingInfos.id = $scope.retrievedId
          paymentFactory.setBillingInfos($scope.billingInfos)
          $log.log("CASO 3 : Billing infos setted |  OK")
          paymentFactory.checkBillingAndProceed()
        }
      }
    }


    //Controlla un indirizzo è nuovo o meno
    $scope.newAddress = function (address) {
      var lastSavedAddresses = angular.copy(paymentFactory.getAddressesList())
      $log.info("Lista ultimi indirizzi salvati -> ", lastSavedAddresses)
      $log.log("Indirizzo di verifica -> " + address.full_name + ", " + address.address1 + ", " + address.city + ", " + address.country)
      for (var i = 0; i < lastSavedAddresses.length; i++) {
        if ((address.address1 == lastSavedAddresses[i].address1)
          && (address.city == lastSavedAddresses[i].city)
          && (address.country == lastSavedAddresses[i].country)
          && (address.full_name == lastSavedAddresses[i].full_name)) {
          $scope.retrievedId = lastSavedAddresses[i].id
          $log.log("indirizzo già usato -> non sarà aggiunto \n ID recuperato è "+$scope.retrievedId)
          return false
        }
      }
      $log.log("indirizzo nuovo -> sarà aggiunto")
      return true
    }

  });
