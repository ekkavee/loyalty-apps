angular.module('starter.controllers')

.controller('BookingsCtrl', function($scope, $ionicHistory, $state, $timeout){
  $scope.back = function(){
      $state.go('menu.tabs.home');
  };

  $scope.navTo = function(state, data){
    $state.go(state, {'data':data}, {reload:state});
  }
});
