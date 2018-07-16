angular.module('starter.controllers')
.controller('FaqCtrl', function($scope, FAQ){
  $scope.init = function(){
    FAQ.getFaq().then(function(s){
      $scope.faqs = s;
    }).finally(function () {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.init();


})
