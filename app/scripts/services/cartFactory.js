'use strict'
/**
 * cartService si occupa di gestire e mantenere lo stato del carrello dell'applicazione.
 * Sono presenti tutti i metodi per comunicare con il server (rimozione prodotti,
 * update e inserimento di prodotti).
 * Sono presenti due array carrello, uno per l'utente loggato e uno per l'utente non ancora loggato.
 * Tutti i metodi decidono autonomamente quale carrello utilizzare (sia per scrittura che per lettura)
 * basandosi sullo stato della variabile $rootScope.loggedIn.
 * Di conseguenza è possibile chiamare questi metodi da altre classi non preoccupandosi di specificare
 * il carrello da utilizzare.
 */
angular.module('provaMrkCldApp')
  .factory('cartFactory', function ($cookies, $rootScope,$window,$location,$log) {

    $log.info("cartFactory inizializzato!");
    var localCartUnloggedUser = [];
    var localCartLoggedUser = [];

    var remoteCartId = null; //viene settato all'apertura dell'applicazione, dopo il login e dopo il logout.

    var exposeCart = {}; //Variabile per esporre le funzioni sugli altri controller (viene ritornata alla fine della factory)

    /*
     Metodo getter per il carrello
     */
    exposeCart.getLocalCart = function () {
      if ($rootScope.loggedIn) {
        return localCartLoggedUser;
      }
      else {
        return localCartUnloggedUser;
      }
    }

    /*
     Metodo setter per l'id del carrello
     */
    exposeCart.setRemoteCartId = function (ID) {
      $log.log("Setting remoteCartId as " + ID);
      remoteCartId = ID;
    };

    /*
     Conta gli elementi nel carrello (o in un carrello diversa, SE inserito come parametro)
     */
    function getCount(customCart) {
      var quantity = 0;

      if (customCart) {
        for (var i = 0; i < customCart.items.length; i++) {
          quantity += customCart.items[i].quantity;
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
         */
        if (localCartUnloggedUser.items == undefined) {
          $window.location.assign('/#');
          return;
        }

        for (var i = 0; i < localCartUnloggedUser.items.length; i++) {
          quantity += localCartUnloggedUser.items[i].quantity;
        }
      }
      return quantity;
    }
    //Per chchiamarlo da altri controller
    //TODO: avrei potuto farlo in un metodo unico tipo getPrice()... ma vabbè
    exposeCart.exposeGetCount = function () {
      return getCount();
    }


    /*
    Funzione per ottenere il prezzo totale degli articoli nel carrello
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
      $log.debug("Prezzo calcolato: " +price);
      return price;
    }

    /**
     * creazione di un carrello con controllo dei cookie
     */
    exposeCart.createCart = function () {
      /*
       Se non c'è nessun cookie con un id carrello, crea un nuovo carrello vuoto e ne associa l'id di un cookie.
       IL CARRELLO è ANONIMO (NON LEGATO A NESSUN USER IN PARTICOLARE)
       Se invece il cookie è presente, viene recuperato il carrello associato all'id di quel cookie.
       */
      if (!$cookies.get('mc-cart-id')) {
        marketcloud.carts.create({}, function (err, cart) {

          //Creazione cookie legato al carrello utente non registrato (scade in 1 giorno)
          var expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 1);
          // Setting a cookie
          $cookies.put('mc-cart-id', cart.id), {'expires': expireDate};
          //setto l'id del carrello attuale in  cartService
          exposeCart.setRemoteCartId(cart.id);
          exposeCart.setLocalCart(cart);
          if (err) {
            alert("Errore critico in creazione carrello")
          }
        });
      }
      else {
        marketcloud.carts.getById($cookies.get('mc-cart-id'), function (err, cart) {
          if (cart == null) {
            $cookies.remove('mc-cart-id');
            exposeCart.createCart();
          }
          exposeCart.setRemoteCartId(cart.id);
          //sincronizzo il carrello locale
          exposeCart.setLocalCart(cart);
          $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());

          if (err) {
            alert("Errore critico in recupero carrello")
          }
        });
      }
    }

    /**
     * Crea/recupera il carrello in base all'utente che si è loggato
     * Non ho capito a cosa serva quell'1 lì come parametro
     */
    exposeCart.creaCarrelloUtente = function () {
      marketcloud.carts.getByUser(function (err, cart) {
        if (err) {
          $log.warn("Errore critico in recupero carrello  da user-token\n verrà creato un nuovo carrello ")
        }
        if (cart == undefined || cart.items == undefined) { //SE L'UTENTE NON AVEVA ANCORA UN CARRELLO
          marketcloud.carts.create({}, function (err, newCart) {

            cart = newCart;
            exposeCart.setRemoteCartId(cart.id);

            if (err) {
              throw new Error("Errore critico in creazione carrello utente loggato")
            }
            exposeCart.setLocalCart(cart);

          });

        } else { //SE INVECE IL CARRELLO è PRESENTE
          exposeCart.setLocalCart(cart);
          exposeCart.setRemoteCartId(cart.id);
        }
        $log.info("Calling  exposeCart.switchToLoggedCart(); ")
        $log.warn("Ci sono degli oggetti da trasferire... ", localCartUnloggedUser.items);
        exposeCart.switchToLoggedCart();
      });
    }


    /**
     * Svuota il carrello (unlogged/logged in base allo stato di $rootScope.loggedIn)
     */
    exposeCart.svuota = function (switchMode) {
      if (($rootScope.loggedIn) && localCartLoggedUser != undefined && localCartLoggedUser.items.length != 0 && !switchMode) {

        var lunghezzaArray = localCartLoggedUser.items.length;
        $log.debug("lunghezza array -> " + lunghezzaArray)

        var oggettiDaRimuovere = [];
        for (var z = 0; z < lunghezzaArray; z++) {
          var lastId = {'product_id': localCartLoggedUser.items[z].id, 'variant_id' : localCartLoggedUser.items[z].variant_id};
          if (lastId.product_id == undefined) { //CHECK PER BUG IN SERVER
            $log.warn("lastId was undefined")
            lastId = {'product_id': localCartLoggedUser.items[z].product_id, 'variant_id' : localCartLoggedUser.items[z].variant_id};
          }
          oggettiDaRimuovere.push(lastId);
        }

        marketcloud.carts.remove(remoteCartId, oggettiDaRimuovere, function (err, data) {
          $log.warn("remoteCartId è " +remoteCartId +", oggetti da rimuovere è ",oggettiDaRimuovere)
          if (data.items.length != 0) {
            alert("Errore critico in svuotaggio carrello (vedi log)")
            $log.error(err)
            return;
          }
          localCartLoggedUser = data;

          $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
        });
      }
      else if ((!$rootScope.loggedIn && localCartUnloggedUser != undefined && localCartUnloggedUser.items.length != 0) || switchMode) {
        localCartUnloggedUser.items = [];
        $cookies.remove('mc-cart-id');
        $log.debug("$cookies is ", $cookies);
        exposeCart.createCart();
        $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
      }
    }


      /**
       * Metodo per effettuare l'update del carrello
       * @param updateList -> array contenente id e quantità dei prodotti da aggiornare
       * es {product_id: 3, quantity: 4}
       */
      exposeCart.updateCart = function (updateList) {
      $log.info("UpdateCart() \n updateList è " ,updateList)
      marketcloud.carts.update(remoteCartId, updateList, function (err, res) {
        if (err) {
          alert("CRITICAL ERROR in updating cart")
          $log.error(err)
        }
        else {
          $log.info("Cart updated. Data is ",res)
        }
      });
    }

    /**
     * Metodo per aggiungere un prodotto al carrello (si regola in base a $rootScope.loggedIn)
     * @param item prodotto da aggiungere al carrello
     */
    exposeCart.aggiungiAlCarrello = function (item) {
      if (!$rootScope.loggedIn) { //utente non loggato

        //invio prodotto al server
        marketcloud.carts.add(remoteCartId, [{product_id: item.id, quantity: item.quantity, variant_id: item.variant}], function (err, cart) {
          if (err) {
            alert("CRITICAL ERROR in Adding item to remote cart\n")
            $log.log(err)
            $log.log(item.id + " - " +item.quantity)
          }
          else {
            localCartUnloggedUser = cart;
          }
          $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
        });
      } else { //utente loggato
        $log.log(item)
        $log.info("utente loggato: adding VEDI SOPRA into cart " + remoteCartId);
        //invio prodotto al server
        marketcloud.carts.add(remoteCartId, [{product_id: item.id, quantity: item.quantity, variant_id: item.variant}], function (err, cart) {
          if (err) {
            alert("CRITICAL ERROR in Adding item to remote cart\n")
            $log.log(err)
            $log.log(item.id + " - quantity : " + item.quantity + " - variant : " + item.variant)
          }
          else {
            localCartLoggedUser = cart;
          }
          $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
        });
      }
    };

    /*
    Metodo per rimuovere un singolo prodotto dal carrello attuale (in base a remoteCartId);
     */
    exposeCart.removeProduct = function (id, variantId) {
      $log.log("sono in exposeCart.removeProduct")
      $log.log("Rimuovo oggetto con id " + id + " e variantId " +variantId);
      marketcloud.carts.remove(remoteCartId, [{'product_id': id, 'variant_id': variantId}], function (err, data) {
        if (err) {
          alert("Errore critico in rimozione prodotto con id " + id);
          return;
        }
        $log.info("oggetto rimosso. cart è ", data)
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
     * setta il carrello locale in base al carrello recuperato dal server
     * @param data carrello utente restituito dal server
     */
    exposeCart.setLocalCart = function (data) {
      if (!$rootScope.loggedIn) { //non loggato
        $log.log("setLocalCart UNLOGGED user")

        localCartUnloggedUser = data;
      }
      else {
        localCartLoggedUser = data;
      }
      $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
    };

    /*
     Metodo per svuotare il carrello Unlogged nel carrello Logged (sia in locale che server)
     Viene chiamato quando un utente precedentemente non loggato e con un carrello pieno si logga.
     A questo punto all'utente viene chiesto se vuole svuotare il vecchio carrello nel carrello
     legato al suo account utente.
     Se l'utente risponde positivamente, il metodo è invocato
     */
    exposeCart.switchToLoggedCart = function () {
      var prodottiText = '<div class="riassuntoCarrello panel-body"' +
        '<h4>Il tuo vecchio carrello</h4> <span class="arrow"></span> <ul>';

      var prodottiDaTrasferire = localCartUnloggedUser.items;

      if (prodottiDaTrasferire.length == undefined || prodottiDaTrasferire.length == 0) { //OK
        $log.info("Nessun prodotto da trasferire")
        return;
      }

      if (!$rootScope.loggedIn) {
        alert("Critical Error - at this point $rootScope.loggedIn should be TRUE")
        return;
      }

      //Preparo i prodotti da trasferire al carrello utente loggato

      var tempArray = []; //conterrà i prodotti da trasferire ma solo con le voci i e quantity in modo da poterlo inviare
      for (var i = 0; i < prodottiDaTrasferire.length; i++) {
        prodottiText += '<li> <span>' + prodottiDaTrasferire[i].quantity + 'x -  ' + prodottiDaTrasferire[i].name + '</span> </li>';
        var obj = {product_id: prodottiDaTrasferire[i].id, quantity: prodottiDaTrasferire[i].quantity, variant_id: prodottiDaTrasferire[i].variant_id }
        tempArray.push(obj);
      }

      prodottiDaTrasferire = tempArray;
      $log.info("I prodotti da trasferire sono ", prodottiDaTrasferire);
      tempArray = null;
      prodottiText += '</ul> <p> </p></div>';


      swal({
        title: "Vuoi unire i carrelli?",
        text: prodottiText,
        type: "info",
        html: true,
        showCancelButton: true,
        closeOnConfirm: false,
      }, function (isConfirm) {
        if (isConfirm) {
          marketcloud.carts.add(remoteCartId, prodottiDaTrasferire, function (err, cart) {
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
            $cookies.remove('mc-cart-id');

            $rootScope.$broadcast('cartUpdated', getCount(), exposeCart.getPrice());
          });
        } else {
          localCartUnloggedUser.items = [];
          prodottiDaTrasferire = [];
          $cookies.remove('mc-cart-id');
          swal.close();
          return;
        }
      });
    }


    //----METODI PER DEBUG-----
    /**
     |DEBUG| Funzione per ricevere il log i carrelli
     */
    exposeCart.getCartLog = function () {
      if ($rootScope.loggedIn) {
        $log.info(localCartLoggedUser)
      } else {
        $log.info(localCartUnloggedUser)
      }
    }
    //FINE----DEBUG-----

    return exposeCart;
  });
