angular.module('app.services')

.service('Listings', function($q, $http, API_URI, APP_KEY, AuthService, $ionicLoading, $timeout){

  var getListings = function(id){
    var d = $q.defer();
    var url = API_URI+'member/listing';
    var data = {
      params:{
        token:AuthService.authToken(),
        app_token:APP_KEY.app_token,
        app_secret:APP_KEY.app_secret,
        display_id:id,
      }};
    $http.get(url, data).then(function(s){
      console.log(s.data.data);
      s.data.data.forEach(function(listing){
        listing.listing.payload = JSON.parse(listing.listing.payload);
      });
      d.resolve(s.data.data);
    },function(e){
      console.log(e);
      d.reject(e);
    });
    return d.promise;
  };

  var getRawListings = function(type_id){
    var d = $q.defer();
    var url = API_URI+'member/rawListing';
    var data = {
      params:{
        token:AuthService.authToken(),
        app_token:APP_KEY.app_token,
        app_secret:APP_KEY.app_secret,
        type_id:type_id,
      }};
    $http.get(url, data).then(function(s){
      console.log(s.data.data);
      d.resolve(s.data.data);
    },function(e){
      console.log(e);
      d.reject(e);
    });
    return d.promise;
  };

  var getListingTypes = function(){
    var d = $q.defer();
    var url = API_URI+'member/listingType';
    var data = {
      params:{
        token:AuthService.authToken(),
        app_token:APP_KEY.app_token,
        app_secret:APP_KEY.app_secret,
      }};
    $http.get(url, data).then(function(s){
      console.log(s.data.data);
      d.resolve(s.data.data);
    },function(e){
      console.log(e);
      d.reject(e);
    });
    return d.promise;
  };

  var getListingById = function(id){
    var d = $q.defer();
    var url = API_URI+'member/listing/'+id;
    var data = {
      params: {
        token: AuthService.authToken(),
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
    };
    $ionicLoading.show().then(function(){
      $http.get(url, data).then(function(s){
        console.log(s.data.data);
        s.data.data.payload = JSON.parse(s.data.data.payload);
        d.resolve(s.data.data);
        $timeout(function(){$ionicLoading.hide();}, 1500);
      },function(e){
        console.log(e);
        d.reject(e);
        $ionicLoading.hide();
      });
    });

    return d.promise;
  };


  return{
    getListings:getListings,
    getListingTypes:getListingTypes,
    getListingById:getListingById,
    getRawListings:getRawListings,

  }
});
