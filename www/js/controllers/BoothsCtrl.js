angular.module('starter.controllers')

.controller('BoothsCtrl', function($scope, $rootScope, $state, $timeout, $ionicModal, $ionicLoading, $ionicHistory, $ionicViewService, moment, BoothService, $ionicSlideBoxDelegate, $ionicScrollDelegate, Listings, $q, $http, API_URI, APP_KEY, AuthService, Payment, $ionicPickerI18n){
  $scope.locations = [];
  $scope.search = {};
  $scope.searchRes = {
    data:null,
  };

  //data picker config
  $ionicPickerI18n.okClass = "button ng-binding button-full button-color-dark";
  $ionicPickerI18n.cancelClass = "button ng-binding button-full button-color-grey";

  var getContent = function(){
      var url = API_URI+'member/appcontent';
      var data = {
        token:AuthService.authToken(),
        app_token:APP_KEY.app_token,
        app_secret:APP_KEY.app_secret,
      }
      $http.get(url, {params:data}).then(function(s){
        $scope.contents = $rootScope.objToArr(s.data.data);
        console.log(s.data.data);
      },function(e){
        $scope.contents = [];
        console.log(e);
      });
  }

  function getBooths(){
    BoothService.getBooths().then(function(s){
      $scope.booths = $rootScope.objToArr(s);
      console.log($scope.booths);
      $ionicSlideBoxDelegate.update();
      $ionicSlideBoxDelegate.start();
    });
  }

  $scope.getimgs = function(listing, type){
    var img = [];
    if(angular.isDefined(listing.pictures) && listing.pictures.length>0){
      listing.pictures.map(function(x){
        if(x.type == type){
          img.push(x.filename);
        }
      });
    }
    console.log(img);
    return img;
  }


  $scope.init = function(){
    $ionicLoading.show();
    BoothService.getLocations().then(function(s){
      console.log(s);
      $scope.locations = s;
      $scope.locations.splice(0,0,{heading:'Any', id:0})
      if(s.length > 0 ){
        $scope.search.location = s[0]
        // $scope.selectedLoc = s[0];
        // $ionicSlideBoxDelegate.update();
        // $ionicSlideBoxDelegate.start();
      }
    },function(e){
      console.log();
    });

    getBooths();

    // getContent();

    // Listings.getListings('14').then(function(s){
    //   $scope.listings = $rootScope.objToArr(s);
    //   console.log(s);
    // }, function(e){
    //   $ionicLoading.hide();
    //   $scope.listings = [];
    // });

    $timeout(function(){
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    }, 2000);
  }

  $scope.dateFormat = function(time, format){
    return moment(time).tz('Australia/Melbourne').format(format);
  };

  $scope.back = function(){
      if($scope.searchRes.data != null){
        $scope.searchRes.data = null;
        return;
      }
      // console.log($ionicHistory);
      // $timeout(function(){
      //   $ionicHistory.goBack();
      // });

      $state.go('menu.bookings');


  };

  $scope.getMiniPpl = function(booth){
    var mini = 0;
    if(booth.listing.reservations.length > 0){
      mini = booth.listing.reservations[0].min_people;
    }
    // var mini = 0;
    angular.forEach(booth.listing.reservations, function(r){
      if(Number(r.min_people) < mini){
        mini = Number(r.min_people);
      }
    });
    return mini;
  }

  $scope.getMiniSpend = function(booth){
    var min = 0;
    if(booth.listing.reservations.length > 0){
      mini = booth.listing.reservations[0].min_spend;
    }

    // var mini = 0;
    angular.forEach(booth.listing.reservations, function(r){
      if(Number(r.min_spend) < mini){
        mini = Number(r.min_spend);
      }
    });
    return mini;
  }

  $scope.getSessionById = function(sessions, session_id){
    var session = {};
    angular.forEach(sessions, function(s){
      if(s.id === parseInt(session_id)){
        session = s;
      }
    });
    console.log(session);
    return session;
  }



  $scope.init();

  $rootScope.$on('refreshBoothPage', function(){
    // $state.go('menu.booths', {}, {reload:true});
    $state.transitionTo('menu.booths', {}, {
      reload: true, inherit: false, notify: true
    });
    $scope.locations = [];
    $scope.search = {};
    $scope.searchRes = {
      data:null,
    };
  });

  $scope.chooseLoc = function(loc, index){
    if($scope.selectedLoc != loc){
      $scope.selectedLoc = loc;
      // $ionicSlideBoxDelegate.$getByHandle('space-slide').update();
      // $ionicSlideBoxDelegate.$getByHandle('space-slide').start();
      console.log(loc);
      var handle = $ionicSlideBoxDelegate.$getByHandle('location-slide');
      if($scope.selectedLoc != $scope.locations[handle.currentIndex()]){
        handle.slide(index);
      }
      console.log($ionicSlideBoxDelegate.$getByHandle('space-slide'));
      // $ionicSlideBoxDelegate.$getByHandle('space-slide').update();
      // $ionicSlideBoxDelegate.update();
      // $ionicSlideBoxDelegate.start();
      // $ionicSlideBoxDelegate.$getByHandle('space-slide').start();

    }
  }


  $scope.slideHasChanged = function(index){
    console.log(index);
  }


  $scope.searchBooth = function(search){
    if(angular.isDefined(search.booth_listing_id)){
      delete search.booth_listing_id;
    }

    $ionicLoading.show();
    BoothService.searchSlot(search).then(function(s){
      console.log(s);
      $scope.searchRes.data = null;
      $timeout(function(){
        $scope.searchRes.data = s.data;
        $ionicSlideBoxDelegate.$getByHandle('search-slide').update();
        $ionicSlideBoxDelegate.$getByHandle('search-slide').start();
      })

    }, function(e){

      $scope.searchRes.data = [];

    }).finally(function(){
      $ionicLoading.hide();

        $ionicLoading.hide();
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();

      if($scope.modal.isShown()){
        $scope.closeBoothSearchModal();
      }
    });

  }


  $scope.bookBooth = function(search, booth){
    if($scope.searchRes.data!=null && $scope.searchRes.data.length > 0){
      $state.go('menu.detail', {booking:search, res:booth});
    }else{
      search.booth_listing_id = booth.listing.id;
      search.location = booth.listing.spaces.length > 0?booth.listing.spaces[0].space:{};
      search.booth_title = booth.listing.heading;
      console.log(search);
      var data = {
        search:search
      }
      // $state.go('menu.booth-search', {data:data}, {reload:true})
      $state.transitionTo('menu.booth-search', {data:data}, {
        reload: true, inherit: true, notify: true
      });

    }
  }

  $scope.closeBoothSearchModal = function(){
    $scope.modal.hide();
    delete $scope.search.booth_listing_id;
  }


  // $rootScope.openCreditCardModal = function(payment_info, order_token){
  //   console.log('payment_info', payment_info);
  //   console.log('order_token', order_token);
  //   $ionicModal.fromTemplateUrl('templates/credit-card-modal.html', {
  //   scope: $scope,
  //   animation: 'slide-in-up'
  //   }).then(function(modal) {
  //     $rootScope.ccModal = modal;
  //     $rootScope.ccModal.show();
  //   });
  // }
})


