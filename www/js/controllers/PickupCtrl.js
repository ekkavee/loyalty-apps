angular.module('starter.controllers')

.controller('PickupCtrl', function($scope, $ionicPlatform, $rootScope, GoogleMap, $timeout, $ionicHistory, $cordovaGeolocation, $http, $q, moment, API_URI, APP_KEY, AuthService){

  $scope.pick = {};
  $scope.errorMsgs = [
    {
          "id":1,
          "member_id":3,
          "system_notification_id":1,
          "status":"unread",
          "sent_at":"2017-09-07 11:06:48",
          "read_at":null,
          "created_at":"2017-09-07 11:06:48",
          "notification":{
            "id":1,
            "title":"Pick Up Service Only Available for Ultra Members.",
            "type":"error",
            "processing_date":null,
            "action":"redirect",
            "message":"this is a test",
            "payload":"{\"page\":\"dining\",\"id\":false}","created_at":"2017-09-07 11:06:39"}
      }
  ];

  function getAddress(name){
    var res = null;
    if($rootScope.member.member.member_addresses.length > 0){
      angular.forEach($rootScope.member.member.member_addresses, function(address){
        if(address.category == name){
          // res = JSON.parse(address.payload).google_map_obj;
          res = address;
        }
      });
    }
    return res;
  }

  function createMap (mapOptions){

    return new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  };

  function createMarker(map, latLng){
    // console.log(position);
    // var latLng = new google.maps.LatLng(position.latitude, position.longitude);
    if(angular.isDefined($scope.marker)){
      $scope.marker.setMap(null);
    }
    return new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: latLng
    });
  };

  $scope.init = function(){
    if($scope.positions.emerson){
      $scope.selectedAdd = '';
      $scope.inputAddType = 'from address';
      $scope.pick.towards_venue = false;
      chooseAddType();
      // $scope.pick.google_maps_json = $scope.positions.emerson;
      // $scope.pick.full_text = $scope.positions.emerson.formatted_address;
      var latLng = new google.maps.LatLng($scope.positions.emerson.geometry.location.lat, $scope.positions.emerson.geometry.location.lng);
      var mapOptions = {
        center: latLng,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      console.log(mapOptions);
      $scope.map = createMap (mapOptions);
      google.maps.event.addListenerOnce($scope.map, 'idle', function(){
        $scope.marker = createMarker($scope.map, latLng);
      });
    }
  };


  //loading map
  $timeout(function(){
    $scope.positions = {
      home:getAddress('home')?JSON.parse(getAddress('home').payload).google_map_obj:null,
      work:getAddress('work')?JSON.parse(getAddress('work').payload).google_map_obj:null,
      emerson:{
        formatted_address:'145 COMMERCIAL ROAD, SOUTH YARRA, MELBOURNE VIC 3141',
        geometry:{
          location:{
            lat:-37.8463066,
            lng:144.99119940000003
          }
        }
      },
    }

    // console.log(positions.home.geometry.location.lat, positions.home.geometry.location.lng);

    $scope.init();

  }, 1000);


  $scope.onAddressSelection = function(location){
    console.log(location);
    $scope.pick.google_maps_json = location;
    var latLng = new google.maps.LatLng(location.geometry.location.lat(), location.geometry.location.lng());
    console.log(latLng);
    $scope.marker = createMarker($scope.map, latLng);
    google.maps.event.trigger($scope.map, "resize");
    $scope.map.panTo($scope.marker.getPosition());
    $scope.map.setZoom(18);
  }

  //chnage address
  $scope.chooseAdd = function(google_map_obj){
    console.log(google_map_obj);
    if($scope.selectedAdd != google_map_obj){
      $scope.selectedAdd = google_map_obj;
      chooseAddType();
      // $scope.selectedAdd = index;
      // $scope.pick.google_maps_json = google_map_obj;
      // $scope.pick.full_text = google_map_obj.formatted_address;
      // console.log(google_map_obj);
      // var latLng = new google.maps.LatLng(google_map_obj.geometry.location.lat, google_map_obj.geometry.location.lng);
      // console.log(latLng);
      // $scope.marker = createMarker($scope.map, latLng);
      // google.maps.event.trigger($scope.map, "resize");
      // $scope.map.panTo($scope.marker.getPosition());
      // $scope.map.setZoom(18);
    }

  };

  function chooseAddType(){
    if($scope.selectedAdd == $scope.positions.emerson){
      $scope.pick.towards_venue = false;
      $scope.inputAddType = 'to address';
      return;
    }
    $scope.pick.towards_venue = true;
    $scope.inputAddType = 'from address';
  }


  $scope.requestPickup = function(pick){
    if(!/VIC/.test($scope.pick.google_maps_json.formatted_address)){
      var options = {
          title:"Sorry",
          cssClass:'thx-msg',
          tpl:'please enter an address in victoria.',
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){
              // $scope.closeModal();
          }
      }

      $rootScope.createAlertPopup(options);
      return;
    }
    var data = {
      google_maps_json:$scope.pick.google_maps_json,
      full_text:$scope.pick.google_maps_json.formatted_address,
      time_start:moment($scope.pick.time).tz('Australia/Melbourne').format('ha z'),
      time_end:moment($scope.pick.time).add(1, 'h').tz('Australia/Melbourne').format('ha z'),
      passengers:$scope.pick.ppl || 0,
      date:moment($scope.pick.date).tz('Australia/Melbourne').format('DD-MM-YY z'),
      towards_venue:$scope.pick.towards_venue,
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
    }
    console.log(data);

    $scope.$on('success', function(e,d){
      $scope.pick = {};
      $scope.init();
    });

    var url = API_URI+'member/pickuprequest?token='+AuthService.authToken();
    $http.post(url, data).then(function(s){
      console.log(s);
      // $scope.$broadcast('success', {});
      var options = {
          title:"Pick up request sent successfully",
          cssClass:'thx-msg',
          tpl:'',
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){
              // $scope.pick.time = null;
              // $scope.pick.date = null;
              // $scope.pick.ppl = null;
              // $scope.$broadcast('success', {});
          }

      }

      $rootScope.createAlertPopup(options);
      $scope.$broadcast('success', {});

    }, function(e){
      console.log(e);
      var options = {
          title:"Opps! Something went wrong, please try again.",
          cssClass:'thx-msg',
          tpl:e.data.message,
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){
              // $scope.closeModal();
          }
      }

      $rootScope.createAlertPopup(options);
    });
    // return d.promise;
  }

  $scope.maxppl = function(){
    if($scope.pick.ppl > 12){
      console.log('here');
      var options = {
          title:"",
          cssClass:'thx-msg',
          tpl:'Maximum number of people is 12.',
          okText:'OK',
          okType: 'button-blue',
          callBack: function(){
              // $scope.closeModal();
          }
      }

      $rootScope.createAlertPopup(options);
      $scope.pick.ppl = 12;
    }
  }

  $scope.back = function(){
      $timeout(function(){
        $ionicHistory.goBack();
      });
  };

});
