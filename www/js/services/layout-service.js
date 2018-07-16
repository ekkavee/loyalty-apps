angular.module('app.services')

.service('Layout', function($q, $http, API_URI, APP_KEY, AuthService){
  var vm = this;

  vm.getLayout = function(){
    var d = $q.defer();
    var url = API_URI+'appSettings';
    var data = {
      token:AuthService.authToken(),
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    }
    $http.get(url, {params:data}).then(function(s){
      // console.log(s.data.data);
      d.resolve(s.data.data);
    },function(e){
      d.reject(e);
    });

    return d.promise;
  }
})
