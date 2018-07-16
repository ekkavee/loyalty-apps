angular.module('starter.controllers')

.controller('WhatsOnCtrl', function($scope, $rootScope, Listings, $q, $ionicHistory, Members, $state, $ionicLoading, $window, PROFILE_DEFAULT, $ionicSlideBoxDelegate, SocialMediaReader, $timeout, $ionicModal, OrderModal, enquiryPopup){
  $scope.listings = [];
  $scope.currentTab = 1;
  $scope.events = {};

  $scope.init = function(){
    Listings.getListings('20').then(function(s){
      $scope.events.guest = $rootScope.objToArr(s);
      Listings.getListings('16').then(function(res){
        $scope.events.member = $rootScope.objToArr(res);
      }, function(err){
        $scope.events.member = [];
      });
      $ionicLoading.hide();
    }, function(e){
      $ionicLoading.hide();
      $scope.events.guest = [];
    }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
        if($scope.currentTab == 1){
          $scope.listings = $scope.events.guest;
        }else{
          $scope.listings = $scope.events.member;
        }
    });
  };

  $scope.back = function(){
      // console.log($ionicHistory);
      // $timeout(function(){
      //   $ionicHistory.goBack();
      // });
      $state.go('menu.tabs.home');
  };

  $scope.init();

  $rootScope.$on('updateListings', function(e, d){
    console.log('updateListings');
    $scope.init();
  });

  $scope.setTab = function(index){
    if(index != $scope.currentTab){
      $scope.currentTab = index;
      if(index == 1){
        $scope.listings = $scope.events.guest;
      }else{
        $scope.listings = $scope.events.member;
      }
    }
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
