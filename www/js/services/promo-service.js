angular.module('app.services')

.service('PromoService', function($q, $http, API_URI, APP_KEY, AuthService){
  var getPromo = function(){
    var d = $q.defer();
    var url = API_URI+'member/promotions';
    var data = {
      token:AuthService.authToken(),
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    }
    $http.get(url, {params:data}).then(function(s){
      // console.log(s.data.data);
      d.resolve(s.data.data);
    },function(e){
      // console.log(e);
      d.reject(e);
    });

    return d.promise;
  };

  var claimPromo = function(listing){
    var d = $q.defer();
    var url = API_URI+'member/claimPromotion?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
      promotion_data:JSON.stringify([listing])
    }
    $http.post(url, data).then(function(s){
      console.log(s);
      d.resolve(s.data);
    },function(e){
      console.log(e);
      d.reject(e);
    });

    return d.promise;
  }

  return{
    getPromo:getPromo,
    claimPromo:claimPromo
  }
});
