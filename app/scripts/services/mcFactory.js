'use strict';
/*
 Creates the marketcloud object.
 Change the marketcloud.public string in order to use this app with your store.
 */
angular.module('provaMrkCldApp')
  .factory('marketcloud', function () {
    //Marketcloud SDK instance
    var marketcloud = new Marketcloud.Client({
       publicKey : '691ad512-cd1d-420e-8ba0-433b2b02a357'
    })
    marketcloud.appStarted = false;

    return marketcloud;
  });
