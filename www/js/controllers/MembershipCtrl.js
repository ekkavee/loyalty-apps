angular.module('starter.controllers')

.controller('MemberTiersCtrl', function($scope, Members, $state){
  $scope.memberships = [];

  function getTiers(){
    Members.getMemberTiers().then(function(s){
      $scope.memberships = s.data.data;
      console.log($scope.memberships);
    }, function(e){
      console.log(e);
    }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.init = function(){
    getTiers();
  }

  $scope.init();

  $scope.openItem = function(listingID){
    $state.go("menu.tabs.search.tier", {id:listingID});
  }
})

.controller('TierCtrl', function($scope, $rootScope, listing, $ionicModal, moment, $state, $timeout, Order, $ionicPopup, Members, MenuBadge, $ionicLoading, Payment, $ionicHistory, $ionicActionSheet, creditCardService){
  $scope.listing = listing;
  $scope.back = function(){
    console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });

  };

  //send tier upgrade request and get payment info
  var upgradeTier = function(tier){
    $ionicLoading.show();
    Members.tierUpgrade(tier).then(function(s){
      console.log(s);
      Payment.NABFingerPrint(s.data.token).then(function(pay){
        console.log(pay.data);

        var callbackArray = [function(){
          $scope.$broadcast('CancelOrder', {token:s.data.token, paypal_id:''});
        }, function(){
          payByCc(pay.data, s.data.token);
        }];
        showPayMethod(callbackArray);

      }, function(e){
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
    }).finally(function(){
      $ionicLoading.hide();
    });
  };

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
            // add cancel code..
          },
       buttonClicked: function(index) {
         console.log(index);
         callbackArray[index+1]();
         return true;
       }
     });
  };

  var payByCc = function(payment_info, order_token){
    // console.log(order_token);
    $scope.card = {};
    $scope.payment_info = payment_info;
    // $scope.cardError = {};
    $scope.cardType = ['Visa', 'MasterCard', 'American Express'];
    $scope.openCreditCardModal(payment_info, order_token);
  }

  $scope.openCreditCardModal = function(payment_info, order_token){
    console.log('payment_info', payment_info);
    console.log('order_token', order_token);
    // creditCardService.openCCModal(payment_info, order);
    // $ionicModal.fromTemplateUrl('templates/credit-card-modal.html', {
    // scope: $scope,
    // animation: 'slide-in-up'
    // }).then(function(modal) {
    //   $scope.ccPayModel = 'tier';
    //   $scope.ccModal = modal;
    //   $scope.ccModalTitle = 'become a ';
    //   $scope.ccModal.show();
    //   $scope.closeCcModal = function(){
    //     $scope.ccModal.hide();
    //     $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
    //   }
    // });
    var options = {
      payment_info:payment_info,
      order_token:order_token,
      ccPayModel:'tier',
      ccModalTitle:'become a ',
      book:{},
      listing:$scope.listing,
      cardType:['Visa', 'MasterCard', 'American Express'],
      successTitle:'Thank you for your payment',
      successMsg:"Please enjoy your "+$scope.listing.heading+" .",
    };
    creditCardService.openCCModal(options);
  };

  $scope.submit = function(tier_id){
    upgradeTier(tier_id);
  };

  $scope.submitCreditCard = function(card, payment_info){
    console.log(card);
    $ionicLoading.show();

    Payment.NABDirectPay(card, payment_info).then(function(s){
      console.log(s);

        if(s.status == 'ok'){
          $rootScope.$broadcast('UserInit', {});
          var options = {
            title: "Thank you for your payment.",
            cssClass: 'thx-msg',
            tpl: "Please enjoy your "+$scope.listing.heading+" membership.",
            okText: 'OK',
            okType: 'button-magenta',
            callBack: function () {}
          }

          if(angular.isDefined(s.reward) && parseInt(s.reward) > 0){
              $rootScope.$broadcast('RewardPoint', {point:parseInt(s.reward)});
          }
          Members.getMember().then(function(member){
              $rootScope.member = member.data.data;
              $scope.ccModal.hide();
              $scope.back();
          });

          $rootScope.createAlertPopup(options);
        }
        else if (s.status == 'error') {
          var options = {
              title:"Oops! Something went wrong, please try again.",
              cssClass:'thx-msg',
              tpl:s.message,
              okText:'OK',
              okType: 'button-blue',
              callBack: function(){}
          }

        $rootScope.createAlertPopup(options);
        // $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
        }
        else{
          var options = {
              title:"Oops! Something went wrong, please try again.",
              cssClass:'thx-msg',
              tpl:s,
              okText:'OK',
              okType: 'button-blue',
              callBack: function(){}
          }

        $rootScope.createAlertPopup(options);
        // $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
      }
    }, function(e){
      //fail to pay
      console.log(e);
      var options = {
          title:"Oops! Something went wrong, please try again.",
          cssClass:'thx-msg',
          tpl:e.data.message,
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){
              // $scope.closeModal();
          }
      }

      $rootScope.createAlertPopup(options);
    }).finally(function(){
      $ionicLoading.hide();
    });
  }


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


})

