angular.module('starter.controllers')

.controller('ProCtrl', function($scope, $rootScope, Listings, $q, $ionicHistory, Members, $state, $ionicLoading, $window, PROFILE_DEFAULT, $ionicSlideBoxDelegate, SocialMediaReader, $timeout, $ionicModal, OrderModal, enquiryPopup, PromoService, $ionicPopup){
  $scope.listings = [];
  // $scope.currentTab = 1;
  $scope.btnActive = {};

  $scope.init = function(){
    // Listings.getListings('6').then(function(s){
    //   $scope.listings = $rootScope.objToArr(s);
    // }, function(e){
    //   $scope.listings = [];
    // }).finally(function () {
    //     $scope.$broadcast('scroll.refreshComplete');
    // });
    PromoService.getPromo().then(function(s){
      console.log(s);
      $timeout(function(){
        $scope.btnActive.listings = $rootScope.objToArr(s);
      });
      console.log($scope.btnActive);
    },function(e){

    }).finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.init();

  $scope.expTime = function(time){
    return moment(time).format('ddd DD/MM/YY');
  }

  $scope.btnRows = function(col){
        if($scope.btnActive.listings.length <= 0){
            return 0;
        }
        return Math.ceil($scope.btnActive.listings.length/col);
  };

  $scope.back = function(){
    console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });

  };

  $scope.showProDetials = function(listing){
    console.log(listing);
    var options = {
      title: listing.listing.heading, // String. The title of the popup.
      template: '<img ng-src="'+listing.listing.image_square+'" >'+'<span>'+listing.listing.desc_short+'</span>',
      cssClass: 'promo-success-popoup', // String, The custom CSS class name
      okText: 'Redeem', // String (default: 'OK'). The text of the OK button.
      okType: 'button-positive', // String (default: 'button-positive'). The type of the OK button.
      cancelText: 'Cancel', // String (default: 'Cancel'). The text of the Cancel button.
      cancelType: 'button-positive',
    };

    $ionicPopup.confirm(options).then(function(res){
      if(res) {
       $scope.claimPromo(listing);
     } else {
       console.log('cancelled');
     }
    });
  }

  $scope.claimPromo = function(listing){
    $ionicLoading.show();
    PromoService.claimPromo(listing.listing).then(function(s){

      // $scope.listings.splice($scope.listings.indexOf(listing), 1);
      $scope.init();
      var options = {
        title: 'SUCCESS', // String. The title of the popup.
        template: '<h4>'+listing.listing.heading+'</h4><span>has been added to you Vouchers</span>',
        cssClass: 'promo-success-popoup', // String, The custom CSS class name
        okText: 'OK', // String (default: 'OK'). The text of the OK button.
        okType: 'button-positive', // String (default: 'button-positive'). The type of the OK button.
      };
      $ionicPopup.alert(options);

    }, function(e){
      var options = {
          title:"Oops! Something went wrong, please try again.",
          cssClass:'thx-msg',
          tpl:e.data.message,
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){}
      }
      $rootScope.createAlertPopup(options);
    }).finally(function(){
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
