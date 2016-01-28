'use strict'
/**
 * Gestisce l'invio dei campi relativi a shipping address, billing address e carta di credito per
 * pagamento con Stripe.
 * Si occupa anche del recupero degli indirizzi registrati dall'utente e della loro gestione.
 * Questi indirizzi sono memorizzati in una lista locale.
 * Ogni qualvolta che un controller (relativo ad una fase del checkout) effettua variazioni, come ad esempio
 * la rimozione o l'aggiunta sul server di un indirizzo, la modifica viene anche effettuata sulla lista locale, in
 * modo tale da evitare chiamate superflue al server per il rinnovo della lista e di mantenere una lista di indirizzi
 * fedele a quella presente sul server.
 */
angular.module('provaMrkCldApp')
  .factory('paymentFactory', function ($rootScope, $log, $window ) {
    console.log("$rootScope setted\n $rootScope says : " + $rootScope.greet + " paymentFactory!");
    var expose = {};

    var addressesList = []

    var shippingInfos  = {
      'id': '',
      'full_name': '',
      'address1': '',
      'city': '',
      'state': '',
      'postal_code': '',
      'country': ''
    };

    var billingInfos = {
      'id': '',
      'full_name': '',
      'address1': '',
      'city': '',
      'state': '',
      'postal_code': '',
      'country': ''
    };

    var stripeCardInfos = {
      'name': '',
      'card': '',
      'CVC': '',
      'expiration': '',
      'token': ''
    };

    //Recupera gli indirizzi registrati dall'utente
    expose.getAddressesList = function () {
      $log.info("Ritorno la lista di indirizzi locali...")
      return addressesList
    }
    //setta la lista degli indirizzi registrati dall'utente (utile in caso di cambiamenti da altri controller)
    expose.setAddressesList = function (list) {
      addressesList = list
    }
    //Rimuove un indirizzo dalla lista (locale) degli indirizzi
    expose.removeFromAddressesList = function (addressId) {
      var removed = 0;
      for (var i = 0; i < addressesList.length; i++) {
        if (addressesList[i].id == addressId) {
          addressesList.splice(i, 1);
          $log.debug("Indirizzo RIMOSSO dalla lista indirizzi, che è ora ", addressesList)
          return true
        }
      }
      return false
    }
    //Aggiunge un indirizzo alla lista (locale) degli indirizzi
    expose.addToAddressesList = function(address) {
      addressesList.push(address)
      $log.log("Indirizzo aggiunto alla lista indirizzi, che è ora ",addressesList)
    }


    //gestione e recupero dei campi dell'ultimo shipping address inserito
    expose.getLastShippingInfos = function () {
      return shippingInfos
    }
    expose.setShippingInfos = function (infos) {
      shippingInfos = infos
    }
    expose.shippingInfosFilled = function () {
      if (shippingInfos.address1 == '' || shippingInfos.city == '' || shippingInfos.full_name == '' ||
        shippingInfos.state == '' || shippingInfos.postal_code == '' || shippingInfos.country == '') {
        return false
      } else return true
    }

    //gestione e recupero dei campi dell'ultimo billing address inserito
    expose.getLastBillingInfos = function () {
      return billingInfos
    }
    expose.setBillingInfos = function (infos) {
      billingInfos = infos
    }
    expose.billingInfosFilled = function () {
      if (billingInfos.address == "" || billingInfos.city == "" || billingInfos.name == "" ||
        billingInfos.state == "" || billingInfos.postCode == "" || billingInfos.country == "") {
        return false
      } else return true
    }


    //gestione e recupero dei campi dei campi della carta di credito
    expose.getCardInfos = function () {
      return stripeCardInfos
    }
    expose.setCardInfos = function (infos) {
      stripeCardInfos = infos
    }
    expose.stripeCardInfosFilled = function () {
      if (stripeCardInfos.mail == "" || stripeCardInfos.card == "" || stripeCardInfos.CVC == "" ||
        stripeCardInfos.expiration == "") {
        return false
      } else return true
    }


    //gestione del Token di Stripe
    expose.setStripeToken = function(token) {
      stripeCardInfos.token = token
    }
    expose.geStripeToken = function() {
      return stripeCardInfos.token
    }

    //Svuotamento dei campi shipping, billing e credit card
    expose.clearFields = function () {
      shippingInfos = {
        'id': '',
        'full_name': '',
        'address1': '',
        'city': '',
        'state': '',
        'postal_code': '',
        'country': ''
      };
      billingInfos = {
        'id': '',
        'full_name': '',
        'address1': '',
        'city': '',
        'state': '',
        'postal_code': '',
        'country': ''
      };
      stripeCardInfos = {
        'mail': '',
        'card': '',
        'CVC': '',
        'expiration': '',
      };
    }

    //------DEBUG: Stampa in console i dati degli indirizzi e della carta di credito
    expose.printAddresRecap = function (addresses) {
      if (!addresses) {
        $log.log("shippingInfos ", shippingInfos)
        $log.log("billingInfos ", billingInfos)
        $log.log("stripeCardInfos ", stripeCardInfos)
      }
      else {
        $log.log("addresses ", addressesList)
      }
    }

    //Metodo che invia una richiesta a Stripe per verificare la carta di credito
    expose.checkBillingAndProceed = function() {
      var stripe_data = {
        number: stripeCardInfos.card,
        cvc: stripeCardInfos.cvc,
        exp_month: stripeCardInfos.expiration.split('/')[0],
        exp_year: stripeCardInfos.expiration.split('/')[1]
      }

      Stripe.card.createToken(stripe_data, function(status,response){
        console.log("Stripe callback --->",status,response)

        if (status < 400) {
          $log.log("Stripe says -> ",status,response)
          stripeCardInfos.stripe_token = response.id;
          stripeCardInfos.brand = response.card.brand;
          alert("OK status < 400")
          $window.location.assign('/#/recapOrder');
        } else {
          alert("error status >= 400 \n check log")
          $log.warn(status)
        }
      });
    }
    return expose
  });


