angular.module('starter.controllers')

.controller('CardCtrl', function($scope, $rootScope){
  $rootScope.$broadcast('UserInit', {});
});
