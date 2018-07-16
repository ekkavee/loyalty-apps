angular.module('starter.controllers')

.controller('FavorCtrl', function($scope, $rootScope, Listings, $q, Members, $state, $ionicLoading, $window, $ionicHistory, PROFILE_DEFAULT, $ionicSlideBoxDelegate, SocialMediaReader, $timeout, $ionicModal, OrderModal, enquiryPopup, FavoriteListing){
  $scope.listings = [];
  $scope.cats = [];
  $scope.init =function(){
    $ionicLoading.show();
    FavoriteListing.get().then(function(s){
      $scope.listings =s;
      angular.forEach($scope.listings, function(listing){
        if(!$scope.cats.includes(listing.listing.type.key.name)){
          $scope.cats.push(listing.listing.type.key.name);
        }
      });
      console.log($scope.cats);
      $ionicLoading.hide();
    }, function(e){
      $ionicLoading.hide();
      console.log(e);
    }).finally(function () {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.init();

  $scope.slickConfig = {
    dots: false,
    variableWidth: true,
    slidesToShow:3,
    infinite: false
  };

  $scope.remove = function(listing){
    FavoriteListing.remove(listing.listing.id).then(function(r){
      $scope.listings.splice($scope.listings.indexOf(listing), 1);
    });
  };

  $scope.openItem = function(listingID){
    $state.go("menu.listing", {id:listingID});
  }

  $scope.back = function(){
    console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });
  };
});
