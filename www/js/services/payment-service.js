angular.module('app.services')
.service('Payment', function($q, $http, API_URI, APP_KEY, PaypalService, AuthService, moment){

  var createOrder = function(data){
    var d = $q.defer();
    data.app_token = APP_KEY.app_token;
    data.app_secret = APP_KEY.app_secret;
    var url = API_URI+"member/placeOrder?token="+AuthService.authToken();
    $http.post(url, data).then(function(r){
      d.resolve(r.data);
    }, function(e){
      d.reject(e);
      // alert(e +' Please try again later!');
    });
    return d.promise;
  };

  var createGCOrder = function(listing, refer){
    var d = $q.defer();
    var url = API_URI+"member/purchaseGiftCertificate?token="+AuthService.authToken();
    var payload = {
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
      data:JSON.stringify(listing),
      full_name:refer.name,
      email:refer.email,
      note:refer.messege || ''
    };
    $http.post(url, payload).then(function(r){
      d.resolve(r.data);
    }, function(e){
      d.reject(e);
      // alert(e +' Please try again later!');
    });
    return d.promise;
  };

  var orderConfirm = function(order_token, option, paypal_id){
    var d = $q.defer();
    var url = API_URI+"member/orderConfirm?token="+AuthService.authToken();
    var data = {
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
      order_token:order_token,
      option:option,
      paypal_id:paypal_id,
    };
    $http.post(url, data).then(function(s){
      d.resolve(s);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  };

  //credit card payment
  var payway = function(order_token,single_use_token){
    var d = $q.defer();
    var url = API_URI+"member/payway?token="+AuthService.authToken();
    var data = {
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
      order_token:order_token,
      single_use_token: single_use_token
    };
    $http.post(url, data).then(function(s){
      d.resolve(s);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  }

  //nab direct post
  var NABFingerPrint = function(token){
    var d = $q.defer();
    var url = API_URI+'member/fingerprint?token='+AuthService.authToken();
    var data = {
      order_token:token,
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    };
    console.log(data);
    $http.post(url, data).then(function(s){
      d.resolve(s);
    },function(e){
      d.reject(e);
    });
    return d.promise;
  };

  var transformFormDate = function(obj) {
    var str = [];
    for(var p in obj)
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  }

  var NABDirectPay = function(card, payment_info){

    var d = $q.defer();
    // var settings = {
    //   "async": true,
    //   "crossDomain": true,
    //   "url": payment_info.url,
    //   "method": "POST",
    //   "contentType": 'application/x-www-form-urlencoded',
    //   "cache": false,
    //   "data": {
    //     "EPS_MERCHANT":payment_info.fingerprint.EPS_MERCHANT,
    //     "EPS_TXNTYPE": "0",
    //     "EPS_AMOUNT": payment_info.fingerprint.EPS_AMOUNT,
    //     "EPS_CALLBACKURL": API_URI+'member/transact',
    //     "EPS_RESULTURL": API_URI+'member/transact',
    //     "EPS_CARDNUMBER": card.card_number,
    //     "EPS_EXPIRYMONTH": card.expiry_month,
    //     "EPS_EXPIRYYEAR": card.expiry_year,
    //     "EPS_CCV": card.cvn,
    //     "EPS_TIMESTAMP": payment_info.fingerprint.EPS_TIMESTAMP,
    //     "EPS_FINGERPRINT": payment_info.fingerprint.EPS_FINGERPRINT,
    //     "EPS_REFERENCEID": payment_info.fingerprint.EPS_REFERENCEID,
    //     "EPS_REDIRECT": "TRUE",
    //   }
    // }
    //
    // console.log(settings);
    //
    // $.ajax(settings).done(function (response) {
    //   console.log(response);
    //   d.resolve(response);
    // }).fail(function(e){
    //   console.log(e);
    //   d.reject(e);
    // });

    var data = {
          "EPS_MERCHANT":payment_info.fingerprint.EPS_MERCHANT,
          "EPS_TXNTYPE": "0",
          "EPS_AMOUNT": payment_info.fingerprint.EPS_AMOUNT,
          "EPS_CALLBACKURL": API_URI+'member/transact',
          "EPS_RESULTURL": API_URI+'member/transact',
          "EPS_CARDNUMBER": card.card_number,
          "EPS_EXPIRYMONTH": card.expiry_month,
          "EPS_EXPIRYYEAR": card.expiry_year,
          "EPS_CCV": card.cvn,
          "EPS_TIMESTAMP": payment_info.fingerprint.EPS_TIMESTAMP,
          "EPS_FINGERPRINT": payment_info.fingerprint.EPS_FINGERPRINT,
          "EPS_REFERENCEID": payment_info.fingerprint.EPS_REFERENCEID,
          "EPS_REDIRECT": "TRUE",
    };

    console.log(data);


    var d = $q.defer();
    var url = payment_info.url;
    console.log(url);
    // cordova.plugin.http.setHeader('nab.com.au', 'Header', 'Content-Type:application/x-www-form-urlencoded');
    cordova.plugin.http.setDataSerializer('urlencoded');
    cordova.plugin.http.post(url, data, {transformRequest:transformFormDate}, function(s){
      console.log(s);
      d.resolve(s);
    }, function(e){
      console.log(e);
      d.reject(JSON.parse(e.data));
    });




    // $http.post(url, data, {header:headers, transformRequest:transformFormDate}).then(function(s){
    //   console.log(s);
    //   d.resolve(s);
    // },function(e){
    //   console.log(e);
    //   d.reject(e);
    // });
    return d.promise;


  }

  return{
    createOrder:createOrder,
    orderConfirm:orderConfirm,
    payway:payway,
    NABFingerPrint:NABFingerPrint,
    NABDirectPay,NABDirectPay,
    createGCOrder:createGCOrder
  }
});
