'use strict';

/*
 Creazione dell'oggetto marketcloud. è possibile cambiare la key in modo da utilizzare un altro store.
 */
angular.module('provaMrkCldApp')
  .factory('marketcloud', function ($rootScope) {
    $rootScope.greet = "Hallo";
    console.log("$rootScope setted\n $rootScope says : " + $rootScope.greet + " marketcloud Factory!");

    //console.log("MarketCloud Service (scambio key)" );
    marketcloud.public = 'ba952728-a428-466b-94a3-72effb6c4ace';
    //console.log("Market cloud public key setted " +marketcloud.public);
    return marketcloud;
  });