.controller('MembershipCtrl', function($scope, $state, $rootScope, $ionicHistory, $ionicActionSheet, $ionicPopup, Members, Payment, $ionicLoading, $timeout){
  $scope.selectedTier = {};
  $scope.tiers = [];
  // $scope.home_address = null;
  // $scope.bill_address = null;
  $scope.hasBillingAddress = false;
  $scope.billAddressText = 'different billing address';


  function getTiers(){
    Members.getMemberTiers().then(function(s){
      $scope.tiers = s.data.data;
      console.log($scope.tiers);
    }, function(e){
      console.log(e);
    });
  }

  function getAddress(name){
    var res = null;
    if($rootScope.member.member.member_addresses.length > 0){
      angular.forEach($rootScope.member.member.member_addresses, function(address){
        if(address.category == name){
          // res = JSON.parse(address.payload).google_map_obj;
          res = address;
        }
      });
    }
    return res;
  }

  getTiers();
  $timeout(function(){
    $scope.home_address = getAddress('home')?JSON.parse(getAddress('home').payload).google_map_obj:null;
    console.log($scope.home_address);
  }, 1000);


  $scope.chooseTier = function(tier){
    if(tier != $scope.selectedTier){
      $scope.selectedTier = null;
      $timeout(function(){
        $scope.selectedTier = tier;
        console.log($scope.selectedTier);
      }, 200);
    }
  }

  //Optional
  $scope.countryCode = 'AU';

  //Optional
  $scope.onAddressSelection = function (location, name) {
      console.log(location);
      if(name == 'home'){
        $scope.home_address = location;
      }
      else if (name == 'bill') {
        $scope.bill_address = location;
      }
      //Do something
      // typeOfAdd = location;
  };

  $scope.cancel = function(){
    // $scope.selectedTier =1;
    // $scope.home_address = null;
    // $scope.bill_address = null;
    $scope.hasBillingAddress = false;
    $scope.billAddressText = 'different billing address';
    $ionicHistory.goBack();
  };

  $scope.isBillingAddress = function(){
    // console.log($scope.hasBillingAddress);
    $scope.hasBillingAddress = !$scope.hasBillingAddress;
    if($scope.hasBillingAddress){
      $scope.billAddressText = 'same as above';
      $scope.bill_address = getAddress('bill')?JSON.parse(getAddress('bill').payload).google_map_obj:null;
    }else{
      $scope.billAddressText = 'different billing address';
      $scope.bill_address = null;
    }

  }

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
            // add cancel code..
          },
       buttonClicked: function(index) {
         console.log(index);
         callbackArray[index+1]();
         return true;
       }
     });
  };


  var payByCc = function(payment_info){
    // console.log(order_token);
    $scope.card = {};
    $scope.cardError = {};
    $scope.cardType = ['Visa', 'MasterCard', 'American Express'];
  //   $scope.$watch('card', function(newVal, oldVal) {
  //
  // }, true);
    var options = {
      title: 'Please enter your credit card below.',
      cssClass: 'cc-popoup',
      subTitle: '', // String (optional). The sub-title of the popup.
      templateUrl: 'templates/credit-card-popover.html', // String (optional). The URL of an html template to place in the popup   body.
      scope: $scope, // Scope (optional). A scope to link to the popup content.
      buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
        text: 'Cancel',
        type: 'button-default',
        onTap: function(e) {
          // $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
          // e.preventDefault() will stop the popup from closing when tapped.
          // e.preventDefault();
        }
      }, {
        text: 'OK',
        type: 'button-positive',
        onTap: function(e) {
          console.log($scope);
          $scope.cardError = {
            isName:angular.isUndefined($scope.card.cardholder_name) && $scope.card.cardholder_name.length>=4,
            isNum:angular.isUndefined($scope.card.card_number),
            isCvn:angular.isUndefined($scope.card.cvn),
            isMon:angular.isUndefined($scope.card.expiry_month),
            isYear:angular.isUndefined($scope.card.expiry_year)
          }
          if($scope.cardError.isName || $scope.cardError.isNum || $scope.cardError.isCvn || $scope.cardError.isMon || $scope.cardError.isYear){
            console.log($scope.cardError);
            e.preventDefault();
          }
          else{
            console.log($scope.card);
            $ionicLoading.show();


            Payment.NABDirectPay($scope.card, payment_info).then(function(s){
              console.log(s);
              $ionicLoading.hide();
              try{
                s = JSON.parse(s);
                if(s.status == 'ok'){
                  // $rootScope.$broadcast('UserInit', {});
                  var options = {
                    title: "Thank you",
                    cssClass: 'thx-msg',
                    tpl: "Payment successful",
                    okText: 'OK',
                    okType: 'button-magenta',
                    callBack: function () {}
                  }

                  $rootScope.createAlertPopup(options);

                  if(angular.isDefined(s.reward) && parseInt(s.reward) > 0){
                      $rootScope.$broadcast('RewardPoint', {point:parseInt(s.reward)});
                  }
                  Members.getMember().then(function(member){
                      $rootScope.member = member.data.data;
                      $ionicHistory.goBack();
                  });
                  // $ionicHistory.goBack();
                }else{
                  var options = {
                    title: s.title,
                    cssClass: 'thx-msg',
                    tpl: s.message,
                    okText: 'OK',
                    okType: 'button-magenta',
                    callBack: function () {}
                  }

                  $rootScope.createAlertPopup(options);
                }
              }catch(err){
                var options = {
                  title: "Processing Error.",
                  cssClass: 'thx-msg',
                  tpl: s,
                  okText: 'OK',
                  okType: 'button-magenta',
                  callBack: function () {}
                }
                $rootScope.createAlertPopup(options);
              }

            }, function(e){
              console.log(e);
              var options = {
                title: "Processing Error.",
                cssClass: 'thx-msg',
                tpl: "Oops! Something went wrong, please try again.",
                okText: 'OK',
                okType: 'button-magenta',
                callBack: function () {}
              }

              $rootScope.createAlertPopup(options);
              $ionicLoading.hide();
            });

          // PayWay.createSingleToken($scope.card).then(function(s){
          //   // alert(JSON.stringify(s));
          //   var singleUseTokenId = s.data.singleUseTokenId;
          //   // alert(singleUseTokenId);
          //   Payment.payway(order_token, singleUseTokenId).then(function(s){
          //         $ionicLoading.hide();
          //         //pop up success information
          //         var options = {
          //             title:"Thank you for purchasing "+$scope.listing.heading+"!",
          //             cssClass:'thx-msg',
          //             tpl:"Your order is being processed",
          //             okText:'OK',
          //             okType: 'button-blue',
          //             callBack: function(){
          //                 if(parseInt(s.data.reward) > 0){
          //                     $rootScope.$broadcast('RewardPoint', {point:parseInt(s.data.reward)});
          //                 }
          //                 Members.getMember().then(function(member){
          //                     $rootScope.member = member.data.data;
          //                     $scope.OrderModal.closeModal();
          //                 });
          //             }
          //         }
          //
          //         $rootScope.createAlertPopup(options);
          //   }, function(err){
          //       var options = {
          //           title:"Oops! Something went wrong, please try again.",
          //           cssClass:'thx-msg',
          //           tpl:err.data.message,
          //           okText:'OK',
          //           okType: 'button-blue',
          //           callBack: function(){
          //               // $scope.closeModal();
          //           }
          //       }
          //
          //       $rootScope.createAlertPopup(options);
          //
          //       $ionicLoading.hide();
          //   });
          //
          // }, function(e){
          //   var options = {
          //       title:"Oops! Something went wrong, please try again.",
          //       cssClass:'thx-msg',
          //       tpl:"",
          //       okText:'OK',
          //       okType: 'button-blue',
          //       callBack: function(){
          //           // $scope.closeModal();
          //       }
          //   }
          //   $rootScope.createAlertPopup(options);
          //   $ionicLoading.hide();
          // });
          }

        }
      }]
    }

    popup = $ionicPopup.show(options);

  };

  var upgradeTier = function(tier_id){
    Members.tierUpgrade(tier_id).then(function(s){
      console.log(s.data.token);
      Payment.NABFingerPrint(s.data.token).then(function(pay){
        console.log(pay.data);

        var callbackArray = [function(){
          // $scope.$broadcast('CancelOrder', {token:s.token, paypal_id:''});
        }, function(){
          payByCc(pay.data, s.data.token);
        }];
        showPayMethod(callbackArray);

      }, function(e){
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
  };

  function createAddress(name, google_map){
    var add = {
      name:name,
  		google_map_obj:google_map,
  		formatted_address:google_map.formatted_address
    }

    Members.createMemberAddress(add, name).then(function(s){
      console.log(s);
    },function(e){
      console.log(e);
    });
  };

  function updateAddress(old_address_obj, new_address_obj){
    var add = {
      name:old_address_obj.category,
  		google_map_obj:new_address_obj,
  		formatted_address:new_address_obj.formatted_address
    }
    Members.updateMemberAddress(old_address_obj.id, add).then(function(s){
      console.log(s);
    },function(e){
      console.log(e);
    });
  }

  function saveAddress(name, address_obj){
    if(getAddress(name)){
      //update
      updateAddress(getAddress(name), address_obj)
    }
    else{
      createAddress(name, address_obj)
    }
  };


  $scope.submit = function(){
    // $rootScope.createConfirmPop({
    //   tpl:'You selected '+$scope.selectedTier,
    //   title:'Please Confirm Your Tier.',
    //   failCallBack:function(){console.log('Cancel');},
    //   successCallBack:function(){console.log('Ok');},
    // });
    var tier_id = null;
    angular.forEach($scope.tiers, function(tier){
      if(tier == $scope.selectedTier){
        tier_id = tier.id;
      }
    });
    //
    console.log(tier_id);
    // console.log($scope.home_address);

    saveAddress('home', $scope.home_address);
    if($scope.bill_address){
      console.log($scope.bill_address);
      saveAddress('bill', $scope.home_address);
    }

    upgradeTier(tier_id);

    // var callbackArray = [function(){
    //   $scope.$broadcast('CancelOrder', {token:s.token, paypal_id:''});
    // }, function(){
    //   payByCc(tier_id);
    // }];
    // showPayMethod(callbackArray);

    // getTierUpgradeToken(tier_id);
  }


});
