angular.module('starter.controllers')

  .controller('TimeLocationCtrl', function ($scope, $rootScope, $ionicHistory, $timeout, $ionicLoading, $ionicScrollDelegate, $q, $http, API_URI, APP_KEY, AuthService) {
    $scope.back = function () {
      $timeout(function () {
        $ionicHistory.goBack();
      });
    };

    function createMap(mapOptions) {
      return new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    };

    function addToLoaction(address) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          console.log(results);

        } else {

        }
      });
    }



    function createMarker(map, latLng) {
      // console.log(position);
      // var latLng = new google.maps.LatLng(position.latitude, position.longitude);
      if (angular.isDefined($scope.marker)) {
        $scope.marker.setMap(null);
      }
      return new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });
    };

    $scope.init = function () {
      if ($scope.positions.emerson) {
        // $scope.selectedAdd = '';
        // $scope.inputAddType = 'from address';
        // $scope.pick.towards_venue = false;
        // chooseAddType();

        var latLng = new google.maps.LatLng($scope.positions.emerson.geometry.location.lat(), $scope.positions.emerson.geometry.location.lng());
        var mapOptions = {
          center: latLng,
          zoom: 18,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        console.log(mapOptions);
        $scope.map = createMap(mapOptions);
        google.maps.event.addListenerOnce($scope.map, 'idle', function () {
          $scope.marker = createMarker($scope.map, latLng);
        });
      }
    };

    $scope.goToMapApp = function () {
      console.log($scope.positions.emerson);
      console.log(ionic.Platform);
      var lat = parseFloat($scope.positions.emerson.geometry.location.lat())
      var long = parseFloat($scope.positions.emerson.geometry.location.lng())
      var text = encodeURIComponent($scope.positions.emerson.formatted_address)
      if (ionic.Platform.isIOS()) {
        // console.log("http://maps.apple.com/?q=#"+text+"&ll=#{lat},#{long}&near=#{lat},#{long}");
        // window.open("http://maps.apple.com/?q=#{text}&ll=#{lat},#{long}&near=#{lat},#{long}", '_system', 'location=no');
        window.open("http://maps.apple.com/maps?q=" + text, '_system', 'location=no');
      }
      else {
        // console.log("geo:#{lat},#{long}?q=#{text}");
        window.open("geo:?q=" + text, '_system', 'location=yes');
      }

    };

    //loading map
    $timeout(function () {
      var url = API_URI + 'member/hourandlocation';
      var data = {
        token: AuthService.authToken(),
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.get(url, { params: data }).then(function (s) {
        console.log(s.data.data);
        $scope.venue = s.data.data;
        // $scope.venue.open_and_close_hours = JSON.parse(venue.open_and_close_hours);
        // $scope.venue.pickup_and_delivery_hours = JSON.parse(venue.pickup_and_delivery_hours);
        // $scope.venue.social_links = JSON.parse(venue.social_links);

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': $scope.venue.address }, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            console.log(results);
            $scope.venue.googleGeoCode = results[0];
          }
        });

      }, function (e) {
        $scope.venue = {};
      });

    });

    $scope.show = null;
    $scope.toggleGroup = function (group) {
      if ($scope.show == group.id) {
        $scope.show = null;
      } else {
        $ionicLoading.show();
        $scope.show = group.id;
      }

      $ionicScrollDelegate.$getByHandle('mainScroll').resize();
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
      $timeout(function () {
        $ionicLoading.hide();
      }, 1500);
    };

    $scope.isGroupShown = function (group) {
      return $scope.show == group.id;
    };

    $timeout(function () {
      console.log('Find us');
      window.ga.trackView('Find us', '', true);
    });

  });
