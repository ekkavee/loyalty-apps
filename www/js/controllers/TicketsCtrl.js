angular.module('starter.controllers')

.controller('TicketsCtrl', function($scope, $ionicHistory, $timeout, $ionicLoading, $rootScope, $http, API_URI, APP_KEY, AuthService, $ionicModal){
  $scope.tickets = [];

  $scope.init = function(){
    $ionicLoading.show();
    var url = API_URI+'member/userTickets?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    }
    $http.get(url, {params:data}).then(function(s){
      console.log(s.data.data);
      $scope.tickets = s.data.data;
    },function(e){
      console.log(e);
      // $scope.listings = [];
    }).finally(function () {
        $timeout(function(){
          $ionicLoading.hide();
        }, 1000);
        // $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
    });
  }

  

  $scope.init();

  // $scope.tickets = [
  //   {
  //     id:1,
  //     order_detail:{product_name:'Ticket 1', status:'successful'},
  //     expire_date:'2018-10-21',
  //     img:'http://via.placeholder.com/150x150'
  //   },
  //   {
  //     id:2,
  //     order_detail:{product_name:'Ticket 2', status:'successful'},
  //     expire_date:'2018-10-21',
  //     img:'http://via.placeholder.com/150x150'
  //   }
  // ];


  $scope.btnRows = function(col){
        if($scope.tickets.length <= 0){
            return 0;
        }
        return Math.ceil($scope.tickets.length/col);
  };

  $scope.barcodeOptions = {
    width: 2,
    height: 100,
    quite: 10,
    displayValue: true,
    font: "monospace",
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "",
    lineColor: "#000"
  };

  $scope.back = function(){
    console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });
  };

  $scope.expTime = function(time){
    if(time != '' && time != null){
      return moment(time).format('DD/MM/YY');
    }else{
      // console.log(moment());
      return moment().add(30, 'days').format('DD/MM/YY');
    }
  };


  $scope.showVoucher = function(id){
    console.log(id);
    $scope.currentVoucher = {};

    // angular.forEach($scope.vouchers, function(voucher){
    //   if(voucher.id == index){
    //     $scope.currentVoucher = voucher;
    //   }
    // });

    // $scope.currentVoucher = $scope.vouchers[index];

    $scope.currentVoucher = $scope.tickets.filter(function(v){
      return v.id == id;
    })[0];
    // alert(JSON.stringify($scope.currentVoucher));
    if(!$scope.currentVoucher.barcode){
      return;
    }

    // console.log($scope.currentVoucher);

    // $ionicModal.fromTemplateUrl('templates/voucher-modal.html', {
    $scope.voucherModal = $ionicModal.fromTemplate(`
      <ion-modal-view style="background-color: #1D1D1D; z-index: 999 !important;">
          <ion-header-bar class="bar-color-1" align-title="center">
              <h1 class="title title-center header-item"></h1>
              <ion-header-buttons side="left">
                  <button class="button button-icon button-white ion-ios-arrow-back" ng-click="voucherModal.hide()"></button>
              </ion-header-buttons>
          </ion-header-bar>
          <div class="bar bar-subheader">
            <h2 class="title">Ticket detail</h2>
          </div>

          <ion-content class="main-content has-subheader" style="padding:15px;">
              <div class="voucher-container">
                  <h2 style="color:#fff; text-align:center;">{{currentVoucher.order_detail.product_name || currentVoucher.claim_promotion.product.name}}</h2>
                  <barcode class="voucher-barcode" ng-if="currentVoucher.barcode" type="ean" render="img" string="{{currentVoucher.barcode}}" options="barcodeOptions"></barcode>
                  <div class="text-center voucher-info">
                    <p style="color:#fff;" ng-if="currentVoucher.reservation_date">Issue Date: {{expTime(currentVoucher.reservation_date)}}</p>
                    <p style="color:#fff;" ng-if="currentVoucher.expire_date">Expire Date: {{expTime(currentVoucher.expire_date)}}</p>
                  </div>
              </div>
          </ion-content>
      </ion-modal-view>
      `, {
        scope: $scope,
        animation: 'slide-in-up'
      });

      console.log($scope.voucherModal);
      $scope.voucherModal.show();


  };

  $scope.$on('$destroy', function() {
    if(angular.isDefined($scope.voucherModal)){
      console.log('$destroy');
      $scope.voucherModal.remove();
    }
  });

});
