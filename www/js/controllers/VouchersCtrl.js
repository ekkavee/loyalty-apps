angular.module('starter.controllers')

.controller('VouchersCtrl', function($scope, $rootScope, $http, $ionicHistory, $timeout, $ionicModal, $ionicLoading, $state, API_URI, APP_KEY, AuthService, Voucher){
  $scope.listings = [];
  $scope.vouchers = []

  console.log($scope.listings);

  $scope.init = function(){
    $ionicLoading.show();
    Voucher.getVouchers().then(function(s){
      console.log(s);
      $scope.vouchers = s;
    }).finally(function(){
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });
    // var url = API_URI+'member/groupVoucher?token='+AuthService.authToken();
    // var data = {
    //   app_token:APP_KEY.app_token,
    //   app_secret:APP_KEY.app_secret,
    // }
    // $http.get(url, {params:data}).then(function(s){
    //   console.log(s.data.data);
    //   $scope.listings = s.data.data;
    // },function(e){
    //   console.log(e);
    //   $scope.listings = [];
    // }).finally(function () {
    //     $timeout(function(){
    //       $ionicLoading.hide();
    //     }, 1000);
    //     // $ionicLoading.hide();
    //     $scope.$broadcast('scroll.refreshComplete');
    // });

  };

  // $scope.vouchers = [
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

  $scope.init();

  $scope.expTime = function(time){
    if(time != '' && time != null){
      return moment(time).format('DD/MM/YY');
    }else{
      // console.log(moment());
      return moment().add(30, 'days').format('DD/MM/YY');
    }
  };

  $scope.btnRows = function(col){
        if($scope.vouchers.length <= 0){
            return 0;
        }
        return Math.ceil($scope.vouchers.length/col);
  };

  $scope.barcodeOptions = {
    width: 2,
    height: 100,
    quite: 10,
    displayValue: false,
    font: "monospace",
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "",
    lineColor: "#000"
  };


  $scope.openVouchers = function(listing){
    console.log(listing);
    if($scope.selectedList != listing){
      $scope.selectedList = listing;
    }else{
      $scope.selectedList = null;
    }
  }

  $scope.getVoucherDate = function(voucher_payload){
    // console.log($rootScope.decodeJSON(voucher_payload));
    var date = $rootScope.decodeJSON(voucher_payload).reservation_date.split("-");
    return date[2]+'-'+date[1]+'-'+date[0];
  }

  $scope.back = function(){
    $timeout(function(){
      $ionicHistory.goBack();
    });
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

    $scope.currentVoucher = $scope.vouchers.filter(function(v){
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
            <h2 class="title">Voucher detail</h2>
          </div>

          <ion-content class="main-content has-subheader" style="padding:15px;">
              <div class="voucher-container">
                  <h2 style="color:#fff; text-align:center;">{{currentVoucher.order_detail.product_name || currentVoucher.claim_promotion.product.name}}</h2>
                  <h3 style="color:#fff; text-align:center;">{{currentVoucher.claim_promotion.product.desc_short}}</h3>
                  <barcode class="voucher-barcode" ng-if="currentVoucher.barcode" type="ean" render="img" string="{{currentVoucher.barcode}}" options="barcodeOptions"></barcode>
                  <div class="text-center voucher-info">
                    <p style="color:#fff;" ng-if="currentVoucher.issue_date">Issue Date: {{expTime(currentVoucher.issue_date)}}</p>
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

  $timeout(function(){
    console.log('Voucher');
    window.ga.trackView('Voucher','', true);
  });

});
