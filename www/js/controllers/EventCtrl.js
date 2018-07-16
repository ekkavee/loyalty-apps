angular.module('starter.controllers')

.controller('EventCtrl', function($scope, $rootScope, Listings, $q, $ionicHistory, Members, $state, $ionicLoading, $window, PROFILE_DEFAULT, $ionicSlideBoxDelegate, SocialMediaReader, $timeout, $ionicModal, OrderModal, enquiryPopup){
  // $scope.listings = [];
  // $scope.currentTab = 1;

  $scope.init = function(){
    var listing_id = '7';

    Listings.getListings(listing_id).then(function(s){
      $scope.listings = $rootScope.objToArr(s);
      $ionicLoading.hide();
    }, function(e){
      $ionicLoading.hide();
      $scope.listings = [];
    }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.init();

  $rootScope.$on('UserReady', function(e, d){
    $scope.init();
  });

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

  $scope.back = function(){
    console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });
  };
});
