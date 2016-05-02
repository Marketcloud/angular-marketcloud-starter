'use strict'
/**
 * Manages the order recap view
 */
angular.module('provaMrkCldApp')
  .controller('recapOrderCtrl', function ($scope, marketcloud, cartFactory, $log, $window, paymentFactory, $rootScope) {

    if ($rootScope.loggedIn == undefined || !$rootScope.loggedIn) {
      $window.location.assign('/#');
    }

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
    $log.log("cart is  \n",$scope.theCart)

    $scope.total = cartFactory.getPrice();

    //confirms the order (see doCheckout())
    $scope.confirmOrder = function() {
      $scope.doCheckout(cartFactory.getLocalCart());
    }

    //manages the check out process
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
        title: "Confirm",
        text: "If you continue the order will be sent to the store. \n The cart will be cleaned, and you will" +
        "return to the main page. Are you sure you want to continue?. \n",
        imageUrl: "images/end.gif",
        imageSize: "150x150",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, continue",
        animation: "slide-from-top",
        cancelButtonText: "No, I changed my mind",
        closeOnConfirm: false,
      }, function (isConfirm) {
        if (isConfirm) {
          marketcloud.orders.create(the_order,function(err,created_order){
            if (err) {
              alert("Critical error during order creation (see log)")
              $log.error("an error has occurred while creating the order", err)
            }
            else{
              swal("Done", "Order complete! \n You will now be redirect to the main page", "success");

              var payload = {
                amount : Math.round(created_order.total*100),
                stripe_token : paymentFactory.getCardInfos().stripe_token
              }
              //TODO: CHARGE PROCESS WILL BE SOON IMPLEMENTED IN THE API
              /*
               $log.log("Mando questo payload",payload)
               $http({
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
              cartFactory.cleanCart()

              $window.location.assign('/#');
            }
          })
        } else {
          swal.close();
        }
      });
    }
  });
