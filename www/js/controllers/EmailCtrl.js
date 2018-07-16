angular.module('starter.controllers')

.controller('EmailCtrl', function($scope, $rootScope, $timeout, $state, $ionicLoading, $ionicHistory, Members){
  $scope.new = {};

  $scope.updateEmail = function(form){
    $ionicLoading.show();
    Members.updateEmail(form).then(function(s){
      $rootScope.$broadcast('UserInit', {});

      var options = {
          title:"Email Updated Successfully",
          cssClass:'thx-msg',
          tpl:'',
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){
              // $scope.closeModal();
          }
      }

      $timeout(function(){
        $ionicLoading.hide();
        $scope.new = {};
        $ionicHistory.goBack();
        // $state.go('menu.profile');
        $rootScope.createAlertPopup(options);
      }, 3000);

    }, function(e){
      console.log(e);

      var options = {
          title:"Oops! Something went wrong, please try again.",
          cssClass:'thx-msg',
          tpl:e.data.message,
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){
              // $scope.closeModal();
          }
      }

      $ionicLoading.hide();
      $rootScope.createAlertPopup(options);
    });
  }

  $scope.resendEmail = function(){
    $ionicLoading.show();
    Members.resendConfirmEmail().then(function(s){
      var options = {
        title:"",
        cssClass:'thx-msg',
        tpl:"<p class='text-center'>Email Successfully Sent, Please Check Your Inbox.</p>",
        okText:'OK',
        okType: 'button-blue',
        callBack: function(){
        }
      }

      var options = {
          title:"Email Successfully Sent, Please Check Your Inbox.",
          cssClass:'thx-msg',
          tpl:'',
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){}
      }

      $ionicLoading.hide();
      $rootScope.createAlertPopup(options);
    }, function(e){
      console.log(e);
      var options = {
          title:"Oops! Something went wrong, please try again.",
          cssClass:'thx-msg',
          tpl:e.data.message,
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){}
      }
      $ionicLoading.hide();
      $rootScope.createAlertPopup(options);
    });
  }
});
