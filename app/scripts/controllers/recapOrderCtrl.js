'use strict'
/**
 * Gestisce la view per ricapitolare l'ordine
 */
angular.module('provaMrkCldApp')
  .controller('recapOrderCtrl', function ($scope, marketcloud, cartFactory, $log, $window, paymentFactory, $http ) {

    $scope.shippingInfos = {}
    $scope.cardInfos = {}
    $scope.billingInfos = {}
    $scope.theCart = {}
    $scope.shipping = 0
    $scope.total = 0


    $scope.shippingInfos = paymentFactory.getLastShippingInfos();
    $log.log($scope.shippingInfos)

    $scope.cardInfos = paymentFactory.getCardInfos();
    $log.log($scope.cardInfos)

    $scope.billingInfos = paymentFactory.getLastBillingInfos();
    $log.log($scope.billingInfos)

    $scope.theCart = cartFactory.getLocalCart().items;
    $log.log("THE CART \n",$scope.theCart)

    $scope.total = cartFactory.getPrice();

    //conferma dell'ordine (v.doCheckout())
    $scope.confirmOrder = function() {
      $scope.doCheckout(cartFactory.getLocalCart());
    }

    //Metodo per confermare l'ordine
    $scope.doCheckout = function() {

      console.warn("Entering doCheckout \n cart is ", angular.copy(cartFactory.getLocalCart().items),
        "shipping id is "+paymentFactory.getLastShippingInfos().id
        +"and billing id is " +paymentFactory.getLastBillingInfos().id)

      var the_order = {
        items : angular.copy(cartFactory.getLocalCart().items),
        shipping_address_id : paymentFactory.getLastShippingInfos().id,
        billing_address_id : paymentFactory.getLastBillingInfos().id
      }
      swal({
        title: "Conferma",
        text: "Continuando, verrà simulato l'invio dell'ordine. \n Il carrello sarà svuotato, l'ordine" +
        "  sarà inviato al server e si ritornerà alla pagina principale dello shop. \n" +
        "Sei sicuro di voler continuare?",
        imageUrl: "images/end.gif",
        imageSize: "150x150",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, continua",
        animation: "slide-from-top",
        cancelButtonText: "No, Ho cambiato idea",
        closeOnConfirm: false,
      }, function (isConfirm) {
        if (isConfirm) {
          marketcloud.orders.create(the_order,function(err,created_order){
            if (err) {
              alert("Critical error during order creation (see log)")
              $log.error("an error has occurred while creating the order", err)
            }
            else{
              swal("Completato", "Ordine completato! \n verrai reindirizzato alla pagina principale", "success");
              $log.info("OK Callback di marketcloud.orders.create")
              var payload = {
                amount : Math.round(created_order.total*100),
                stripe_token : paymentFactory.getCardInfos().stripe_token
              }
              $log.log("Mando questo payload",payload)
              /* $http({
               method : 'POST',
               url : 'http://localhost:5000/v0/integrations/stripe/charge',
               data : payload,
               headers: {
               Authorization: marketcloud.public
               }
               }).success(function(response){

               $log.log(response)

               }).error(function(response){

               $log.error(response)
               })*/
              paymentFactory.clearFields();
              cartFactory.svuota()

              $window.location.assign('/#');
            }
          })
        } else {
          swal.close();
        }
      });

    }
  });
