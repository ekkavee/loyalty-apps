angular.module('starter.controllers')

.controller('SearchCtrl', function($scope, $http, $state, $rootScope, $ionicLoading, API_URI, APP_KEY, AuthService, OrderModal, enquiryPopup){
  $scope.listings = [];


  $scope.search = function(searchKeyword){
    console.log(searchKeyword);
    $ionicLoading.show();
    var url = API_URI+'member/search/'+searchKeyword;
    var data = {
      token:AuthService.authToken(),
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret
    };

    $http.get(url, {params:data}).then(function(s){
      console.log(s);
      $scope.listings = $rootScope.objToArr(s.data.message);
      $ionicLoading.hide();
    },function(e){
      console.log(e);
      $scope.listings = [];
      $ionicLoading.hide();
    });
  }

  $scope.openItem = function(listingID){
    $state.go("menu.listing", {id:listingID});
  }

  $scope.book = function(listing, flag){
    OrderModal.showOrder(listing, flag);
  }

  $scope.enquiry = function(listing){
    enquiryPopup.show(listing, $scope).then(function(r){
      console.log(r);
      //submit enquiry here
    });
  }
});
