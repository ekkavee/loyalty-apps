angular.module('app.services')

.service('GeofenceService', function($q, $http, API_URI, APP_KEY, AuthService){
  var getGeofences = function(){
      var d = $q.defer();
      var url = API_URI+'geofence';
      var data = {
        // token:AuthService.authToken(),
        app_token:APP_KEY.app_token,
        app_secret:APP_KEY.app_secret,
      }
      $http.get(url, {params:data}).then(function(s){
        if(s.data.data.length > 0){
          s.data.data.map(function(geo){
            geo.id = geo.id+'';
            geo.latitude = parseFloat(geo.latitude);
            geo.longitude = parseFloat(geo.longitude);
            geo.notification.openAppOnClick = geo.notification.openAppOnClick?true:false;
            delete geo.notification.vibration;
            delete geo.notification.smallIcon;
            delete geo.notification.icon;
            // delete geo.notification;
          });
        }
        console.log(s.data.data);
        d.resolve(s.data.data);
      },function(e){
        d.reject(e);
      });

      return d.promise;
  };


  var sendGeoInfo = function(geo, device_uuid){
    var d = $q.defer();
    var url = API_URI+'geofence';
    var data = {
      // token:AuthService.authToken(),
      device_uuid:device_uuid,
      // device_geolocation:{latitude:geo.latitude, longitude:geo.longitude},
      device_geolocation:JSON.stringify(geo),
      geofence_id:geo.notification.geofence_id,
      action:geo.transitionType,
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    }
    if(AuthService.authToken()){
      url = API_URI+'geofence?token='+AuthService.authToken();
      // data.token = AuthService.authToken();
    }
    // alert(JSON.stringify(data));
    $http.post(url, data).then(function(s){
      console.log(s);
      d.resolve(s);
    }, function(e){
      console.log(e);
      d.reject(e);
    });

    return d.promise;

  };

  return{
    getGeofences:getGeofences,
    sendGeoInfo:sendGeoInfo,
  }
});
