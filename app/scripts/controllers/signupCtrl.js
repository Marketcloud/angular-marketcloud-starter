'use strict'

/*
* Manages the signup view
*/

angular.module('provaMrkCldApp')
  .controller('signupCtrl', function ($scope, $rootScope, marketcloud, $window, $log, Notification) {
    
      //$log.log("$rootScope: " + $rootScope.greet + " signupCtrl Controller!");

      if(!/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent) && $rootScope.fromUpdatedCart){
        Notification.success({message: 'The cart has been updated ', delay: 2500});
        $rootScope.fromUpdatedCart = false;
      }

      $scope.email = null;
      $scope.password = null;
      $scope.confirm_password = null;
      $scope.error = false;
      $scope.errorMessage = null;

    /**
     * Creates a new user
     */
      $scope.signup = function () {
        $log.log("email -> " + $scope.email + "  password -> " + $scope.password + " Error State = " + $scope.error);

        if ($scope.password != $scope.confirm_password) {
          $scope.error = true;
          $scope.errorMessage = "Password mismatch"
        } else if ($scope.password.length < 6) {
          $scope.error = true;
          $scope.errorMessage = "Password must be at least 6 characters long"
        }
        else {
          marketcloud.users.create({ //creates the new user
            email: $scope.email,
            password: $scope.password
          }, function (err) {
            if (err) {
              $log.log(err);
              $scope.error = true
              $scope.errorMessage = "Email already used";
            }
            else {
              $log.log("User created");
              $scope.error = false
              $scope.errorMessage = "";
              swal({
                title: "<b>Congratulations!</b>",
                text: "<b>Sign up complete!</b>\n You will now be redirect to the login page</b>",
                type: "success",
                confirmButtonText: "Cool",
                html: true
              });
              $window.location.assign('/#/login');
            }
            $scope.$apply()
          })
        }
      }
    }
  );
