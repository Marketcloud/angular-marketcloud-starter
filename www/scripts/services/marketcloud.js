'use strict';

/**
 * @ngdoc service
 * @name boilerplateMarketcloudAngularApp.marketcloud
 * @description
 * # marketcloud
 * Service in the boilerplateMarketcloudAngularApp.
 */
angular.module('boilerplateMarketcloudAngularApp')
  .factory('marketcloud', ['$cookies','$rootScope',function (cookies,root) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    console.log("Init marketcloud service");
    marketcloud.public = '8e083835-eacd-4cb9-8d99-bfda3d991c4f';
    

    return marketcloud;
  }]);
