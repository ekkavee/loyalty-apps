angular.module('starter.controllers')
.controller('BookingHistoryCtrl', function($scope, $rootScope, Transactions, $ionicPopup, $timeout, $ionicHistory, $ionicScrollDelegate, PaypalService, Members, Order, Transactions){
  // $scope.bookings = [];

  $scope.init = function(){
    Transactions.getAllBookingTransacs().then(function(s){
      $scope.bookings = s;
    }, function(e){
      $scope.bookings = []
    }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.init();

  $scope.back = function(){
    console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });
  };

  $scope.toggleGroup = function(group) {
    group.show = !group.show;
    $ionicScrollDelegate.resize();

  };
  $scope.isGroupShown = function(group) {
    return group.show;
  };

  $scope.timeParser = function(date, time){
    return moment(date+' '+time).format('h:mm a');
  }

});