.controller('BoothsDetailCtrl', function($scope, $rootScope, $state, $stateParams, $ionicHistory, $ionicLoading, $timeout, $ionicScrollDelegate, $ionicModal, moment, BoothService, Members, Payment, $ionicActionSheet, $ionicPopup, creditCardService){
  // console.log('stateParams', $stateParams);
  $scope.listing = $stateParams.res.listing;
  $scope.book = {
    date:$stateParams.booking.date,
    location:$stateParams.res.listing.spaces[0].space,
    ppl:$stateParams.booking.ppl,
    booth_listing_id:$stateParams.booking.booth_listing_id,
    min_spend:getSessionById($stateParams.res.listing.reservations, $stateParams.res.reservation_id).min_spend,
    selected_session:getSessionById($stateParams.res.listing.reservations, $stateParams.res.reservation_id),
    reservation_id:$stateParams.res.reservation_id,
  };


  function checkMinSpend(date, reservations){
    var min = 0;
    if(reservations.length <= 0){
      return 0;
    }
    angular.forEach(reservations, function(res){
      console.log(res.day_of_week_iso, moment(date).tz('Australia/Melbourne').day());
      if(moment(date).tz('Australia/Melbourne').day() == res.day_of_week_iso){
        min = Number(res.min_spend);
      }
    });
    return min;
  };

  function getSessionById(sessions, session_id){
    var session = {};
    angular.forEach(sessions, function(s){
      if(s.id === parseInt(session_id)){
        session = s;
      }
    });
    // console.log(session);
    return session;
  }

  $scope.getFloorPlan = function(pics){
    var floor_plan = pics.filter(function(pic){
      return pic.type == 'location_floorplan';
    });
    // console.log(floor_plan);
    return floor_plan;
  };

  $scope.openFloorPlan = function(pics){
      $scope.floor_plan = pics;
      $ionicModal.fromTemplateUrl('templates/floor-plan-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
      }).then(function(modal) {
        $rootScope.floorPlanModal = modal;
        $rootScope.floorPlanModal.show();
      });
  }


  $scope.steps = [1, 2, 3, 4, 5];
  $scope.currentStep = 1;
  $scope.changeStep = function(step){
    console.log(step);
    if($scope.currentStep != step){
      $scope.currentStep = step;
    }
    // console.log($scope.currentStep);
  }

  $scope.isPackage = false;
  $scope.book.order_type = 'product';

  console.log($scope.book);

  $scope.dateFormat = function(time, format){
    return moment(time).tz('Australia/Melbourne').format(format);
  };

  $scope.getTotal = function(products, type){
      var total = 0;
      if(angular.isDefined(products) && products.length > 0){
          angular.forEach(products, function(product){
              var qty = 0;
              angular.forEach(product.product.stocks, function(stock){
                  qty += stock.qty;
              });

              if(type == 'point'){
                  total += Number(product.product.point_price)*qty;
              }else{
                  total += Number(product.product.unit_price)*qty;
              }
          });
      }
      $scope.book.subtotal = total;
      return total;
  };


  $scope.bookingTotal = function(packages){
    var total = 0;
    if(packages.length>0){
      angular.forEach(packages, function(package){
        total += $scope.getTotal(package.package.products, 'cash');
      });
    }
    // return total > $scope.book.min_spend?total:$scope.book.min_spend;
    $scope.book.subtotal = total;
    return total;
  }

  $scope.autoSelectQTY = function(products){
    if(products.length > 0){
      angular.forEach(products, function(product){
        angular.forEach(product.product.stocks, function(stock){
          console.log(product.auto_qty, stock);
          stock.qty = product.auto_qty;
        });
      });
    }
  }

  $scope.selectPack = function(listing, isPackage){
    console.log(listing);
    if(!isPackage){
      $scope.isPackage = true;
      $scope.book.order_type = 'package';
      $timeout(function(){
        angular.forEach(listing.packages, function(package){
          $scope.autoSelectQTY(package.package.products);
        });
      });

    }else{
      angular.forEach(listing.products, function(product){
        angular.forEach(product.product.stocks, function(stock){
          stock.qty = 0;
        });
      });
      $scope.isPackage = false;
      $scope.book.order_type = 'product';
    }

    $timeout(function(){
      $ionicScrollDelegate.resize();
    });

  }

  $scope.back = function(){
    if($scope.currentStep == 1){
      console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });
    }else{
      $scope.currentStep = $scope.currentStep - 1;
    }


  };

  $scope.toggleGroup = function(group) {
    group.show = !group.show;
    $ionicScrollDelegate.resize();
  };
  $scope.isGroupShown = function(group) {
    return group.show;
  };

  function triggerModal(){
    $ionicModal.fromTemplateUrl('templates/booths-booking-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };



//order confirm
$scope.confirmBooking = function(){
  triggerModal();
}

$scope.makeReservation = function(flag){
  // if(flag == 'pay'){
  //   var tpl = 'The total cost of your reservation is $'+$scope.subtotal($scope.listing.packages)+'. Please press OK to pay.';
  //   var total = $scope.subtotal($scope.listing.packages);
  //   if(total < $scope.book.min_spend){
  //     total = $scope.book.min_spend;
  //     tpl = 'The total cost of your reservation is less than the minimum spend $'+$scope.book.min_spend+'. You can add more items in this reservation or press OK to pay the minimum spend price.';
  //   }
  //   var success = function(){pay(); };
  // }
  // if(flag == 'book'){
  //   var tpl = 'The total cost of your reservation is $'+$scope.subtotal($scope.listing.packages)+'. Please press OK to send your booking request. We will contact you ASAP.';
  //   var total = $scope.subtotal($scope.listing.packages);
  //   if(total < $scope.book.min_spend){
  //     total = $scope.book.min_spend;
  //     tpl = 'The total cost of your reservation is less than the minimum spend $'+$scope.book.min_spend+'. You can add more items in this reservation or press OK to send your booking request. We will contact you ASAP.';
  //   }
  //   var success = function(){reservationOnly();};
  // }

  // console.log($scope.listing, $scope.book);

  pay();
}

//
//show payment options
//params: callbackArray Array
//
function showPayMethod(callbackArray){
    // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
      //  { text: '<b>Paypal</b>' },
       { text: '<b>Credit Card</b>' }
     ],
    //  destructiveText: 'Delete',
     titleText: 'Choose Your Payment Method',
     cancelText: 'Cancel',
     cancel: function() {
       callbackArray[0]();
      },
     buttonClicked: function(index) {
       console.log(index);
       callbackArray[index+1]();
       return true;
     }
   });
};

