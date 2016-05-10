'use strict'
/**
 * Manages the shop's main view
 */
angular.module('provaMrkCldApp')
  .controller('mainCtrl', function (cartFactory, $scope, $rootScope, marketcloud, $uibModal, $log, Notification, $uibModalStack,$window) {

    marketcloud.appStarted = true

    //Checks if an user session exists in marketcloud's SDK
    if(marketcloud.users.isLoggedIn() && $rootScope.email == undefined) {
      marketcloud.users.getCurrent(function (err, data) {
        if (err) {
          $log.error("error in marketcloud.users.getCurrent" + err)
        } else {
          $log.log("User did not log out! : retrieving user session")
          $log.info("marketcloud.users.getCurrent")
          $log.info(data)
          $scope.error = false;
          $rootScope.loggedIn = true;
          $rootScope.email = data.email
          $log.log("Logged in with "+$rootScope.email);
          cartFactory.createUserCart();
          $log.log("Switching to logged cart....")
          $window.location.assign('/#');
        }
      });
    } else {
      //if there was no active user session in marketcloud's SDK and user did not just logged in
      if(!$rootScope.loggedIn) {
        $log.info("No user session founded. User was and is not logged in. Creating cart")
        $log.info("mainCtrl calls cartFactory.createCart()")
        cartFactory.createCart();
      } else {
        //debug
        $log.log("User just logged in manually")
      }
    }

    $scope.products = [];

    $scope.productsToShow = [];
    $scope.categories = []

    $scope.filterId = ""

    //keeps track of the selected variant's options
    $scope.selectedOptions = {}

    //keeps track of the last variant's selected id
    $scope.variantId = 0

    $scope.shopName = marketcloud.name
    if($scope.shopName == undefined) {
      $scope.shopName = "Undefined Shop"
    }

    if(!/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent) && $rootScope.fromUpdatedCart){
      Notification.success({message: 'The cart has been updated ', delay: 2500});
      $rootScope.fromUpdatedCart = false;
    }

    //Retrieves the product list
    marketcloud.products.list({}, function (err, products) {
      if (err) {
        alert("Critical error in retrieving products: see log ");
        $log.error(err)
      } else {
        $scope.productsToShow = products
        $scope.products = products;
        $scope.$applyAsync()
      }
    });

    //Retrieves the category list
    marketcloud.categories.list({}, function(err,categories){
      if (err)
      {
        alert("Critical error in retrieving categories: see log ");
        $log.error(err)
      }
      else {
        for (var i = 0; i < categories.length; i++) {
          var obj = {};
          $scope.categories.push({
            id:   categories[i].id,
            name: categories[i].name
          });
        }
        $log.info("Category list is ",$scope.categories)
        $scope.$applyAsync()
      }
    });

    //opens a modal with the product's details.
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

      return false
    }

    /*
     * Allows the user to add a product to the cart.
     * Eventually calls the addToCart method from cartFactory.js
     * @param product   the actual product
     * @param quantity  the quantity of the product
     */
    $scope.addToCart = function (product, quantity) {
      swal({
        title: "Confirm",
        text: "Do you really want to add this product to the cart?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, continue",
        animation: "slide-from-top",
        cancelButtonText: "No, I changed my mind",
        closeOnConfirm: false,
      }, function (isConfirm) {
        if (isConfirm) {

          //If the product has some variants and no variant's options has been selected a modal with the item's details will be openened
          if (product.has_variants && (Object.keys($scope.selectedOptions).length == 0 && $scope.variantId == 0 )) {
            $log.info("productHasVariant() will be called")
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
          cartFactory.addToCart(item);
          $uibModalStack.dismissAll()
          swal("Ok", "The product has been added to cart!", "success");

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

    //Checks IF a (whole) variants has been selected
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

//--------------------------------- NOT $SCOPE-RELATED --------------------------------------

    //Checks if product has some variants and opens the modal
    function productHasVariant(product) {
      swal({
          title: "Info!",
          text: "This product has some variants! You will now be redirect to the variant's list.",
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

    /**
     * retrieves the correct variant id
     * @param selected array with the variant's selected options.
     * returns the variant id or 0 if errors occurred.
     */
    function findVariantId(selected) {
      var finalArray = $scope.actualProduct.variants

      for (var key in selected) {
        var theKey  = key
        var theValue = selected[theKey]

        var goodIndexs = []

        for (var i = 0; i < finalArray.length; i++) {
          if (finalArray[i][theKey] == theValue ) {
            goodIndexs.push(i)
          }
        }
        var tempArray = []
        for (var i = 0; i < goodIndexs.length; i++) {
          tempArray.push(finalArray[goodIndexs[i]])
        }
        finalArray = tempArray
      }

      if (finalArray.length != 1 ) {
        alert("Critical error: no variant or multiple variants have been found!!")
        return 0
      } else {
        $log.log("Returning "+ finalArray[0]["id"])
        return finalArray[0]["id"]
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

    //Checks if a filter is active
    $scope.isActive = function(id) {
      return $scope.filterId == id
    };

    //Category filter
    $scope.filter = function (categoryId) {
      $log.info("Filter")
      if ($scope.filterId == categoryId) {
        $scope.filterId = ""
        $scope.productsToShow = $scope.products
      } else {
        $scope.productsToShow = [];
        $scope.filterId = categoryId
        for (var i = 0; i < $scope.products.length; i++) {
          $log.info("Reading " +$scope.products[i].category_id +" vs "+categoryId)
          if ($scope.products[i].category_id == categoryId) {
            $scope.productsToShow.push($scope.products[i])
          }
        }
      }
    }
//-----------------------------------------------------------------------------

//---------------------------------DEBUG--------------------------------------
    /**
     * |DEBUG| prints to console the product's info
     * @param product the actual product
     */
    $scope.toConsole = function (product) {
      $log.log(product);
    };

    //prints infos about the variant selection.
    $scope.printSelectedOptions = function() {
      $log.log($scope.selectedOptions)
      $log.log(Object.keys($scope.selectedOptions).length)
    }
    //-----------------------------------------------------------------------------
  });
