'use strict'
/**
 * Cart's controller.
 * Manages the cart's view and calls methods from cartFactory.js
 */

angular.module('provaMrkCldApp')
  .controller('cartCtrl', function ($scope, $cookies, $rootScope, marketcloud, cartFactory, $log, $window, $location) {
    //$log.log("$rootScope: " + $rootScope.greet + " cartCtrl Controller!");

    //if page is refreshed user will return to the main page
    if (!marketcloud.appStarted) {
      $location.url('/#');
      return
    }

    $scope.actualCart = cartFactory.getLocalCart();
    $log.info("$scope.actualCart is ", $scope.actualCart)

    $scope.totalItems = cartFactory.exposeGetCount();
    $scope.totalPrice = cartFactory.getPrice();

    $scope.updateList = [];

    /**
     * counts how many elements are in the cart.
     */
    $scope.getCount = function () {
      return cartFactory.exposeGetCount();
    }

    /*
     returns the total price of the elements in the cart.
     */
    $scope.getPrice = function () {
      return cartFactory.getPrice();
    }

    /*
     * calls the method in order to clean the cart.
     */
    $scope.emptyCart = function () {
      return cartFactory.cleanCart();
    }

    /**
     * opens a modal and calls the method to delete an item from the cart
     * @param id  product's id
     * @variantId variant's id ( 0 if there are no variantS )
     */
    $scope.removeProduct = function (id, variantId) {
      swal({
        title: "Confirm",
        text: "Do you want to delete this product?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, continue",
        cancelButtonText: "No, I changed my mind",
        closeOnConfirm: false,
        closeOnCancel: false
      }, function (isConfirm) {
        if (isConfirm) {
          $log.log("product with id "+id+ " and variantId " +variantId)
          cartFactory.removeProduct(id, variantId);

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

    //Updates some datas after the cart has been updated (items count, items price)
    $scope.$on('cartUpdated', function (event, count, price) {
      $scope.getCart();

      $scope.totalItems = count;

      $scope.totalPrice = price;

      $scope.$applyAsync();
    });

    /**
     * Retrieves the cart
     */
    $scope.getCart = function () {
      $log.log("$scope.getCart()");
      $scope.actualCart = cartFactory.getLocalCart();
    }

    /*
     Saves the cart's status
     */
    $scope.saveCart = function () {
      $log.log("Setting cartFactory cart to ", $scope.actualCart);
      cartFactory.setLocalCart($scope.actualCart);
    }

     /**
       * Updates the quantity of one or multiple items.
       * @param id product's id
       * @param quantity product's new quantity
       * @param variantId variant's id (0 if there are no variants)
       */
    $scope.updater = function (id, quantity, variantId) {

      $log.log("Actual cart is ",cartFactory.getLocalCart())
      $log.log("updater received " +id+ ", quantity: " +quantity+" and variantId " +variantId)

      $log.log("Creating object")
      var obj = new Object();
      obj.product_id = id;
      obj.quantity = quantity;
      obj.variant_id = variantId
      $log.info("Object created : "+angular.toJson(obj, true))

      $log.log("Retrieving Cart")
      var cart = cartFactory.getLocalCart

      $log.info("Printing cart")
      for (var i = 0; i < cart.length; i++) {
        $log.log(cart[i])
      }

      //Checks if the new quantity is different from the previous one
      for (var i = 0; i < $scope.updateList.length; i++) {
        if ($scope.updateList[i].product_id == id) {
          $scope.updateList[i].quantity = quantity;
          $scope.updateList[i].variant_id = variantId
          $log.log("Object quantity was the same \n  > [i].quantity = " + quantity);
          $scope.saveCart();
          return;
        }
      }
      $log.log("The quantity has been changed. The updatelist will be updated.");
      $scope.updateList.push(obj);
      $scope.saveCart();
    }

    /**
     * Checks if user changes the view after a product quantity has been changed.
     */
    $scope.$on('$locationChangeStart', function (event) {
      if ($scope.updateList.length != 0) {
        $log.warn("$scope.$on('$locationChangeStart' \n itemsService.updateCart($scope.updateList);");
        console.log($scope.updateList)
        cartFactory.updateCart($scope.updateList);
        $scope.updateList = [];
        $rootScope.fromUpdatedCart = true;
      }
    });

    // moves to the checkOut view
    $scope.checkOutClick = function() {
      if(!$rootScope.loggedIn) {
        alert("You have to be logged In in order to check out!")
        $window.location.assign('/#/login');
        return
      }
      if($rootScope.loggedIn != undefined || $rootScope.loggedIn ) {
        $window.location.assign('/#/checkOutAddress');
      }
    }

    //-----------------------------DEBUG---------------------------
    /**
     * |DEBUG| prints the cart and the updateList
     */
    $scope.secretDebug = function () {
      $log.log("Actual cart is ", $scope.actualCart);
      $log.log("$scope.updateList is ", $scope.updateList);
    }
    //--------------------------------------------------------------



  });
