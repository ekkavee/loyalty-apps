angular.module('starter.controllers')

.controller('ContactCtrl', function($scope, $rootScope, $http, $stateParams, API_URI, APP_KEY, AuthService, moment){
  $scope.contact = {};
  console.log($stateParams);

  $scope.sendContact = function(contact){
    var url = API_URI+'member/contactus?token='+AuthService.authToken();
    var data = {
      method:contact.choice.toLowerCase(),
      time_of_call:moment(contact.time).tz('Australia/Melbourne').format('HH:mm:ss'),
      message:contact.msg||'',
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
    }
    console.log(data);
    $http.post(url, data).then(function(s){
      console.log(s);

      var options = {
        title: "",
        cssClass: 'thx-msg',
        tpl: s.data.message,
        okText: 'OK',
        okType: 'button-magenta',
        callBack: function () {
        }
      }

      $rootScope.createAlertPopup(options);

      $scope.contact = {};
      // $scope.contact.choice = 'Phone';
    }, function(e){
      console.log(e);
      var options = {
        title: "Oops! Something went wrong, please try again",
        cssClass: 'thx-msg',
        tpl: e.data.message,
        okText: 'OK',
        okType: 'button-magenta',
        callBack: function () {
        }
      }
      $rootScope.createAlertPopup(options);
    });
  }
});
