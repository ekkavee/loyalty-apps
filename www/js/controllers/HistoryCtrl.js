angular.module('starter.controllers')
.controller('HistoryCtrl', function($scope, $rootScope, Transactions, $ionicPopup, $timeout, $ionicHistory, $state, PaypalService, Members, Order){
  $scope.orders = [];
  $scope.filter = {};

  $scope.getOrders = function(){
    Transactions.getTransactions().then(function(s){
          console.log(s);
      $scope.orders = s;
        },function(e){
      console.log(e);});
  };

  $scope.formatDate = function(time){
    return moment.utc(time).format("DD/MM/YYYY HH:mm:ss");

  }

  $scope.getItemTotal = function(item, orderType){
    if(orderType == 'cash' || orderType == 'mix'){
      return Number(item.unit_price)*Number(item.qty);
    }else{
      return parseInt(item.point_price)*Number(item.qty);
    }
  };

  $scope.getOrders();

  $scope.back = function(){
    $state.go('menu.account');
    // console.log($ionicHistory);
    //   $timeout(function(){
    //     $ionicHistory.goBack();
    //   });
  };


  $scope.payOrder = function(order){
    console.log(order);
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm Your Order',
      cssClass: 'item-confirm',
      template: "<p class='text-center'>Are you sure to confirm this order?</p>",
      cancelText: 'Cancel', // String (default: 'Cancel'). The text of the Cancel button.
      cancelType: '', // String (default: 'button-default'). The type of the Cancel button.
      okText: 'Ok', // String (default: 'OK'). The text of the OK button.
      okType: 'button-magenta', // String (default: 'button-positive'). The type of the OK button.
    });

    confirmPopup.then(function(res) {
      if(res){
        if(order.type == 'cash'){
          //cash Order
          var newOrderToken = order.token;
          //process payment on paypal
          pay(order.total_price, order.id, newOrderToken);
        }

        // if(order.type == 'point'){
        //   //redeem order
        //
        //   $scope.$broadcast('ConfirmOrder', {token:order.token});
        //
        // }
      }else{
        console.log('You are not sure');
      }
    });
  };

  function pay(totalPrice, orderNO, newOrderToken){
    PaypalService.initPaymentUI().then(function () {
      PaypalService.makePayment(totalPrice, orderNO).then(function(s){
        console.log(s);
        $scope.$broadcast('ConfirmOrder', {token:newOrderToken});
      }, function(e){
        console.log(e);
      })
    }, function(error){
      console.log(error);
    });
  }

  //fire order confirmation callback
  $scope.$on('ConfirmOrder', function(e, data){
    Order.confirmOrder(data.token, 'confirmed').then(function(s){
      console.log(s);
      //thank you msg
      var title = "Thanks for your purchasing!";
      var tpl = "<p class='text-center'>The voucher(s) will be issued</p>";

      var alertPopup = $ionicPopup.alert({
        title: title,
        cssClass: 'thx-msg', // String, The custom CSS class name
        template: tpl,
        okText: 'OK',// String (default: 'OK'). The text of the OK button.
        okType: 'button-magenta',// String (default: 'button-positive'). The type of the OK button.
      });

      alertPopup.then(function(res) {
        Members.getMember().then(function(member){
          $rootScope.member = member.data.data;
          $scope.getOrders();
          alert('here');
        });
      });

    }, function(e){
      console.log(e);
      //error msg
      var title = "Error";
      var tpl = "<p class='text-center'>Please check you internet connection or contact us!</p>" + e.data.message;

      var alertPopup = $ionicPopup.alert({
        title: title,
        cssClass: 'thx-msg', // String, The custom CSS class name
        template: tpl,
        okText: 'OK',// String (default: 'OK'). The text of the OK button.
        okType: 'button-magenta',// String (default: 'button-positive'). The type of the OK button.
      });

      alertPopup.then(function(res) {
        return;
      });
    });
  });
})
