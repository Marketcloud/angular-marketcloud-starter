'use strict';

/**
 * @ngdoc service
 * @name boilerplateMarketcloudAngularApp.stripejs
 * @description
 * # stripejs
 * Service in the boilerplateMarketcloudAngularApp.
 */
angular.module('boilerplateMarketcloudAngularApp')
  .service('stripejs', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    Stripe.setPublishableKey('pk_test_i9MotUXUk01yjzer6yYTZuXM');
    return Stripe;
  });
