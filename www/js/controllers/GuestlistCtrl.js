angular.module('starter.controllers')

.controller('GuestlistCtrl', function($scope, $rootScope, $timeout, $http, $ionicLoading, $ionicHistory, API_URI, APP_KEY, AuthService, moment){
  $scope.gl = {};
  $timeout(function(){
    $scope.gl={
        first_name:$rootScope.member.member.first_name,
        last_name:$rootScope.member.member.last_name,
        email:$rootScope.member.email,
        mobile:$rootScope.member.mobile?$rootScope.member.mobile:null,
        gender:'male',
    };
  }, 1000);

  $scope.createGL = function(gl){
    console.log(gl);
    var data = {
      first_name:gl.first_name,
      last_name:gl.last_name,
      email:gl.email,
      mobile:gl.mobile,
      gender:gl.gender || '',
      guest_name:gl.guestlist,
      guest_date:moment(gl.date).tz('Australia/Melbourne').format('YYYY-MM-DD'),
      guest_time:moment(gl.time).tz('Australia/Melbourne').format('HH:mm:ss'),
      type:gl.type || '',
      comment:gl.comments || '',
      attendee:gl.attendees || '',
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
    }
    console.log(data);

    var url = API_URI+'member/guestList?token='+AuthService.authToken();
    $ionicLoading.show();
    $http.post(url, data).then(function(s){
      $ionicLoading.hide();
      console.log(s);
      $scope.gl={
          first_name:$rootScope.member.member.first_name,
          last_name:$rootScope.member.member.last_name,
          email:$rootScope.member.email,
          mobile:$rootScope.member.mobile?$rootScope.member.mobile:null,
          gender:'male',
      };
      var options = {
          title:"",
          cssClass:'thx-msg',
          tpl:'Your Guest List has been successfully submitted',
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){
          }
      }

      $rootScope.createAlertPopup(options);

    }, function(e){
      console.log(e);
      $ionicLoading.hide();
      var options = {
          title:"Opps! Something went wrong, please try again.",
          cssClass:'thx-msg',
          tpl:e.data.message,
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){
              // $scope.closeModal();
          }
      }

      $rootScope.createAlertPopup(options);
    });

  };

  $scope.back = function(){
      $timeout(function(){
        $ionicHistory.goBack();
      });
  };

});
