'use strict'
/**
 * Manages the communication with the API for the checkout section (shipping address,
 * credit card and billing address.
 * Also retrieves the addresses from the backend and saves them into a local list.
 */
angular.module('provaMrkCldApp')
  .factory('paymentFactory', function ($rootScope, $log, $window ) {
    //console.log("$rootScope setted\n $rootScope says : " + $rootScope.greet + " paymentFactory!");
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

    //Retrieves the local user's addresses
    expose.getAddressesList = function () {
      return addressesList
    }

    //updates the local addresses list (useful when sending or removing an address from the API)
    expose.setAddressesList = function (list) {
      addressesList = list
    }

      /**
       * Removes an address from the local list
       * @param addressId id of the address
       */
    expose.removeFromAddressesList = function (addressId) {
      var removed = 0;
      for (var i = 0; i < addressesList.length; i++) {
        if (addressesList[i].id == addressId) {
          addressesList.splice(i, 1);
          $log.debug("The address has been removed. addressesList is now ", addressesList)
          return true
        }
      }
      return false
    }

    //Adds an address to the local list
    expose.addToAddressesList = function(address) {
      addressesList.push(address)
    }


    //retrieves the last inserted shipping address
    expose.getLastShippingInfos = function () {
      return shippingInfos
    }

    //sets the  last inserted shipping address
    expose.setShippingInfos = function (infos) {
      shippingInfos = infos
    }

    //Checks if all shipping address fields are filled
    expose.shippingInfosFilled = function () {
      if (shippingInfos.address1 == '' || shippingInfos.city == '' || shippingInfos.full_name == '' ||
        shippingInfos.state == '' || shippingInfos.postal_code == '' || shippingInfos.country == '') {
        return false
      } else return true
    }

    //retrieves the last inserted billing  address
    expose.getLastBillingInfos = function () {
      return billingInfos
    }

    //sets the  last inserted billing address
    expose.setBillingInfos = function (infos) {
      billingInfos = infos
    }

    //Checks if all billing address fields are filled
    expose.billingInfosFilled = function () {
      if (billingInfos.address == "" || billingInfos.city == "" || billingInfos.name == "" ||
        billingInfos.state == "" || billingInfos.postCode == "" || billingInfos.country == "") {
        return false
      } else return true
    }

    //retrieves the last inserted credit card infos
    expose.getCardInfos = function () {
      return stripeCardInfos
    }

    //sets the  last inserted credit card infos
    expose.setCardInfos = function (infos) {
      stripeCardInfos = infos
    }

    //Checks if all credit card fields are filled
    expose.stripeCardInfosFilled = function () {
      if (stripeCardInfos.mail == "" || stripeCardInfos.card == "" || stripeCardInfos.CVC == "" ||
        stripeCardInfos.expiration == "") {
        return false
      } else return true
    }

    //sets the  last Stripe token
    expose.setStripeToken = function(token) {
      stripeCardInfos.token = token
    }

    //gets the last Stripe token
    expose.getStripeToken = function() {
      return stripeCardInfos.token
    }

    //clean the shipping address, billing address and credit card fields
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


    //Ask Stripe for the credit card validation
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
          alert("Stripe status < 400 : OK")
          $window.location.assign('/#/recapOrder');
        } else {
          alert("Stripe status >= 400 \n ERROR! check log")
          $log.error(status)
        }
      });
    }

    //------DEBUG: prints all of the addresses and credit card datas
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



    return expose
  });


