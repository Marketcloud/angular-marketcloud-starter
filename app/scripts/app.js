'use strict';

/**
 * Main module of the application.
 */
angular
  .module('provaMrkCldApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui-notification',
    'ngTouch',
    'ui.bootstrap'])
  .config(function ($routeProvider) {
    console.log("Hello Angular");
    $routeProvider
      .when('/', {
        templateUrl: 'views/mainView.html',
        controller: 'mainCtrl'
      }).when('/login', {
      templateUrl: 'views/loginView.html',
      controller: 'loginCtrl'
    }).when('/signup', {
      templateUrl: 'views/signupView.html',
      controller: 'signupCtrl'
    }).when('/cart', {
        templateUrl: 'views/cartView.html',
        controller: 'cartCtrl'
      }).when('/checkOutAddress', {
        templateUrl: 'views/checkOutShippingView.html',
        controller: 'checkOutShipping'
      }).when('/checkOutBilling', {
      templateUrl: 'views/checkOutBillingView.html',
      controller: 'checkOutBilling'
    }).when('/stripePayment', {
      templateUrl: 'views/stripePaymentView.html',
      controller: 'stripePaymentCtrl'
    }).when('/recapOrder', {
      templateUrl: 'views/recapOrderView.html',
      controller: 'recapOrderCtrl'
    }).otherwise({
        redirectTo: '/'
      });
    Stripe.setPublishableKey('pk_test_o3U6ovC4zG8SXiEPsvFLSQ2E');
  });
