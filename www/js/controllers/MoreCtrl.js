angular.module('starter.controllers')

.controller('MoreCtrl', function($scope, $rootScope, $ionicHistory, $state, $timeout, $ionicLoading, $rootScope, $http, $stateParams, API_URI, APP_KEY, AuthService, Listings, PromoService){
  $scope.tickets = [];
  $scope.promos = [];


  $timeout(function(){
    console.log($stateParams);
    $scope.isTab = $stateParams.isTab;
  });

  $scope.go = function(stateName, options){
    console.log(stateName);
    $state.go(stateName);
  };

  $scope.back = function(){
      $timeout(function(){
        $ionicHistory.goBack();
      });

  };

  function getTickets(){
    var url = API_URI+'member/userVoucher?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    }
    $http.get(url, {params:data}).then(function(s){
      console.log(s.data.data);
      $scope.tickets = s.data.data;
    },function(e){
      console.log(e);
      // $scope.listings = [];
    }).finally(function () {
        // $timeout(function(){
        //   $ionicLoading.hide();
        // }, 1000);
        // $scope.$broadcast('scroll.refreshComplete');
    });
  };

  function getPromos(){
    PromoService.getPromo().then(function(s){
      $scope.promos = $rootScope.objToArr(s);
    }, function(e){
      $scope.promos = [];
    }).finally(function () {
        // $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.init = function(){
    $rootScope.$broadcast('UserInit', {});
    getTickets();
    getPromos();

    $timeout(function(){
       $scope.$broadcast('scroll.refreshComplete');
    }, 500);
  };

  $scope.init();

  $timeout(function(){
    console.log('Account');
    window.ga.trackView('Account','', true);
  });
});
