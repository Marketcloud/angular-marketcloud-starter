'use strict'

/**
 * this services manages and mantains the cart status.
 * There are several methods to interact with the API (ex. removing products, update the cart, add a product etc.)
 * There are two different local carts : one for the unlogged user and one for the logged user.
 * Every methods can select the right one checking the $rootScope.loggedIn status (boolean).
 */
angular.module('provaMrkCldApp')
  .factory('cartFactory', function ($rootScope,$window,$location,$log) {

    var localCartUnloggedUser = [];
    var localCartLoggedUser = [];

    //setted when the user logs in or logs out.
    var remoteCartId = null;

    //Exposes the functions for the external classes
    var exposeCart = {};

    /*
     * retrieves the cart
     */
    exposeCart.getLocalCart = function () {
      if ($rootScope.loggedIn) {
        genProductVariantsName(localCartLoggedUser)
        return localCartLoggedUser;
      }
      else {
        genProductVariantsName(localCartUnloggedUser)
        return localCartUnloggedUser;
      }
    }

    /*
     Sets the cart id
     */
    exposeCart.setRemoteCartId = function (ID) {
      $log.log("Setting remoteCartId as " + ID);
      remoteCartId = ID;
    };

      /**
       * counts how many elements a cart contains
       * @param cart you can also insert a custom cart (for debug purposes)
       * @returns {number}
       * THIS METHOD IS NOT EXPOSED. IF YOU WANT TO CALL IT FROM A
       * DIFFERENT CLASS CHECK exposeCart.exposeGetCount()
       */
    function getCount(cart) {
      var quantity = 0;

      if (cart) {
        for (var i = 0; i < cart.items.length; i++) {
          quantity += cart.items[i].quantity;
        }
        return quantity;
      }

      if ($rootScope.loggedIn) {

        for (var i = 0; i < localCartLoggedUser.items.length; i++) {
          quantity += localCartLoggedUser.items[i].quantity;
        }
      } else {

        /*
        prevents unwanted behaviour if updating page when cart view is on

        if (localCartUnloggedUser.items == undefined) {
          $window.location.assign('/#');
          return;
        }*/

        for (var i = 0; i < localCartUnloggedUser.items.length; i++) {
          quantity += localCartUnloggedUser.items[i].quantity;
        }
      }
      return quantity;
    }


    //Exposes the getCount() method
    exposeCart.exposeGetCount = function () {
      return getCount();
    }


    /*
     * Obtains the total price from the products in the cart.
     */
    exposeCart.getPrice = function() {
      var price = 0;
      if($rootScope.loggedIn) {
        if(localCartLoggedUser.items.length == 0) return 0;

        var tempItems = localCartLoggedUser.items;

        for(var i = 0; i < tempItems.length; i++ ) {
          price += (tempItems[i].quantity * tempItems[i].price );
        }
      } else {

        if(localCartUnloggedUser.items == undefined){
          return; //prevent exception
        }

        if(localCartUnloggedUser.items.length == 0) return 0;
        tempItems = localCartUnloggedUser.items;

        for(var i = 0; i < tempItems.length; i++ ) {
          price += (tempItems[i].quantity * tempItems[i].price );
        }

      }
      $log.debug("Price is: " +price);
      return price;
    }

    /**
     * Creates a new cart
     */
    exposeCart.createCart = function () {
      /*
        If the storage value with the cart id is not available, a new empty cart will be created and its id will be saved
        in a new storage value.
        This cart is not user-related. It means that the user is currently not logged in.
        The id will be stored in a storage value.
       */
      $log.info("exposeCart.createCart()")
      $log.info("marketcloud.storage.get('mc-cart-id')    -> "+marketcloud.storage.get('mc-cart-id'))

      if(marketcloud.storage.get('mc-cart-id') == null) {
        marketcloud.carts.create({}, function (err, cart) {
          $log.info("chiama carts.create")

          marketcloud.storage.set("mc-cart-id",cart.id)
          $log.log("storage.set setted @ 'mc-cart-id' -> "+marketcloud.storage.get("mc-cart-id"));

          //sets the remote cart id with the new cart id
          exposeCart.setRemoteCartId(cart.id);
          //sets the local cart with the new cart
          exposeCart.setLocalCart(cart);
          if (err) {
            alert("Critical error in creating a new cart: see log")
            $log.error(err)
          }
        });
      }
      else {
        /* If there was a storage value with a cart id, the cart will be retrieved from the API.
         */
        marketcloud.carts.getById(marketcloud.storage.get('mc-cart-id'), function (err, cart) {
          $log.info("chiama carts.getById")

          if (cart == null) {
            //if for some reason the cart has not been retrieved, a new one will be created
            marketcloud.storage.del('mc-cart-id')
            exposeCart.createCart();
            return
          }
          //Cart has been retrieved. The id and the new cart will be setted.
          exposeCart.setRemoteCartId(cart.id);
          exposeCart.setLocalCart(cart);
          $log.info(cart)
          $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());

          if (err) {
            alert("Critical error in creating a new cart: see log")
            $log.error(err)
          }
        });
      }
    }

    /**
     * If an user has just logged in, the app will try to retrieve  the user cart from the API.
     */
    exposeCart.createUserCart = function () {
      $log.info("exposeCart.createUserCart")
      marketcloud.carts.getByUser(function (err, cart) {
        if (err) {
          $log.warn("Critical error in retrieving the user cart. A new one will be created ")
        }
        if (cart == undefined || cart.items == undefined) {
          //There were no user-related cart. A new user cart will be created.
          marketcloud.carts.create({}, function (err, newCart) {
            $log.warn("//There were no user-related cart. A new user cart will be created.")
            cart = newCart;
            exposeCart.setRemoteCartId(cart.id);

            if (err) {
              alert("Critical error in creating a new user cart: see log")
              $log.error(err)
            }
            exposeCart.setLocalCart(cart);
          });
        } else {
          //if everything went ok, the user-cart has been retrieved from the API
          $log.info("//if everything went ok, the user-cart has been retrieved from the API")
          exposeCart.setLocalCart(cart);
          exposeCart.setRemoteCartId(cart.id);
        }
        $log.info("Calling  exposeCart.switchToLoggedCart(); ")
        /**
         * IF THE UNLOGGED CART HAD SOME PRODUCTS INSIDE, THE USER CAN CHOOSE TO TRANSFER THESE PRODUCTS
         * IN HIS CART (THE USER-RELATED ONE).
         */
        if (localCartUnloggedUser.items != undefined) {
          $log.warn("There are some products to transfer? -> ", localCartUnloggedUser.items);
          exposeCart.switchToLoggedCart();
        }
      });
    }


    /**
     * empties the cart
     */
    exposeCart.cleanCart = function () {
      if (($rootScope.loggedIn) && localCartLoggedUser != undefined && localCartLoggedUser.items.length != 0) {

        var arrayLength = localCartLoggedUser.items.length;
        $log.debug("lunghezza array -> " + arrayLength)

        var productsToRemove = [];
        for (var z = 0; z < arrayLength; z++) {
          var lastId = {'product_id': localCartLoggedUser.items[z].id, 'variant_id' : localCartLoggedUser.items[z].variant_id};
          if (lastId.product_id == undefined) { //fixes an old bug in the API.
            $log.warn("lastId was undefined")
            lastId = {'product_id': localCartLoggedUser.items[z].product_id, 'variant_id' : localCartLoggedUser.items[z].variant_id};
          }
          productsToRemove.push(lastId);
        }

        marketcloud.carts.remove(remoteCartId, productsToRemove, function (err, data) {
          $log.warn("remoteCartId è " +remoteCartId +", oggetti da rimuovere è ",productsToRemove)
          if (data.items.length != 0) {
            alert("Critical error in carts.remove (see log)")
            $log.error(err)
            return;
          }
          localCartLoggedUser = data;

          $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
        });
      }
      else if ((!$rootScope.loggedIn && localCartUnloggedUser != undefined && localCartUnloggedUser.items.length != 0)) {
        localCartUnloggedUser.items = [];
        marketcloud.storage.del('mc-cart-id');
        $log.debug("marketcloud.storage.get(mc-cart-id') is "+ marketcloud.storage.get(mc-cart-id));
        exposeCart.createCart();
        $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
      }
    }

      /**
       * Updates the cart
       * @param updateList -> Contains id, quantity and variant Id of the products to update.
       * es {product_id: 3, quantity: 4}
       */
      exposeCart.updateCart = function (updateList) {
      $log.info("UpdateCart() \n updateList is " ,updateList)
      marketcloud.carts.update(remoteCartId, updateList, function (err, res) {
        if (err) {
          alert("Critical error in updating cart: see log")
          $log.error(err)
        }
        else {
          $log.info("Cart updated. Data is ",res)
        }
      });
    }

    /**
     * Adds a product to the cart.
     * @param product
     */
    exposeCart.addToCart = function (product) {
      if (!$rootScope.loggedIn) { //unlogged user

        //send the request to the server
        marketcloud.carts.add(remoteCartId, [{product_id: product.id, quantity: product.quantity, variant_id: product.variant}], function (err, cart) {
          if (err) {
            alert("Critical error in Adding item to remote cart: see log\n")
            $log.log(err)
            $log.log(product.id + " - " +product.quantity)
          }
          else {
            localCartUnloggedUser = cart;
          }
          $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
        });
      } else { //logged user
        $log.log(product)
        $log.info("logged user: adding product to the cart with id " + remoteCartId);

        //send the request to the server
        marketcloud.carts.add(remoteCartId, [{product_id: product.id, quantity: product.quantity, variant_id: product.variant}], function (err, cart) {
          if (err) {
            alert("critical error in Adding item to remote cart\n")
            $log.log(err)
            $log.log(product.id + " - quantity : " + product.quantity + " - variant : " + product.variant)
          }
          else {
            localCartLoggedUser = cart;
          }
          $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
        });
      }
    };

    /*
     * Removes a single product from the actual cart
     */
    exposeCart.removeProduct = function (id, variantId) {

      $log.log("Removing object with  id " + id + " and variantId " +variantId);
      marketcloud.carts.remove(remoteCartId, [{'product_id': id, 'variant_id': variantId}], function (err, data) {
        if (err) {
          alert("Critical error in removing product with id " + id + ": see log");
          $log.error(err)
          return;
        }
        $log.info("product removed. cart is now ", data)
        if ($rootScope.loggedIn) {
          localCartLoggedUser = data;
        } else {
          localCartUnloggedUser = data;
        }
        $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
        return;
      });
    }

    /**
     * sets the local cart regarding the cart retrieved from the server
     * @param data cart retireved from the server
     */
    exposeCart.setLocalCart = function (data) {
      if (!$rootScope.loggedIn) {
        $log.log("setting  for unlogged user")

        localCartUnloggedUser = data;
      }
      else {
        $log.log("setting for logged user")

        localCartLoggedUser = data;
      }
      $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
    };

    /*
     This method is called when a user logs in and there were some products in his (unlogged) cart.
     The user can ask for moving the products from the old cart to his own (the cart retireved from the API)
     */
    exposeCart.switchToLoggedCart = function () {
      var productsText = '<div class="Cart recap panel-body"' +
        '<h4>your old cart:</h4> <span class="arrow"></span> <ul>';

      var productToTransfer = localCartUnloggedUser.items;

      if (productToTransfer == undefined || (productToTransfer.length == undefined || productToTransfer.length == 0)) {
        $log.info("no products need to be transfered!")
        return;
      }

      if (!$rootScope.loggedIn) {
        alert("Critical Error - at this point $rootScope.loggedIn should be TRUE")
        return;
      }

      //temporary array with products ids and quantities
      var tempArray = [];

      //Displays a text with all the products that need to be transfered
      for (var i = 0; i < productToTransfer.length; i++) {
        productsText += '<li> <span>' + productToTransfer[i].quantity + 'x -  ' + productToTransfer[i].name + '</span> </li>';
        var obj = {product_id: productToTransfer[i].id, quantity: productToTransfer[i].quantity, variant_id: productToTransfer[i].variant_id }
        tempArray.push(obj);
      }

      productToTransfer = tempArray;
      $log.info("Some products need to be transfered: ", productToTransfer);

      tempArray = null;
      productsText += '</ul> <p> </p></div>';


      swal({
        title: "Do you want to merge the carts?",
        text: productsText,
        type: "info",
        html: true,
        showCancelButton: true,
        closeOnConfirm: false,
      }, function (isConfirm) {
        if (isConfirm) {
          marketcloud.carts.add(remoteCartId, productToTransfer, function (err, cart) {
            if (err) {
              alert("Critical Error - at this point $rootScope.loggedIn should be TRUE")
              $log.error(err);
              swal.close();
              return;
            } else {
              $log.info("returned cart -> ", cart);
              localCartLoggedUser = cart;
              swal.close();
            }

            localCartUnloggedUser.items = [];
            marketcloud.storage.del('mc-cart-id')

            $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
          });
        } else {
          localCartUnloggedUser.items = [];
          productToTransfer = [];
          marketcloud.storage.del('mc-cart-id')
          swal.close();
          return;
        }
      });
    }


    //----debug methods-----
    /**
     |DEBUG| carts logs
     */
    exposeCart.getCartLog = function () {
      if ($rootScope.loggedIn) {
        $log.info(localCartLoggedUser)
      } else {
        $log.info(localCartUnloggedUser)
      }
    }
    //End----DEBUG-----


    //TODO In future, the Javascript SDK could contain a similar utility.
    //Utility function to rename the products with variants.
    var genProductVariantsName = function(cart) {
      $log.info("Called genProductVariantsName")
      $log.log("cart is " ,cart)

      if (cart.length == 0) {
        return
      }

      var tempString = ""
      for (var i = 0; i < cart.items.length; i++) {

         if (cart.items[i].has_variants && !cart.items[i]["nameChanged"]) {
           var keysArray = [];
           for (var key in cart.items[i].variantsDefinition) {
             if (cart.items[i].variantsDefinition.hasOwnProperty(key)) {
               keysArray.push(key);
             }
           }
           for (var key in keysArray) {
             $log.info("Looking for key -> " +keysArray[key])
             var thisKey = keysArray[key]
             $log.info("Checking ... ",cart.items[i].variant)

             if(cart.items[i].variant == undefined) {
               var tempVarId = cart.items[i].variant_id
               tempString += cart.items[i].variants[tempVarId][thisKey] + " "
             } else {

               tempString += cart.items[i].variant[thisKey] + " "
               $log.info("Tempstring is " + tempString)
             }
           }
             cart.items[i]["name"] = cart.items[i]["name"] + " | " + tempString
             cart.items[i]["nameChanged"] = true
         }
      }
    }

    return exposeCart;
  });