$scope.openCreditCardModal = function(payment_info, order_token){
  console.log('payment_info', payment_info);
  console.log('order_token', order_token);
  var options = {
    payment_info:payment_info,
    order_token:order_token,
    ccPayModel:'booth',
    ccModalTitle:'booth booking',
    book:$scope.book,
    listing:$scope.listing,
    cardType:['Visa', 'MasterCard', 'American Express'],
    successTitle:'Thank you for booking',
    successMsg:'Your will find the reservation code in your email inbox.',
  };
  creditCardService.openCCModal(options);
}

var payByCc = function(payment_info, order_token){
  // console.log(order_token);
  $scope.card = {};
  $scope.payment_info = payment_info;
  // $scope.cardError = {};
  $scope.cardType = ['Visa', 'MasterCard', 'American Express'];
  $scope.openCreditCardModal(payment_info, order_token);
}


function pay(){
  // makeReservation();
  $ionicLoading.show();
  $scope.listing.reservations[0].product.stocks[0].qty = 1;
  console.log($scope.listing);
  BoothService.makeReservation($scope.listing, $scope.book).then(function(s){
    if($scope.book.order_type == 'package'){
      var total = $scope.bookingTotal($scope.listing.packages) > $scope.book.min_spend?$scope.bookingTotal($scope.listing.packages):$scope.book.min_spend;
    }else{
      var total = $scope.getTotal($scope.listing.products, 'cash') > $scope.book.min_spend?$scope.getTotal($scope.listing.products, 'cash'):$scope.book.min_spend;
    }
    // var total = $scope.bookingTotal($scope.listing.packages) > $scope.book.min_spend?$scope.bookingTotal($scope.listing.packages):$scope.book.min_spend;
    if(Number(total) <= 0){
        $scope.$broadcast('ConfirmOrder', {token:s.token, paypal_id:s.id});
        return;
    }

    console.log(s.token);
    Payment.NABFingerPrint(s.token).then(function(r){
      console.log(r.data);
      $ionicLoading.hide();
      var callbackArray = [function(){
        $scope.$broadcast('CancelOrder', {token:s.token, paypal_id:''});
      }, function(){
        payByCc(r.data, s.token);
      }];
      showPayMethod(callbackArray);

    }, function(e){
      $ionicLoading.hide();
      console.log(e);
      var options = {
        title: "sorry",
        cssClass: 'thx-msg',
        tpl: e.data.message,
        okText: 'OK',
        okType: '',
        callBack: function () {
        }
      }
      $rootScope.createAlertPopup(options);
    });

  }, function(e){
    $ionicLoading.hide();
    var options = {
        title:'',
        cssClass:'thx-msg',
        tpl:e.data.message,
        okText:'OK',
        okType: 'button-blue',
        callBack: function(){
            // $scope.closeModal();
        }
    }

    $rootScope.createAlertPopup(options);
  });
}


