'use strict'
/**
 * Controller per la gestione del carrello.
 * In particolare, gestisce gli elementi relativi alla view del carrello poiché la gestione
 * effetiva del carrello è delegata alla factory cartFactory.js
 */
angular.module('provaMrkCldApp')
  .controller('cartCtrl', function ($scope, $cookies, $rootScope, marketcloud, cartFactory, $log, $window) {
    //$log.log("$rootScope: " + $rootScope.greet + " cartCtrl Controller!");
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
     * //TODO: SUPPORTO PER idVariante
     * @param id
     */
    $scope.removeProduct = function (id, variantId) {
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

          $log.log("product with id "+id+ " and variantId " +variantId)

          cartFactory.removeProduct(id, variantId); //$broadcast da cartService -> .on qua sotto x aggiornare carrello cartCtrl

          for (var i = 0; i < $scope.updateList.length; i++)
            if ($scope.updateList[i].product_id === id) {
              $scope.updateList.splice(i, 1);
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

      $scope.totalItems = count;
      // $log.log("CARTCTRL : Received price -> " + price);
      $scope.totalPrice = price;
      $scope.$applyAsync();
    });

    /**
     Chiede il carrello corrente alla factory
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
    //TODO: AGGIUNGERE SUPPORTO A idVariante
    $scope.updater = function (id, quantity, variantId) {

      $log.log("il carrello attuale è ",cartFactory.getLocalCart())
      $log.log("I dati ricevuti dall'updater sono " +id+ ", quantity: " +quantity+" e variantId " +variantId)

      var obj = new Object();
      obj.product_id = id;
      obj.quantity = quantity;
      obj.variant_id = variantId

      $log.log("Retrieving Cart")
      var cart = cartFactory.getLocalCart
      for (var i = 0; i < cart.length; i++) {
        $log.log(cart[i])
      }
      $log.log("modificato -> " + angular.toJson(obj, true));

      for (var i = 0; i < $scope.updateList.length; i++) {
        if ($scope.updateList[i].product_id == id) {
          $scope.updateList[i].quantity = quantity;
          $scope.updateList[i].variant_id = variantId
          $log.log("L'oggetto era già stato modificato precedentemente\n  > [i].quantity = " + quantity);
          $scope.saveCart();
          return;
        }
      }
      $log.log("L'oggetto non era stato modificato precedentemente\n > push(obj)");
      $scope.updateList.push(obj);
      $scope.saveCart();
    }

    //cambio di view - salva lo stato del carrello nel caso le quantità siano state modificate
    //TODO: VERIFICA ARRELLO AGGIORNATO CON VARIANTI
    $scope.$on('$locationChangeStart', function (event) {
      if ($scope.updateList.length != 0) {
        $log.warn("$scope.$on('$locationChangeStart' \n itemsService.updateCart($scope.updateList);");
        console.log($scope.updateList)
        cartFactory.updateCart($scope.updateList);
        $scope.updateList = [];
        $rootScope.fromUpdatedCart = true;
      }
    });

    //Moves to checkout window
    $scope.checkOutClick = function() {
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
    //--------------------------------------------------------------
  });
