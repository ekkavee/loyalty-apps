angular.module('starter.controllers')
  .controller('HomeCtrl', function ($scope, $rootScope, Listings, $q, Members, $state, $ionicLoading, $window, PROFILE_DEFAULT, $ionicSlideBoxDelegate, SocialMediaReader, $timeout, $ionicModal, OrderModal, enquiryPopup, HomeTiles, NotificationService) {
    // console.log('HomeCtrl init');
    $scope.default_img = PROFILE_DEFAULT;
    $scope.listings = [];
    $scope.homeTiles = [];
    

    $scope.homeBtns = $rootScope.layout ? $rootScope.layout.home_menus : [];
    $scope.homeTiles = $rootScope.layout ? $rootScope.layout.galleries : [];
    $ionicSlideBoxDelegate.update();
    $ionicSlideBoxDelegate.start();
    $rootScope.$on('LayoutReady', function (event, data) {
      $scope.homeBtns = $rootScope.layout.home_menus;
      $scope.homeTiles = $rootScope.layout.galleries;
      // console.log('here',$scope.homeTiles);
      $ionicSlideBoxDelegate.update();
      $ionicSlideBoxDelegate.start();
      $timeout(function () {
        var buttonElements = angular.element(document.getElementsByClassName('home-btn'));
        var ratio = 1;
        console.log(buttonElements);
        buttonElements.css('height', buttonElements[0].clientWidth / ratio);
      });
    });
    // $scope.homeBtns = [
    //   {name:'What\'s on', link:'menu.whats', bgImg:'img/demo_imgs/btn_bg01.png'},
    //   {name:'promotions', link:'menu.promotions', bgImg:'./img/demo_imgs/btn_bg02.png'},
    //   {name:'love membership', link:'menu.tabs.search', bgImg:'img/demo_imgs/btn_bg03.png'},
    //   {name:'tickets', link:'menu.tickets', bgImg:'img/demo_imgs/btn_bg01.png'},
    //   {name:'bookings', link:'menu.bookings', bgImg:'img/demo_imgs/btn_bg02.png'},
    //   {name:'guest list', link:'menu.guestlist', bgImg:'img/demo_imgs/btn_bg03.png'},
    //   {name:'vouchers', link:'menu.vouchers', bgImg:'img/demo_imgs/btn_bg01.png'},
    //   {name:'food & beverages', link:'menu.food', bgImg:'img/demo_imgs/btn_bg02.png'},
    //   {name:'hours location', link:'menu.time-location', bgImg:'img/demo_imgs/btn_bg03.png'},
    // ];

    //get dynamicBtns
    // HomeTiles.get().then(function(s){
    //   console.log('here', JSON.parse(s[0].extended_value));
    //   $scope.homeBtns = JSON.parse(s[0].extended_value);
    //   $timeout(function(){
    //     var buttonElements = angular.element(document.getElementsByClassName('home-btn'));
    //     var ratio = 111/74;
    //     console.log(buttonElements);
    //     buttonElements.css('height', buttonElements[0].clientWidth/ratio);
    //   });
    //
    // });

    $scope.mainSlideOptions = {
      loop: true,
      effect: 'fade',
      speed: 500,
    }

    $scope.btnRows = function (col) {
      if ($scope.homeBtns.length <= 0) {
        return 0;
      }
      return Math.ceil($scope.homeBtns.length / col);
    };

    // $timeout(function(){
    //   var buttonElements = angular.element(document.getElementsByClassName('home-btn'));
    //   var ratio = 111/74;
    //   console.log(buttonElements);
    //   buttonElements.css('height', buttonElements[0].clientWidth/ratio);
    // });

    // $scope.homeTiles = [];

    function getNotify() {
      NotificationService.get().then(function (s) {
        $rootScope.messages = s;
      }, function (e) {
        console.log(e);
      });
    }

    function init() {
      // $ionicLoading.show();
      // Listings.getListings('2').then(function(s){
      //   $scope.homeTiles = $rootScope.objToArr(s)[0].listing.pictures;
      //   console.log('homeTiles', $scope.homeTiles);
      //   $ionicSlideBoxDelegate.update();
      //   $ionicSlideBoxDelegate.start();
      //   HomeTiles.get().then(function(s){
      //
      //     $scope.homeBtns = JSON.parse(s[0].extended_value);
      //     $timeout(function(){
      //       var buttonElements = angular.element(document.getElementsByClassName('home-btn'));
      //       var ratio = 111/74;
      //       console.log(buttonElements);
      //       buttonElements.css('height', buttonElements[0].clientWidth/ratio);
      //     });
      //
      //   });
      // }, function(e){
      //
      // }).finally(function () {
      //     $ionicLoading.hide();
      //     $scope.$broadcast('scroll.refreshComplete');
      // });

      // HomeTiles.get().then(function(s){
      //   $scope.homeTiles = $rootScope.objToArr(s);
      //     $ionicSlideBoxDelegate.update();
      //     $ionicSlideBoxDelegate.start();
      // }).finally(function () {
      //     // Stop the ion-refresher from spinning
      //     $scope.$broadcast('scroll.refreshComplete');
      // });

      //in-app Notification
      // getNotify();
      $timeout(function () {
        $scope.$broadcast('scroll.refreshComplete');
      }, 3000);
    };

    $scope.openItem = function (listingID) {
      console.log(listingID);
      // $state.go("menu.tabs.home.listing", {id:listingID});
      $window.location.href = '#/menu/listing/' + listingID;
    }

    $scope.book = function (listing, flag) {
      OrderModal.showOrder(listing, flag);
    }

    $scope.enquiry = function (listing) {
      enquiryPopup.show(listing, $scope).then(function (r) {
        console.log(r);
        //submit enquiry here
      });
    }

    init();
    // getNotify();

    $scope.refresh = function () {
      $rootScope.$broadcast('UserInit', {});
      init();
      getNotify();
    }

    $rootScope.$on('updateListings', function (e, d) {
      init();
      getNotify();
    });

    $scope.slideHasChanged = function ($index) {
      console.log($index);
    }

    $scope.navTo = function (state) {
      if (state.stateName == 'website') {
        $rootScope.goSocialLink(state.url);
      }
      var data = {};
      console.log(state);
      if (state.stateName.indexOf('tabs') !== -1 && state.stateName != "menu.tabs.home") {
        data = { id: state.stateName.charAt(state.stateName.length - 1) };
      }
      $state.go(state.stateName, data);
    }



    $scope.link = function (url) {
      $window.location.href = url;
    }
    //refresh data
    // $rootScope.$on('HomeInit', function(event, data){
    //   $scope.init();
    // });

    $scope.homeBarcodeOptions = {
      width: 1.7,
      height: 100,
      quite: 20,
      displayValue: false,
      font: "monospace",
      textAlign: "center",
      fontSize: 12,
      backgroundColor: "",
      lineColor: "#000"
    };

    // getHomeTiles();

    $scope.refreshImg = function (src) {
      return src + '?' + new Date().getTime();
    }

    // $scope.test = function(){
    //   $rootScope.$broadcast('increaseVoucherBadge', {});
    // }

    // $scope.openCard = function () {
    //   if ($rootScope.member.member.bepoz_account_number) {
    //     $ionicModal.fromTemplateUrl('templates/card-modal.html', {
    //       scope: $scope,
    //       animation: 'fade-in',
    //       backdropClickToClose: false,
    //     }).then(function (modal) {
    //       $scope.cardModal = modal;
    //       $scope.cardModal.show();
    //     });
    //
    //     $scope.closeModal = function () {
    //       $scope.cardModal.hide();
    //     }
    //   }
    //   else {
    //     var options = {
    //       title: "",
    //       cssClass: 'thx-msg',
    //       tpl: "<p class='text-center'>Your membership barcode is being generated. You will be notified when it is ready.</p>",
    //       okText: 'OK',
    //       okType: 'button-magenta',
    //       callBack: function () {
    //         $rootScope.$broadcast('UserInit', {});
    //       }
    //     }
    //
    //     $rootScope.createAlertPopup(options);
    //   }
    // }

    $timeout(function () {
      console.log('Home');
      if (window.ga) {
        window.ga.trackView('Home', '', true);
      }

      var buttonElements = angular.element(document.getElementsByClassName('home-btn'));
      var ratio = 1;
      console.log(buttonElements);
      if(buttonElements.length>0){
        buttonElements.css('height', buttonElements[0].clientWidth / ratio);
      }
    });

  });
