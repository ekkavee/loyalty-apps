angular.module('starter.controllers')

.controller('ReferCtrl', function($scope, $rootScope, $http, $ionicLoading, $ionicHistory, API_URI, APP_KEY, AuthService, $timeout){
  $scope.refer = {};
  $scope.referMsg = '';

  $scope.init = function(){
    var url = API_URI+'member/referralMessage';
    var data = {
      token:AuthService.authToken(),
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    }
    $http.get(url, {params:data}).then(function(s){
      console.log(s);
      $scope.referMsg = s.data.data.friend_referral_message;
    },function(e){

    }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.init();

  $scope.back = function(){
    console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });

  };

  function sendRefer (email, name){
    var url = API_URI+'member/friendreferral?token='+AuthService.authToken();
    var data = {
      email:email,
      name:name,
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
    }
    $ionicLoading.show();
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
      $scope.refer = {};
      $rootScope.createAlertPopup(options);
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
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  $scope.referFriend = function(refer){
    console.log(refer);
    if(refer.name && (refer.mobile || refer.email)){
      sendRefer(refer.email, refer.name);
    }else{
      var options = {
        title: "Sorry",
        cssClass: 'thx-msg',
        tpl: "Please enter an email address or mobile number.",
        okText: 'OK',
        okType: 'button-magenta',
        callBack: function () {}
      }
      $rootScope.createAlertPopup(options);
    }
  }

  $timeout(function(){
    console.log('Refer a friend');
    window.ga.trackView('Refer a friend','', true);
  });
});
