angular.module('starter.controllers')

.controller('CcModalCtrl', function($scope, $rootScope, creditCardService, $timeout, $ionicHistory, Members, Payment, $ionicLoading, $state){

  $timeout(function(){
    $scope.ccModal = creditCardService.creditCardModal();
    $scope.order_details = creditCardService.order_details();
    $scope.listing = creditCardService.order_details().listing;
    $scope.book = creditCardService.order_details().book;
    $scope.ccModalTitle = creditCardService.order_details().ccModalTitle;
    $scope.ccPayModel = creditCardService.order_details().ccPayModel;
    $scope.payment_info = creditCardService.order_details().payment_info;
    $scope.cardType = creditCardService.order_details().cardType;



    $scope.closeCcModal = function(){
      creditCardService.closeCCModal();
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
        return total;
    };

    $scope.submitCreditCard = function(card, payment_info){
      console.log(card);
      $ionicLoading.show();

      Payment.NABDirectPay(card, payment_info).then(function(s){
          var data = {};

          if(s.status == 200){
            try{
              data = JSON.parse(s.data);
              $rootScope.$broadcast('UserInit', {});
              var options = {
                title: $scope.order_details.successTitle,
                cssClass: 'thx-msg',
                tpl: $scope.order_details.successMsg,
                okText: 'OK',
                okType: 'button-magenta',
                callBack: function () {}
              };

              if(angular.isDefined(data.reward) && parseInt(data.reward) > 0){
                  $rootScope.$broadcast('RewardPoint', {point:parseInt(data.reward)});
              }
              $timeout(function(){
                Members.getMember().then(function(member){
                    $rootScope.member = member.data.data;
                    $scope.ccModal.hide();
                    // $rootScope.$broadcast('refreshBoothPage', {});
                    // $state.go('menu.booths', {}, {reload:'menu.booths'});
                    $timeout(function(){
                      $ionicHistory.goBack();
                    });
                });
              });
            }catch(e){
              var options = {
                  title:"Oops! Something went wrong, please try again.",
                  cssClass:'thx-msg',
                  tpl:s.data,
                  okText:'OK',
                  okType: 'button-blue',
                  callBack: function(){
                      // $scope.closeModal();
                  }
              }
            }

            $rootScope.createAlertPopup(options);
          }
          else{
            data = JSON.parse(s.data);
            var options = {
                title:"Oops! Something went wrong, please try again.",
                cssClass:'thx-msg',
                tpl:data.message,
                okText:'OK',
                okType: 'button-blue',
                callBack: function(){
                    // $scope.closeModal();
                }
            }

          $rootScope.createAlertPopup(options);
        }




      }, function(e){
        //fail to pay
        console.log(e);
        var options = {
            title:"Oops! Something went wrong, please try again.",
            cssClass:'thx-msg',
            tpl:e.message,
            okText:'OK',
            okType: 'button-blue',
            callBack: function(){}
        }

        $rootScope.createAlertPopup(options);
      }).finally(function(){
        $ionicLoading.hide();
      });
    }


  });

});
