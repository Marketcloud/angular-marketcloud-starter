'use strict'

angular.module('provaMrkCldApp')
  .controller('mainCtrl', function (cartFactory, $scope, $rootScope, marketcloud, $uibModal, $log, Notification, $uibModalStack) {
    //$log.log("$rootScope: "+ $rootScope.greet + " mainCtrl Controller!");

    //init variabili $scope
    $scope.products = [];

    $scope.productsToShow = [];
    $scope.categories = []

    $scope.filterId = ""

    //per la scelta delle variants
    $scope.selectedOptions = {}
    //last variant's selected id
    $scope.variantId = 0

    $scope.shopName = marketcloud.name
    if($scope.shopName == undefined) {
      $scope.shopName = "Undefined Shop"
    }

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
      $log.info(product)
      $scope.actualQuantity = 1;

      $uibModal.open({
        animation: 1,
        backdrop  : 'static',
        keyboard  : false,
        templateUrl: 'views/itemDetailPopUp.html',
        scope: $scope,
        size: 'lg'
      });
    }



    //Checks a product's availability (checks stock type, stock level, stock status and eventually the quantity)
    $rootScope.isAvailable = function(stock_type, stock_level, stock_status, quantity) {

      if(stock_type == "infinite") {

        return true
      }

      if (stock_type == "track") {
        if(stock_level == 0) {
          return false
        } else {
          if (quantity >= stock_level) {
            return false
          }
          return true;
        }
      }

      if (stock_type == "status") {
        if(stock_status == "in_stock") {
          return true
        } else {
          return false
        }
      }

      if(stock_type == undefined)
      { return true }

      $log.error("---------------------------------------------.")

      return false
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

          //Se l'oggetto ha varianti e nessuna variante è stata ancora selezionata sarà aperto il modal per l'oggetto in dettaglio
          if (product.has_variants && (Object.keys($scope.selectedOptions).length == 0 && $scope.variantId == 0 )) {
            $log.info("productHasVariant will be called")
            productHasVariant(product)
            return
          }

           var item = new Object();
           item.id = product.id;
           item.variant = $scope.variantId

          $scope.variantId = 0
          $scope.selectedOptions = {}


          $log.log("item.variant is " +item.variant)
           $log.log("$scope.variantId is " +$scope.variantId)

            if (!quantity) {
              item.quantity = 1;
            }
            else {
              item.quantity = quantity;
            }

            $log.info("this item will be added to cart is = ", item);
            cartFactory.aggiungiAlCarrello(item);
            $uibModalStack.dismissAll()
            swal("Completato", "Oggetto aggiunto al carrello!", "success");

        } else {
          $log.log("Closing swal");
          swal.close();
        }
      });
    }


    //Closes the detail modal and resets all variant ids
    $scope.modalDismiss = function(id) {
      $scope.variantId = 0
      $scope.selectedOptions = {}
      $uibModalStack.dismissAll()
    };


//--------------------------------- NOT $SCOPE-RELATED --------------------------------------

    //Checks a (whole) variants has been selected
    $scope.checkVariantsSelected = function() {
      if (!$scope.actualProduct.has_variants) {
        $log.log("actualProduct has no variants")
        return true
      }

      if (Object.keys($scope.selectedOptions).length != Object.keys($scope.actualProduct.variantsDefinition).length) {
        $log.warn("No variants have been selected")
        return false
      } else {
        $log.warn("A variant has been selected")

        $log.log("variantId will be retrieved")
        $scope.variantId = findVariantId($scope.selectedOptions)
        $log.log("variantId is "+$scope.variantId)

        return true
      }
    }



    //Checks if product has some variants and opens the modal
    function productHasVariant(product)
    {
      swal({
          title: "Informazione!",
          text: "Questo prodotto ha delle varianti! Verrai ora reindirizzato alla pagina del dettaglio.",
          showCancelButton: true,
          cancelButtonText: "Annulla!",
        },
        function (isConfirm) {
          if (isConfirm) {
            $log.log("Click to open will be called")
            $scope.clickToOpen(product)
          } else {
            swal.close()
            return
          }
        }
      );
      return
    }


    //FUNZIONE PER RISALIRE AL GIUSTO VARIANT ID
    function findVariantId(selected) {
      var arrayFinale = $scope.actualProduct.variants

      for (var key in selected) {
        var chiave  = key
        var valore = selected[chiave]

        var goodIndexs = []

        for (var i = 0; i < arrayFinale.length; i++) {
          if (arrayFinale[i][chiave] == valore ) {
            goodIndexs.push(i)
          }
        }
        var tempArray = []
        for (var i = 0; i < goodIndexs.length; i++) {
          tempArray.push(arrayFinale[goodIndexs[i]])
        }
        arrayFinale = tempArray
      }

      if (arrayFinale.length != 1 ) {
        alert("CRITICAL ERROR: NO VARIANTS FOUND OR FOUND MULTIPLE VARIANTS!")
        return
      } else {
        $log.log("Returning "+ arrayFinale[0]["id"])
        return arrayFinale[0]["id"]
      }
    }
    //-----------------------------------------------------------------------------

    //----------------------------Categories----------------------------


    //Counts how many products per category are in the $scope.products array
    $scope.countProductsByCategoryId = function(catId) {
      var counter = 0;
      for (var i = 0; i < $scope.products.length; i++) {
        if ($scope.products[i].category_id == catId){
          counter++;
        }
      }
      return counter
    }

    //Checks if filter is active
    $scope.isActive = function(id) {
      return $scope.filterId == id
    };

    //Category filter
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
//-----------------------------------------------------------------------------

//---------------------------------DEBUG--------------------------------------
    /**
     * |DEBUG| Metodo per stampare in console le informazioni di un prodotto
     * @param product
     */
    $scope.toConsole = function (product) {
      $log.log(product);
    };

    //Stampa informazioni riguardo l'utente che seleziona le varianti
    $scope.printSelectedOptions = function() {
      $log.log($scope.selectedOptions)
      $log.log(Object.keys($scope.selectedOptions).length)
    }

    //-----------------------------------------------------------------------------
  });
