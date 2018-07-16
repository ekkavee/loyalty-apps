angular.module('app.services')

.service('Survey', function($q, $http, API_URI, APP_KEY, AuthService, $timeout){

  var get = function(){
    var d = $q.defer();
    var url = API_URI+'member/survey?token='+AuthService.authToken();
    var data = {
      params:{
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
    }};
    $http.get(url, data).then(function(s){
      console.log(s.data.data);
      d.resolve(s.data.data);
    }, function(e){
      d.reject(e);
    });

    return d.promise;
  }

  var getById = function(id){
    var d = $q.defer();
    var url = API_URI+'member/survey/'+id;
    var data = {
      params:{
        token: AuthService.authToken(),
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
    }};
    $http.get(url, data).then(function(s){
      console.log(s.data.data);
      d.resolve(s.data.data);
    }, function(e){
      d.reject(e);
    });

    return d.promise;
  }

  var submit = function(survey){
    var d = $q.defer();
    var url = API_URI+'member/survey?token='+AuthService.authToken();
    var data = {
      survey:survey,
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
    }
    $http.post(url, data).then(function(s){
      d.resolve(s.data);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  }

  return{
    get:get,
    getById:getById,
    submit:submit
  }

})
