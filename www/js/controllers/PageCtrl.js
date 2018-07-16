angular.module('starter.controllers')

  .controller('PageCtrl', function ($scope, $rootScope, $ionicScrollDelegate, $stateParams, $timeout, $state, $ionicLoading, $ionicPopover, Listings, OrderModal, enquiryPopup) {
    console.log($stateParams);
    $scope.filterItems = [];
    $scope.selectedFilter = '';

    $scope.btnActived = function (page) {
      if ($scope.btnActive == page) {
        return true;
      } else {
        return false;
      }
    };

    $scope.changeBtn = function (page) {
      if(page == $scope.btnActive){
        return;
      }
      $ionicLoading.show();
      $scope.btnActive = page;
      $ionicScrollDelegate.$getByHandle('mainScroll').resize();
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
      resizeImgs();

      $timeout(function () {
        $ionicLoading.hide();
      }, 1000);
    }

    $scope.init = function () {
      $ionicLoading.show();
      $scope.pages.forEach(function (page, index) {
        Listings.getListings(page.listing_type_id).then(function (s) {
          page.listings = $rootScope.objToArr(s);
          getFilterItems(page);
          if(index == $scope.pages.length -1){
            $scope.$broadcast('scroll.refreshComplete');
            resizeImgs();
          }
          $timeout(function () {
            $ionicLoading.hide();
          }, 1500);
        }, function (e) {
          $ionicLoading.hide();
          $scope.listings = [];
        })
      });



      // $timeout(function () {
      //   $scope.$broadcast('scroll.refreshComplete');
      //   console.log($scope.pages);
      // }, 1000)
      // resizeImgs();
    };

    function resizeImgs() {
      $timeout(function () {
        var listingImgElements = angular.element(document.getElementsByClassName('venue-layer'));
        var ratio = 1;
        listingImgElements.css('width', listingImgElements[0].clientHeight * ratio);
      }, 1500);
    }

    // $scope.init();
    if (typeof $rootScope['layout'] != 'undefined') {
      $scope.pages = $rootScope.layout[$stateParams.view.layout][$stateParams.view.index].pages;
      $scope.pageName = $rootScope.layout[$stateParams.view.layout][$stateParams.view.index].page_name;

      $scope.btnActive = $scope.pages[0];
      $scope.init();
    }

    $rootScope.$on('LayoutReady', function (event, data) {
      $scope.pages = $rootScope.layout[$stateParams.view.layout][$stateParams.view.index].pages;
      $scope.pageName = $rootScope.layout[$stateParams.view.layout][$stateParams.view.index].page_name;
      $scope.btnActive = $scope.pages[0];
      $scope.init();
    });

    $scope.shortDay = function (day) {
      return day.name.substring(0, 3);
    }

    $scope.openItem = function (listingID) {
      $state.go("menu.listing", { id: listingID });
    }


    $scope.btnRows = function (col) {
      if ($scope.btnActive.listings.length <= 0) {
        return 0;
      }
      return Math.ceil($scope.btnActive.listings.length / col);
    };

    $scope.bookGC = function (listing, flag) {
      OrderModal.showGCOrder(listing, flag);
    }

    $scope.enquiry = function (listing) {
      enquiryPopup.show(listing, $scope).then(function (r) {
        console.log(r);
        //submit enquiry here
      });
    }

    //
    // accordion
    //
    $scope.openedItem = null;
    $scope.openItemInpage = function (listing) {
      if ($scope.openedItem === listing) {
        $scope.openedItem = null;
      }
      else {
        $scope.openedItem = listing
      }
    }

    $scope.isOpenItemInpage = function (listing) {
      if (listing === $scope.openedItem) {
        return true;
      }
      return false;
    }


    function getFilterItems(page) {
      page.listings.forEach(function (listing) {
        if (listing.listing.venue && $scope.filterItems.filter(function(item){
          return item.id == listing.listing.venue.id
        }).length == 0) {
          $scope.filterItems.push({
            id: listing.listing.venue.id,
            name: listing.listing.venue.name
          });
        }
      });

      $scope.filterItems.sort(function(a ,b){
        return a.id - b.id;
      });

      // console.log($scope.filterItems);
    }

    $scope.popoverFilter = function ($event) {
      $ionicPopover.fromTemplateUrl('templates/popoverfilter.html', {
        scope: $scope,
        backdropClickToClose: true
      }).then(function (popover) {
        $scope.popover = popover;
        $scope.popover.show($event);
      });
    };

    $scope.selectFilter = function(id){
      $scope.selectedFilter = $scope.selectedFilter != id?id:$scope.selectedFilter;
      $scope.popover.remove()
      $ionicScrollDelegate.$getByHandle('mainScroll').resize();
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
      resizeImgs();
    }

    // $scope.$on('$destroy', function () {
    //   $scope.popover.remove();
    // });

    $timeout(function () {
      console.log($stateParams.view.view);
      window.ga.trackView($stateParams.view.view, '', true);
    });


  });
