angular.module('app.services')

.service('MsgService', function(){
  var get = function(){
    if(window.localStorage.getItem('MSG') == null){
      return false;
    }
    return JSON.parse(window.localStorage.getItem('MSG'));
  };

  var put = function(msg){
    window.localStorage.setItem('MSG', JSON.stringify(msg));
  };

  var add = function(msg){
    var msgs = this.get();
    if(msgs){
      msgs.push(msg);
      window.localStorage.setItem('MSG', JSON.stringify(msgs));
    }
    else{
      window.localStorage.setItem('MSG', JSON.stringify([msg]));
    }
  };

  var remove = function(msg){
    // console.log(msg);
    var msgs = this.get();
    if(msgs){
      // console.log(msgs);
      angular.forEach(msgs, function(m){
        // console.log(m);
        if(JSON.stringify(m) == JSON.stringify(msg)){
          // console.log(m);
          msgs.splice(msgs.indexOf(m), 1);
        }
      });
      this.put(msgs);
    }
  };

  return{
    get:get,
    put:put,
    add:add,
    remove:remove,
  }
})

.service('NotificationService', function($q, $http, API_URI, APP_KEY, AuthService, $timeout){
  this.get = function(){
    var d = $q.defer();
    var url = API_URI+'member/notification?token='+AuthService.authToken();
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
  };

  this.read = function(id){
    var d = $q.defer();
    var url = API_URI+'member/notification/'+id+'?token='+AuthService.authToken();
    var data = {
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
});