function reservationOnly(){
  $scope.listing.reservations[0].product.stocks[0].qty = 1;
  // console.log($scope.listing);
  BoothService.makeReservation($scope.listing, $scope.book).then(
    function(s){
      var options = {
        title: "Thank you for booking",
        cssClass: 'thx-msg',
        tpl: s.message,
        okText: 'OK',
        okType: 'button-magenta',
        callBack: function () {}
      }

      $rootScope.createAlertPopup(options);

      $scope.modal.hide();
      $scope.back();

    },function(e){
      var options = {
        title: "sorry",
        cssClass: 'thx-msg',
        tpl: e.data.message,
        okText: 'OK',
        okType: '',
        callBack: function () {
        }
      }
      $rootScope.createAlertPopup(options);
    }
  );
}

$scope.$on('ConfirmOrder', function(e, d){
    console.log(d);
    $ionicLoading.show();
    Payment.orderConfirm(d.token, 'confirmed', d.paypal_id).then(function(s){
      $ionicLoading.hide();
        var options = {
            title:"Thank you for booking.",
            cssClass:'thx-msg',
            tpl:s.data.message,
            okText:'OK',
            okType: 'button-blue',
            callBack: function(){
                if(parseInt(s.data.reward) > 0){
                    $rootScope.$broadcast('RewardPoint', {point:parseInt(s.data.reward)});
                }
                Members.getMember().then(function(member){
                    $rootScope.member = member.data.data;
                    $scope.modal.hide();
                    // MenuBadge.setBadge(1, 'orders');
                    // $rootScope.$broadcast('LoadBadges', {});
                    // $state.go('app.tab.redeem');
                });
            }
        }

        $rootScope.createAlertPopup(options);
    }, function(e){
      $ionicLoading.hide();
    });
});

$scope.$on('CancelOrder', function(e, d){
    console.log(d);
    Payment.orderConfirm(d.token, 'cancelled', d.paypal_id).then(function(s){
        console.log(s);
        $ionicLoading.hide();
    }, function(e){
        console.log(e);
        $ionicLoading.hide();
    });
});

});
