angular.module('starter.controllers')
.controller('OrderModalCtrl', function($scope, $rootScope, $timeout, $ionicPopup, OrderModal, $ionicLoading, Members, MenuBadge, PaypalService, $ionicLoading, Payment, $ionicHistory, $ionicActionSheet, $ionicPopover, Stripe){
  $scope.order = {};
  $scope.refer = {};
  $scope.order.mix = false;

  $timeout(function(){
    $scope.OrderModal = OrderModal;
    $scope.listing = OrderModal.listing();
    $scope.orderType = OrderModal.orderType();
    console.log($scope.listing);

    if($scope.listing.type.name == 'Redeem'){
        $scope.redeemOnly = true;
    }
    if(OrderModal.flag() == 'cash'){
        $scope.order.show = 'cash';

    }
    else if(OrderModal.flag() == 'point'){
        $scope.order.show = 'point';
    }

    $scope.itemSelected = function(stock){
        $scope.selectInput = stock;
    };

    $scope.changeOrder = function(type){
        if($scope.order.show != type){
            $scope.order.show =type;
            console.log($scope.listing.products);
            // $scope.selectInput = {};
        }
    };

    $scope.isEnoughPts = function(){
      if($scope.order.pointUse){
        if($scope.order.pointUse > $rootScope.ptsToInt($rootScope.member.member.points)){
          var options = {
              title:"Oops! Your do not have enough points, please try again.",
              cssClass:'thx-msg',
              tpl:'',
              okText:'OK',
              okType: 'button-blue',
              callBack: function(){
              }
          }
          $rootScope.createAlertPopup(options);
          $scope.order.pointUse = $rootScope.ptsToInt($rootScope.member.member.points);
        }
      }
    }

    $scope.getTotal = function(products, type){
        var total = 0;
        if(angular.isDefined(products) && products.length > 0){
            angular.forEach(products, function(product){
                var qty = product.qty;
                // angular.forEach(product.product.stocks, function(stock){
                //     qty += stock.qty;
                // });

                if(type == 'point'){
                    total += Number(product.product.point_price)*qty;
                }else{
                    total += Number(product.product.unit_price)*qty;
                }

            });
        }
        if($scope.order.mix && type ==='cash' && $scope.order.pointUse >0){
            // console.log($rootScope.pointRatio);
            total = total - $scope.order.pointUse/$rootScope.pointRatio;
            if(total < 0){
                total = 0;
            }
        }
        return total;
    };

    function validQty(products){
        var valid = false;
        angular.forEach(products, function(product){
            // angular.forEach(product.product.stocks, function(stock){
            //     if(parseInt(stock.qty) > 0){
            //         console.log(stock);
            //         valid = true;
            //     }
            // })
            if(parseInt(product.qty) > 0){
                // console.log(stock);
                valid = true;
            }
        });

        return valid;
    }

    //
    //show payment options
    //params: callbackArray Array
    //
    function showPayMethod(callbackArray){
        if($scope.hideSheet){
          return;
        };
        // Show the action sheet
       $scope.hideSheet = $ionicActionSheet.show({
         buttons: [
          //  { text: '<b>Paypal</b>' },
           { text: '<b>Credit Card</b>' }
         ],
        //  destructiveText: 'Delete',
         titleText: 'Choose Your Payment Method',
         cancelText: 'Cancel',
         cancel: function() {
           callbackArray[0]();
           $scope.hideSheet = false;
              // add cancel code..
            },
         buttonClicked: function(index) {
           console.log(index);
           callbackArray[index+1]();
           $scope.hideSheet = false;
           return true;
         }
       });

       // For example's sake, hide the sheet after two seconds
      //  $timeout(function() {
      //    hideSheet();
      //  }, 2000);
    }

    $scope.confirmOrder = function(products, comments) {
      // $scope.isPressed = true;
        $ionicLoading.show();
        if($scope.orderType === 1){
          angular.forEach($scope.listing.products, function(prob){
            prob.qty = 1;
          });
        }

        if(!validQty(products)){
            var options = {
                title:"Notice",
                cssClass:'thx-msg',
                tpl:"No Quantity Selected.",
                okText:'OK',
                okType: 'button-blue',
                callBack: function(){}
            }

            $rootScope.createAlertPopup(options);
            $ionicLoading.hide();
            // $scope.isPressed = false;
            return;
        }


        var tpl = "Please confirm your order.";
        if($scope.order.show === 'cash'){
            tpl = "Please confirm your order.";
        }

        var options = {
          title: '',
          cssClass: 'item-confirm',
          tpl: tpl,
          successCallBack:function(){
            var data = {
                type: $scope.order.mix?'mix':$scope.order.show,
                order: JSON.stringify(products),
                total: JSON.stringify({
                    point:$scope.order.mix?(angular.isDefined($scope.order.pointUse)?$scope.order.pointUse:0):($scope.order.show == 'point'?$scope.getTotal($scope.listing.products, 'point'):0),
                    cash:$scope.order.show == 'cash'?$scope.getTotal($scope.listing.products, 'cash'):0,
                }),
                // order: products,
                // total: {
                //     point:$scope.order.mix?(angular.isDefined($scope.order.pointUse)?$scope.order.pointUse:0):($scope.order.show == 'point'?$scope.getTotal($scope.listing.products, 'point'):0),
                //     cash:$scope.order.show == 'cash'?$scope.getTotal($scope.listing.products, 'cash'):0,
                // },
                listing_id:$scope.listing.id,
                // comments:comments
            };

            console.log(data);
            createOrder(data);
          },
          failCallBack:function(){
            console.log('You are not sure');
          },
        };

        // $rootScope.createConfirmPop(options);

        var data = {
            type: $scope.order.mix?'mix':$scope.order.show,
            order: JSON.stringify(products),
            total: JSON.stringify({
                point:$scope.order.mix?(angular.isDefined($scope.order.pointUse)?$scope.order.pointUse:0):($scope.order.show == 'point'?$scope.getTotal($scope.listing.products, 'point'):0),
                cash:$scope.order.show == 'cash'?$scope.getTotal($scope.listing.products, 'cash'):0,
            }),
            listing_id:$scope.listing.id,
            // comments:comments
        };

        console.log(data);

        if($scope.orderType != 1){
          createOrder(data);
        }else{
          createGCOrder($scope.listing, $scope.refer);
        }


        // var confirmPopup = $ionicPopup.confirm({
        //     title: '',
        //     cssClass: 'item-confirm',
        //     template: tpl,
        //     cancelText: 'Cancel', // String (default: 'Cancel'). The text of the Cancel button.
        //     cancelType: '', // String (default: 'button-default'). The type of the Cancel button.
        //     okText: 'Ok', // String (default: 'OK'). The text of the OK button.
        //     okType: 'button-blue', // String (default: 'button-positive'). The type of the OK button.
        // });
        //
        // confirmPopup.then(function(res) {
        //     if(res) {
        //         var data = {
        //             type: $scope.order.mix?'mix':$scope.order.show,
        //             order: JSON.stringify(products),
        //             total: JSON.stringify({
        //                 point:$scope.order.mix?(angular.isDefined($scope.order.pointUse)?$scope.order.pointUse:0):($scope.order.show == 'point'?$scope.getTotal($scope.listing.products, 'point'):0),
        //                 cash:$scope.order.show == 'cash'?$scope.getTotal($scope.listing.products, 'cash'):0,
        //             }),
        //             listing_id:$scope.listing.id,
        //         };
        //
        //         console.log(data);
        //         createOrder(data);
        //         // redeemItem(item);
        //     } else {
        //         console.log('You are not sure');
        //     }
        // });
    };

    function createOrder(data){
            // $scope.isPressed = false;
            var msg = {};
            // console.log(data);
            Payment.createOrder(data).then(function(s){
                console.log(s);
                //redeem
                if($scope.order.show == 'point'){
                    $scope.$broadcast('ConfirmOrder', {token:s.token, paypal_id:s.id});
                    $ionicLoading.hide();
                }
                //cash/mix
                if($scope.order.show === 'cash'){
                    var totalPrice = $scope.getTotal($scope.listing.products, 'cash');
                    if(Number(totalPrice) <= 0){
                        $scope.$broadcast('ConfirmOrder', {token:s.token, paypal_id:s.id});
                        return;
                    }

                    //payment method callbacks
                    // var callbackArray = [function(){
                    //   $scope.$broadcast('CancelOrder', {token:s.token, paypal_id:''});
                    // }, function(){
                    //
                    //
                    //   payByCc(s.token);
                    // }];
                    // showPayMethod(callbackArray);


                    console.log(s.token);

                    var callbackArray = [function(){
                      $scope.$broadcast('CancelOrder', {token:s.token, paypal_id:''});
                    }, function(){
                      payByCc(JSON.parse(s.total).cash, s.token);
                    }];
                    showPayMethod(callbackArray);
                    $ionicLoading.hide();

                    // Payment.NABFingerPrint(s.token).then(function(r){
                    //   console.log(r.data);
                    //
                    //   var callbackArray = [function(){
                    //     $scope.$broadcast('CancelOrder', {token:s.token, paypal_id:''});
                    //   }, function(){
                    //     payByCc(r.data, s.token);
                    //   }];
                    //   showPayMethod(callbackArray);
                    //
                    // }, function(e){
                    //   console.log(e);
                    //   var options = {
                    //     title: "sorry",
                    //     cssClass: 'thx-msg',
                    //     tpl: "Oops! Something went wrong, please try again.",
                    //     okText: 'OK',
                    //     okType: '',
                    //     callBack: function () {
                    //     }
                    //   }
                    //   $rootScope.createAlertPopup(options);
                    // });
                }

            },function(e){
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
                $ionicLoading.hide();
            });


    };

    function createGCOrder(listing, refer){

      Payment.createGCOrder(listing, refer).then(function(s){
        console.log(s);
        //redeem
        if($scope.order.show == 'point'){
            $scope.$broadcast('ConfirmOrder', {token:s.token, paypal_id:s.id});
        }
        //cash/mix
        if($scope.order.show === 'cash'){
            var totalPrice = $scope.getTotal($scope.listing.products, 'cash');
            if(Number(totalPrice) <= 0){
                $scope.$broadcast('ConfirmOrder', {token:s.token, paypal_id:s.id});
                return;
            }
            console.log(s.token);
            var callbackArray = [function(){
              $scope.$broadcast('CancelOrder', {token:s.token, paypal_id:''});
            }, function(){
              payByCc(s.total, s.token);
            }];
            showPayMethod(callbackArray);


            // Payment.NABFingerPrint(s.token).then(function(r){
            //   console.log(r.data);
            //
            //   var callbackArray = [function(){
            //     $scope.$broadcast('CancelOrder', {token:s.token, paypal_id:''});
            //   }, function(){
            //     payByCc(r.data, s.token);
            //   }];
            //   showPayMethod(callbackArray);
            //
            // }, function(e){
            //   console.log(e);
            //   var options = {
            //     title: "sorry",
            //     cssClass: 'thx-msg',
            //     tpl: "Oops! Something went wrong, please try again.",
            //     okText: 'OK',
            //     okType: '',
            //     callBack: function () {
            //     }
            //   }
            //   $rootScope.createAlertPopup(options);
            // });
        }
        $ionicLoading.hide();
      }, function(e){
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
        $ionicLoading.hide();
      });
    };

    //
    //show credit card form
    //params: order_token String
    //
    var payByCc = function(payment_info, order_token){
      // console.log(order_token);
      $scope.payment_info = payment_info;
      $scope.card = {};
      $scope.cardError = {};
      $scope.cardType = ['Visa', 'MasterCard', 'American Express'];
    //   $scope.$watch('card', function(newVal, oldVal) {
    //
    // }, true);
      var options = {
        title: 'Your Credit card Details',
        cssClass: 'cc-popoup-dark',
        subTitle: '', // String (optional). The sub-title of the popup.
        templateUrl: 'templates/credit-card-popover.html', // String (optional). The URL of an html template to place in the popup   body.
        scope: $scope, // Scope (optional). A scope to link to the popup content.
        buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
          text: 'Cancel',
          type: 'button-full button-color-grey',
          onTap: function(e) {
            $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
          }
        }, {
          text: 'OK',
          type: 'button-full button-color-dark',
          // attr: 'ng-disabled="paymentForm.card_number.$ccType == \'American Express\'"',
          onTap: function(e) {
            $ionicLoading.show();

            if(!$scope.card.use_saved_card){
              $scope.cardError = {
                isName:angular.isUndefined($scope.card.cardholder_name) && $scope.card.cardholder_name.length>=4,
                isNum:angular.isUndefined($scope.card.card_number),
                isCvn:angular.isUndefined($scope.card.cvn),
                isExp:angular.isUndefined($scope.card.exp),
                // isMon:angular.isUndefined($scope.card.expiry_month),
                // isYear:angular.isUndefined($scope.card.expiry_year),
              }
              if($scope.cardError.isName || $scope.cardError.isNum || $scope.cardError.isCvn || $scope.cardError.isExp){
                console.log($scope.cardError);
                $ionicLoading.hide()
                var options = {
                  title: "Error",
                  cssClass: 'thx-msg',
                  tpl: "Please Check Your Credit Card Details.",
                  okText: 'OK',
                  okType: 'button-magenta',
                  callBack: function () {}
                }
                $rootScope.createAlertPopup(options);
                e.preventDefault();
              }
              else{
                $scope.card.expiry_month = moment($scope.card.exp).format('MM');
                $scope.card.expiry_year = moment($scope.card.exp).format('YYYY');
                console.log('cc', $scope.card);
                $ionicLoading.show();
                  //Stripe
                  Stripe.init().then(function(s){
                    console.log(s);
                    Stripe.createCardToken($scope.card).then(function(stripe_token){
                      console.log(stripe_token);
                      Stripe.sendToken(order_token,stripe_token, $scope.card).then(function(s){
                        console.log(s);
                        $rootScope.$broadcast('UserInit', {});
                        var options = {
                          title: "Thank you for purchasing",
                          cssClass: 'thx-msg',
                          tpl: "Payment successful, Your order is being processed",
                          okText: 'OK',
                          okType: 'button-magenta',
                          callBack: function () {}
                        }

                        if(angular.isDefined(s.data.reward) && parseInt(s.data.reward) > 0){
                            $rootScope.$broadcast('RewardPoint', {point:parseInt(s.data.reward)});
                        }
                        Members.getMember().then(function(member){
                            $rootScope.member = member.data.data;
                            $scope.OrderModal.closeModal();
                        });

                        $rootScope.createAlertPopup(options);
                        $ionicLoading.hide();

                      },function(e){
                        var options = {
                            title:"Oops! Something went wrong, please try again.",
                            cssClass:'thx-msg',
                            tpl:e.data.message,
                            okText:'OK',
                            okType: 'button-blue',
                            callBack: function(){}
                          }
                          // $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
                          $rootScope.createAlertPopup(options);
                          $ionicLoading.hide();
                      });
                    },function(e){
                      console.log(e);
                      var options = {
                          title:"Oops! Something went wrong, please try again.",
                          cssClass:'thx-msg',
                          tpl:e,
                          okText:'OK',
                          okType: 'button-blue',
                          callBack: function(){}
                        }
                        // $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
                        $rootScope.createAlertPopup(options);
                        $ionicLoading.hide();
                    });
                  }, function(e){
                    var options = {
                        title:"Oops! Something went wrong, please try again.",
                        cssClass:'thx-msg',
                        tpl:e.data.message,
                        okText:'OK',
                        okType: 'button-blue',
                        callBack: function(){}
                      }
                      // $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
                      $rootScope.createAlertPopup(options);
                      $ionicLoading.hide();
                  });

                }









              // Payment.NABDirectPay($scope.card, payment_info).then(function(s){
              //   var data = JSON.parse(s.data);
              //   $ionicLoading.hide();
              //
              //     if(s.status == 200){
              //       $rootScope.$broadcast('UserInit', {});
              //       var options = {
              //         title: "Thank you for purchasing",
              //         cssClass: 'thx-msg',
              //         tpl: "Payment successful, Your order is being processed",
              //         okText: 'OK',
              //         okType: 'button-magenta',
              //         callBack: function () {}
              //       }
              //
              //       if(angular.isDefined(data.reward) && parseInt(data.reward) > 0){
              //           $rootScope.$broadcast('RewardPoint', {point:parseInt(data.reward)});
              //       }
              //       Members.getMember().then(function(member){
              //           $rootScope.member = member.data.data;
              //           $scope.OrderModal.closeModal();
              //       });
              //
              //       $rootScope.createAlertPopup(options);
              //     }
              //     else{
              //       var options = {
              //           title:"Oops! Something went wrong, please try again.",
              //           cssClass:'thx-msg',
              //           tpl:data.message,
              //           okText:'OK',
              //           okType: 'button-blue',
              //           callBack: function(){}
              //         }
              //         $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
              //         $rootScope.createAlertPopup(options);
              //   }
              //
              //
              //
              //
              // }, function(e){
              //   console.log(e);
              //   var options = {
              //       title:"Oops! Something went wrong, please try again.",
              //       cssClass:'thx-msg',
              //       tpl:e.message,
              //       okText:'OK',
              //       okType: 'button-blue',
              //       callBack: function(){
              //
              //       }
              //   }
              //
              //   $rootScope.createAlertPopup(options);
              //   $ionicLoading.hide();
              // });

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

            if($scope.card.use_saved_card){
              console.log($scope.ccSelected);
              // $ionicLoading.show();
              Stripe.sendToken(order_token,$scope.ccSelected, $scope.card).then(function(s){
                console.log(s);
                $rootScope.$broadcast('UserInit', {});
                var options = {
                  title: "Thank you for purchasing",
                  cssClass: 'thx-msg',
                  tpl: "Payment successful, Your order is being processed",
                  okText: 'OK',
                  okType: 'button-magenta',
                  callBack: function () {}
                }

                if(angular.isDefined(s.data.reward) && parseInt(s.data.reward) > 0){
                    $rootScope.$broadcast('RewardPoint', {point:parseInt(s.data.reward)});
                }
                Members.getMember().then(function(member){
                    $rootScope.member = member.data.data;
                    $scope.OrderModal.closeModal();
                });

                $rootScope.createAlertPopup(options);
                $ionicLoading.hide();

              },function(e){
                var options = {
                    title:"Oops! Something went wrong, please try again.",
                    cssClass:'thx-msg',
                    tpl:e.data.message,
                    okText:'OK',
                    okType: 'button-blue',
                    callBack: function(){}
                  }
                  // $scope.$broadcast('CancelOrder', {token:order_token, paypal_id:''});
                  $rootScope.createAlertPopup(options);
                  $ionicLoading.hide();
              });
            }

          }
        }]
      }

      $ionicLoading.show();
      Stripe.getCustInfo().then(function(s){
        console.log(s);
        $scope.card.save_card = false;

        if(s.customer != null){
          $scope.creditCards = s.customer.sources.data;
          $scope.ccSelected = $scope.creditCards[0];
          $scope.card.use_saved_card = true;
        }else{
          $scope.card.use_saved_card = false;
        }

      }, function(e){
        console.log(e);
        $scope.card.save_card = false;
        $scope.card.use_saved_card = false;
      }).finally(function(){
        $ionicLoading.hide();
        popup = $ionicPopup.show(options);
      });

    };

    $scope.useSavedCard = function(card){
      console.log(card.use_saved_card);
      card.use_saved_card = !card.use_saved_card;
      card.save_card = false;
    }

    $scope.changeccSelected = function(card){
      $scope.ccSelected = card;
      console.log($scope.ccSelected);
    }

    // $scope.ccSelected = function(id){
    //   var card = {};
    //   if($scope.creditCards.length > 0){
    //     card = $scope.creditCards.filter(function(c){
    //       return c.id == id;
    //     })[0];
    //   }
    //   return card;
    // }

    function pay(totalPrice, orderNO, newOrderToken){
        // if(Number(totalPrice) <= 0){
        //     $scope.$broadcast('ConfirmOrder', {token:newOrderToken, paypal_id:'X-'+orderNO});
        //     return;
        // }
        PaypalService.initPaymentUI().then(function () {
            PaypalService.makePayment(totalPrice, orderNO).then(function(s){
                console.log(s);
                $scope.$broadcast('ConfirmOrder', {token:newOrderToken, paypal_id:s.response.id});
            }, function(e){
                console.log(e);
                $scope.$broadcast('CancelOrder', {token:newOrderToken, paypal_id:''});
            })
        }, function(error){
            console.log(error);
            $scope.$broadcast('CancelOrder', {token:newOrderToken, paypal_id:''});
        });
    }

    $scope.$on('ConfirmOrder', function(e, d){
        console.log(d);
        $ionicLoading.show();
        Payment.orderConfirm(d.token, 'confirmed', d.paypal_id).then(function(s){
          $ionicLoading.hide();
            var options = {
                title:"Thank you for purchasing "+$scope.listing.name+"!",
                cssClass:'thx-msg',
                tpl:"Your order is being processed",
                okText:'OK',
                okType: 'button-blue',
                callBack: function(){
                    if(parseInt(s.data.reward) > 0){
                        $rootScope.$broadcast('RewardPoint', {point:parseInt(s.data.reward)});
                    }
                    Members.getMember().then(function(member){
                        $rootScope.member = member.data.data;
                        $scope.OrderModal.closeModal();
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

  // $timeout(function(){$scope.listing = OrderModal.listing();});
});
