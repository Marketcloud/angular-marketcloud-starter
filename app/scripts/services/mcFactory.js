'use strict';

/*
 Creazione dell'oggetto marketcloud. è possibile cambiare la key in modo da utilizzare un altro store.
 */
angular.module('provaMrkCldApp')
  .factory('marketcloud', function ($rootScope) {
    $rootScope.greet = "Hallo";
    console.log("$rootScope setted\n $rootScope says : " + $rootScope.greet + " marketcloud Factory!");

    //console.log("MarketCloud Service (scambio key)" );
    marketcloud.public = '691ad512-cd1d-420e-8ba0-433b2b02a357';
    //console.log("Market cloud public key setted " +marketcloud.public);
    return marketcloud;
  });
