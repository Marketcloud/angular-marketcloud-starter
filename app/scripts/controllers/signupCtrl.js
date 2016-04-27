'use strict'

/*
 controller per la registrazione di un nuovo utente
 */
angular.module('provaMrkCldApp')
  .controller('signupCtrl', function ($scope, $rootScope, marketcloud, $window, $log, Notification) {
      //$log.log("$rootScope: " + $rootScope.greet + " signupCtrl Controller!");

      if(!/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent) && $rootScope.fromUpdatedCart){
        Notification.success({message: 'Salvataggio automatico del carrello ', delay: 2500});
        $rootScope.fromUpdatedCart = false;
      }

      //init variabili $scope
      $scope.email = null;
      $scope.password = null;
      $scope.confirm_password = null;
      $scope.error = false;
      $scope.errorMessage = null;

      //Funzione per la registrazione di un utente
      $scope.signup = function () {
        $log.log("email -> " + $scope.email + "  password -> " + $scope.password + " Error State = " + $scope.error);

        if ($scope.password != $scope.confirm_password) {
          // $log.warn("Password diverse");
          $scope.error = true;
          $scope.errorMessage = "Le password non coincidono"
        } else if ($scope.password.length < 6) {
          $scope.error = true;
          $scope.errorMessage = "La password deve essere lunga almeno 6 caratteri"
        }
        else {
          marketcloud.users.create({ //creazione utente
            email: $scope.email,
            password: $scope.password
          }, function (err) {
            if (err) {
              $log.log("err");
              $scope.error = true
              $scope.errorMessage = "Email già utilizzata";
            }
            else {
              $log.log("registrazione ok");
              $scope.error = false
              $scope.errorMessage = "";
              swal({
                title: "<b>Congratulazioni!</b>",
                text: "<b>Registrazione effettuata!</b>\n Verrai ora reindirizzato alla pagina di login</b>",
                type: "success",
                confirmButtonText: "Cool",
                html: true
              });
              $window.location.assign('/#/login');
             // $location.path("/login");
            }
            $scope.$apply()
          })
        }
      }
    }
  );
