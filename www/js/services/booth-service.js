angular.module('app.services')

.service('BoothService', function($q, $http, API_URI, APP_KEY, AuthService){
  var getBooths = function(){
    var d = $q.defer();
    var url = API_URI+'member/retrieveBooths';
    var data = {
      token:AuthService.authToken(),
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    }
    $http.get(url, {params:data}).then(function(s){
      // console.log(s);
      d.resolve(s.data.data);
    },function(e){
      d.reject(e);
    });

    return d.promise;
  };


  var getLocations = function(){
      var d = $q.defer();
      var url = API_URI+'member/location';
      var data = {
        token:AuthService.authToken(),
        app_token:APP_KEY.app_token,
        app_secret:APP_KEY.app_secret,
      }
      $http.get(url, {params:data}).then(function(s){
        // console.log(s);
        d.resolve(s.data.data);
      },function(e){
        d.reject(e);
      });

      return d.promise;
  }

  var searchSlot = function(search){
    var d = $q.defer();
    var url = API_URI+'member/checkReservationSlot?token='+AuthService.authToken();
    var data = {
      // token:AuthService.authToken(),
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
      booth_listing_id:search.booth_listing_id,
      reservation_date:moment(search.date).tz('Australia/Melbourne').format('DD-MM-YYYY'),
      number_of_people:search.ppl,
      space_id:angular.isDefined(search.location)?search.location.id:''

      // occassion:search.occassion
    }
    $http.post(url, data).then(function(s){
      console.log(s);
      d.resolve(s.data);
    },function(e){
      d.reject(e);
    });

    return d.promise;
  };

  var makeReservation = function(listing, book){
    var d = $q.defer();
    var url = API_URI+'member/makeReservation?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
      reservation_date:moment(book.date).tz('Australia/Melbourne').format('DD-MM-YYYY'),
      reservation_data:JSON.stringify([listing]),
      number_of_people:book.ppl,
      reservation_id:book.reservation_id,
      occassion:book.occassion,
      order_type:book.order_type,
      comments:book.comments
    }
    $http.post(url, data).then(function(s){
      // console.log(s);
      d.resolve(s.data);
    },function(e){
      console.log(e);
      d.reject(e);
    });

    return d.promise;
  }

  var makeFunEnquiry = function(enquiry){
    var d = $q.defer();
    var url = API_URI+'member/functionEnquire?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
      reservation_date:moment(enquiry.reservation_date).tz('Australia/Melbourne').format('DD-MM-YYYY'),
      comment:enquiry.comment,
      listing_id:enquiry.listing_id,
      budget:enquiry.budget,
      // reservation_data:JSON.stringify([listing]),
      number_of_people:enquiry.number_of_people,
      // occassion:book.occassion,
    }
    $http.post(url, data).then(function(s){
      // console.log(s);
      d.resolve(s.data);
    },function(e){
      console.log(e);
      d.reject(e);
    });

    return d.promise;
  }

  return{
    getLocations:getLocations,
    searchSlot:searchSlot,
    makeReservation:makeReservation,
    getBooths:getBooths,
    makeFunEnquiry:makeFunEnquiry,
  }




});
