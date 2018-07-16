angular.module('starter.controllers')

.controller('TeamCtrl', function($scope, $rootScope, Listings, $ionicLoading, $ionicPopup, moment, $timeout,$window, $ionicSlideBoxDelegate){
  $scope.listings = [];

  $scope.init = function(){
    $ionicLoading.show();
      Listings.getListings('6').then(function(s){
          $timeout(function(){
              $scope.listings = s;
              $ionicSlideBoxDelegate.update();
              $ionicSlideBoxDelegate.start();
              $ionicLoading.hide();
              // $scope.isEmpty = emptylisting();
          }, 1500);
      }, function(e){
      // console.log('redeem list init fail', e);
      $ionicLoading.hide();
    }).finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.init();

  $scope.btnRows = function(listings, col){
        if(listings.length <= 0){
            return 0;
        }
        return Math.ceil(listings.length/col);
  };

  $scope.link = function (url) {
    $window.location.href = url;
  }

  $scope.opsition = function(payload){
    if(payload){
      var json = JSON.parse(payload);
    }else{
      return '';
    }
    if(angular.isDefined(json.position) && json.position != ''){
      return json.position;
    }
    else {
      return '';
    }
  };

  $scope.showProDetials = function(listing){
    console.log(listing);
    var options = {
      title: listing.listing.heading+'<p>'+listing.listing.venue.name+'</p>', // String. The title of the popup.
      template: '<img src="'+listing.listing.image_square+'" >'+'<span>'+listing.listing.desc_short+'</span>',
      cssClass: 'promo-success-popoup', // String, The custom CSS class name
      okText: 'close', // String (default: 'OK'). The text of the OK button.
      okType: 'button-positive', // String (default: 'button-positive'). The type of the OK button.
    };

    $ionicPopup.alert(options).then(function(res){

    });
  }

})
