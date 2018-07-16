angular.module('starter.controllers')

.controller('AboutCtrl', function($scope, $rootScope, Listings, $q, Members, $state, $ionicLoading, $window, AuthService, PROFILE_DEFAULT, $ionicSlideBoxDelegate, SocialMediaReader, $timeout, $ionicModal, OrderModal, enquiryPopup, API_URI, APP_KEY, $http){
  $scope.listings = [];
  // $scope.currentTab = 1;

  $scope.init = function(){
    var url = API_URI+'member/about';
    var data = {
      token:AuthService.authToken(),
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    }
    $http.get(url, {params:data}).then(function(s){
      $scope.about = s.data.data.about;
      console.log($scope.about);
    },function(e){

    }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.init();

  // $scope.setTab = function(index){
  //   if(index != $scope.currentTab){
  //     $scope.currentTab = index;
  //   }
  // }


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

  $timeout(function(){
    console.log('About');
    window.ga.trackView('About','', true);
  });
});
