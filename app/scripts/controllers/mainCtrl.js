'use strict'

angular.module('provaMrkCldApp')
  .controller('mainCtrl', function (cartFactory, $scope, $rootScope, marketcloud, $uibModal, $log, Notification, $uibModalStack) {
    $log.log("$rootScope: "+ $rootScope.greet + " mainCtrl Controller!");

    //init variabili $scope
    $scope.products = [];

    $scope.productsToShow = [];
    $scope.categories = []

    $scope.filterId = ""

    if(!/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent) && $rootScope.fromUpdatedCart){
      Notification.success({message: 'Salvataggio automatico del carrello ', delay: 2500});
      $rootScope.fromUpdatedCart = false;
    }

    //Funzione per recuperare i prodotti dello store
    marketcloud.products.list({}, function (err, products) {
      if (err) {
        alert("Critical error - Recupero prodotti");
      } else {
        $scope.productsToShow = products
        $scope.products = products;
        $scope.$applyAsync()
        //$log.warn("leggi qui " ,$scope.productsToShow)
      }
    });

    //recupero delle categorie
    marketcloud.categories.list({}, function(err,categories){
      if (err)
      {
        $log.log("Errore in recupero categorie")
      }
      else {
        for (var i = 0; i < categories.length; i++) {
          var obj = {};
          $scope.categories.push({
            id:   categories[i].id,
            name: categories[i].name
          });
        }
        $log.info("CATEGORY LIST ->>> ",$scope.categories)
        $scope.$applyAsync()
      }
    });

    //Funzione per aprire un popup con i dettagli del prodotto
    $scope.clickToOpen = function (product) {
      $scope.actualProduct = product;
      $scope.actualQuantity = 1;
      $uibModal.open({
        animation: 1,
        templateUrl: 'views/itemDetailPopUp.html',
        scope: $scope,
        size: 'lg'
      });
    }

    $scope.countProductsByCategoryId = function(catId) {
      var counter = 0;
      for (var i = 0; i < $scope.products.length; i++) {
        if ($scope.products[i].category_id == catId){
          counter++;
        }
      }
      return counter
    }

    $scope.isActive = function(id) {
      return $scope.filterId == id
    };

    /*
    $scope.filterOLD = function(idCategoria){
      if($scope.filterId == idCategoria) {
        $scope.showAll = true
        $scope.filterId = ""
      } else {
        $scope.showAll = false
        $scope.filterId = idCategoria
      }
    }*/

    $scope.filter = function (idCategoria) {
      $log.info("Filter")
      if ($scope.filterId == idCategoria) {
        $log.info("Caso 1 ")
        $scope.filterId = ""
        $scope.productsToShow = $scope.products
      } else {
        $log.info("Caso 2 ")
        $scope.productsToShow = [];
        $scope.filterId = idCategoria
        for (var i = 0; i < $scope.products.length; i++) {
          $log.info("Reading " +$scope.products[i].category_id +" vs "+idCategoria)
          if ($scope.products[i].category_id == idCategoria) {
            $scope.productsToShow.push($scope.products[i])
          }
        }
      }
    }

    /*
     Funzione per aggiungere un prodotto al carrello.
     Il parametro quantity, se presente, ne determina la quantità.
     Se non presente, viene settato di default a 1.
     */
    $scope.addToCart = function (product, quantity) {
      swal({
        title: "Conferma",
        text: "Vuoi aggiungere questo elemento al carrello?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, continua",
        animation: "slide-from-top",
        cancelButtonText: "No, Ho cambiato idea",
        closeOnConfirm: false,
      }, function (isConfirm) {
        if (isConfirm) {
          var item = new Object();
          item.id = product.id;
          if (!quantity) {
            item.quantity = 1;
          }
          else {
            item.quantity = quantity;
          }

          $log.info("product is " + product);
          $log.info("quantity is = " + item.quantity);

          cartFactory.aggiungiAlCarrello(item);
          $uibModalStack.dismissAll()

          swal("Completato", "Oggetto aggiunto al carrello!", "success");
        } else {
          $log.log("Closing swal - ERROR");
          swal.close();
        }
      });
    }
//--------------------------------- DEBUG --------------------------------------
    /**
     * |DEBUG| Metodo per stampare in console le informazioni di un prodotto
     * @param product
     */
    $scope.toConsole = function (product) {
      $log.log(product);
    };
//fine--------------------------------- DEBUG ----------------------------------

  });


