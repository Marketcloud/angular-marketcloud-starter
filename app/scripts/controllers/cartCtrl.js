'use strict'
/**
 * Controller per la gestione del carrello.
 * In particolare, gestisce gli elementi relativi alla view del carrello poiché la gestione
 * effetiva del carrello è delegata alla factory cartFactory.js
 */
angular.module('provaMrkCldApp')
  .controller('cartCtrl', function ($scope, $cookies, $rootScope, marketcloud, cartFactory, $log, $window) {
    $log.log("$rootScope: " + $rootScope.greet + " cartCtrl Controller!");
    $scope.carrelloAttuale = cartFactory.getLocalCart();
    $log.info("$scope.carrelloAttuale is ", $scope.carrelloAttuale)

    $scope.totalItems = cartFactory.exposeGetCount();
    $scope.totalPrice = cartFactory.getPrice();

    $scope.updateList = [];

    /**
     * Ritorna la conta degli elementi presenti nel carrello
     */
    $scope.getCount = function () {
      return cartFactory.exposeGetCount();
    }

    /*
     Ritorna il prezzo complessivo degli elementi del carrello
     */
    $scope.getPrice = function () {
      return cartFactory.getPrice();
    }

    /*
     Invoca il metodo (presente nella factory) per svuotare il carrello
     */
    $scope.svuotaCarrello = function () {
      return cartFactory.svuota();
    }

    /**
     * Invoca il metodo (presente nella factory) per eliminare un prodotto dal carrello
     * @param id
     */
    $scope.removeProduct = function (id) {
      swal({
        title: "Conferma",
        text: "Vuoi Eliminare questo prodotto?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, continua",
        cancelButtonText: "No, Ho cambiato idea",
        closeOnConfirm: false,
        closeOnCancel: false
      }, function (isConfirm) {
        if (isConfirm) {
          $log.log("$scope.removeProduct = function (" + id + ") {")
          cartFactory.removeProduct(id); //$broadcast da cartService -> .on qua sotto x aggiornare carrello cartCtrl
          for (var i = 0; i < $scope.updateList .length; i++)
            if ($scope.updateList [i].product_id === id) {
              $scope.updateList .splice(i, 1);
              break;
            }
          swal("Ok", "Prodotto rimosso!", "success");
        } else {
          swal.close();
        }
      });
    }

    //Aggiorna alcune variabili ogni volta che il carrello viene aggiornato
    $scope.$on('cartUpdated', function (event, count, price) {
      $scope.getCart();
      //  $log.log("navBarCtrl -> Received cartUpdated Broadcast");
      //  $log.log("CARTCTRL : Received totalItems -> " + count);
      $scope.totalItems = count;
      // $log.log("CARTCTRL : Received price -> " + price);
      $scope.totalPrice = price;
      $scope.$applyAsync();
    });

    /**
     chiede il carrello corrente alla factory
     */
    $scope.getCart = function () {
      $log.log("$scope.getCart()");
      $scope.carrelloAttuale = cartFactory.getLocalCart();
    }

    /*
     Salva lo stato del carrello
     */
    $scope.saveCart = function () {
      $log.log("Setting cartFactory cart to ", $scope.carrelloAttuale);
      cartFactory.setLocalCart($scope.carrelloAttuale);
    }


    //Metodo per aggiornare l'array con le modifiche alle quantità
    $scope.updater = function (id, quantity) {
      var obj = new Object();
      obj.product_id = id;
      obj.quantity = quantity;
      $log.log("modificato -> " + angular.toJson(obj, true));

      for (var i = 0; i < $scope.updateList.length; i++) {
        if ($scope.updateList [i].product_id == id) {
          $scope.updateList [i].quantity = quantity;
          $log.log("L'oggetto era già stato modificato precedentemente\n  > [i].quantity = " + quantity);
          $scope.saveCart();
          return;
        }
      }
      $log.log("L'oggetto non era stato modificato precedentemente\n > push(obj)");
      $scope.updateList.push(obj);
      $scope.saveCart();
    }

    $scope.sendUpdatedCartToServer = function () {

    }

    //cambio di view - salva lo stato del carrello nel caso le quantità siano state modificate
    $scope.$on('$locationChangeStart', function (event) {
      if ($scope.updateList.length != 0) {
        $log.warn("$scope.$on('$locationChangeStart' \n itemsService.updateCart($scope.updateList);");
        console.log($scope.updateList)
        cartFactory.updateCart($scope.updateList);
        $scope.updateList = [];
        $rootScope.fromUpdatedCart = true;
      }
    });

    $scope.checkOutClick = function() {
      $log.log("Click!")

      console.log("am I logged? "+$rootScope.loggedIn)

      if(!$rootScope.loggedIn) {
        alert("Effettua il login prima di fare checkout!")
        $window.location.assign('/#/login');
        return
      }
      if($rootScope.loggedIn != undefined || $rootScope.loggedIn ) {
        $window.location.assign('/#/checkOutAddress');
      }
    }

    //-----------------------------DEBUG---------------------------
    /**
     * |DEBUG| stampa in console il carrello e la lista delle quantità aggiornate
     */
    $scope.secretDebug = function () {
      $log.log("Carrello attuale is ", $scope.carrelloAttuale);
      $log.log("$scope.updateList is ", $scope.updateList);
    }
    //fine-----------------------------DEBUG------------------------
  });
