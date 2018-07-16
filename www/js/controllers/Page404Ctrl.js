angular.module('starter.controllers')

.controller('Page404Ctrl', function($scope, $rootScope, $http, $ionicHistory, $timeout, $ionicModal, $ionicLoading, API_URI, APP_KEY, AuthService, Voucher){


  $scope.back = function(){
    console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });
  };



});
