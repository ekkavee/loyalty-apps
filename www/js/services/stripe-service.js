angular.module('app.services')

.service('Stripe', function($q, $http, API_URI, APP_KEY, PaypalService, AuthService, moment){
  var vm = this;

  function loadConfig(){
    var d = $q.defer();

    var url = API_URI+"member/stripeKey?token="+AuthService.authToken();
    var data = {
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
    };
    $http.get(url, {params:data}).then(function(s){
      // console.log(s);
      d.resolve(s.data.data);
    }, function(e){
      d.reject(e);
    });

    return d.promise;
  }

  vm.init = function(public_key){
    var d = $q.defer();
    loadConfig().then(
      function(s){
        // console.log('public_key', s.api);
        return s;
      }
    ).then(function(s){
      console.log('public_key', s.key);
      cordova.plugins.stripe.setPublishableKey(s.key, function(s){
        d.resolve('initial success!');
      }, function(e){
        d.reject(e);
      });
    });
    // cordova.plugins.stripe.setPublishableKey(public_key, function(s){
    //   d.resolve('initial success!');
    // }, function(e){
    //   d.reject(e);
    // });

    return d.promise;
  };


  vm.createCardToken = function(card_info){
    var d = $q.defer();
    var card = {
      number: card_info.card_number, // 16-digit credit card number
      expMonth: Number(card_info.expiry_month), // expiry month
      expYear: Number(card_info.expiry_year), // expiry year
      cvc: card_info.cvn, // CVC / CCV
      name: card_info.cardholder_name, // card holder name (optional)
      currency: 'AUD' // Three-letter ISO currency code (optional)
    };

    cordova.plugins.stripe.createCardToken(card,function(token){
      console.log(token);
      d.resolve(token);
    }, function(e){
      d.reject(e);
    });

    return d.promise;
  };

  vm.getCustInfo = function(){
    var d = $q.defer();
    var url = API_URI+"member/stripeInfo?token="+AuthService.authToken();
    var data = {
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
    };

    $http.get(url, {params:data}).then(function(s){
      d.resolve(s.data.data);
    }, function(e){
      d.reject(e);
    });

    return d.promise;
  };


  vm.sendToken = function(token, stripe_token, card){
    var d = $q.defer();
    var url = API_URI+"member/stripe?token="+AuthService.authToken();
    var data = {
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
      stripe_token:stripe_token.id,
      order_token:token,
      use_saved_card:card.use_saved_card,
      save_card:card.save_card
    };
    $http.post(url, data).then(function(s){
      d.resolve(s);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  };

});
