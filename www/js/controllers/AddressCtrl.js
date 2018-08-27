angular.module('starter.controllers')

.controller('AddressCtrl', function($scope, $rootScope, $ionicLoading, $timeout, $state, $ionicHistory, Members){

  //address functions
  function getAddress(name){
    var res = null;
    if($rootScope.member.member.member_addresses.length > 0){
      angular.forEach($rootScope.member.member.member_addresses, function(address){
        if(address.category == name){
          // res = JSON.parse(address.payload).google_map_obj;
          res = {
            id:address.id,
            name:address.category,
            google_map_obj:JSON.parse(address.payload).google_map_obj,
            display: JSON.parse(address.payload).display
            // formatted_address:JSON.parse(address.payload).google_map_obj.formatted_address
          };
          console.log(JSON.parse(address.payload));
          // setAddressDisplay(res);
        }
      });
    }
    return res;
  }

  function createAddress(name, address_obj){
    // var add = {
    //   name:name,
  	// 	google_map_obj:google_map,
  	// 	formatted_address:google_map.formatted_address
    // }
    $ionicLoading.show();
    Members.createMemberAddress(address_obj, name).then(function(s){
      console.log(s);
      $rootScope.$on('UserReady', function(){
        $state.go($state.current, {}, {reload: true});
      });
    },function(e){
      console.log(e);
    }).finally(function(){
      $ionicLoading.hide();
      $rootScope.$broadcast('UserInit', {});
    });
  };

  function updateAddress(old_address_obj, address_obj){
    // var add = {
    //   name:old_address_obj.category,
  	// 	google_map_obj:new_address_obj,
  	// 	formatted_address:new_address_obj.formatted_address
    // }
    $ionicLoading.show();
    Members.updateMemberAddress(old_address_obj.id, address_obj).then(function(s){
      console.log(s);
      $rootScope.$on('UserReady', function(){
        $state.go($state.current, {}, {reload: true});
      });
    },function(e){
      console.log(e);
    }).finally(function(){
      $ionicLoading.hide();
      $rootScope.$broadcast('UserInit', {});
    });
  }

  $scope.saveAddress = function(name, address_obj, dirty){
    if(getAddress(name)){
      //update
      updateAddress(getAddress(name), address_obj);

    }
    else{
      createAddress(name, address_obj);
    }

  };

  function setAddressDisplay(address_obj){
    // console.log(address_obj.google_map_obj.address_components);
    address_obj.display = {
      postcode:address_obj.google_map_obj.address_components[address_obj.google_map_obj.address_components.length - 1].short_name,
      state:address_obj.google_map_obj.address_components[address_obj.google_map_obj.address_components.length - 3].short_name,
      suburb:address_obj.google_map_obj.address_components[address_obj.google_map_obj.address_components.length - 5].short_name,
      street:address_obj.google_map_obj.address_components[address_obj.google_map_obj.address_components.length - 7].short_name+' '+address_obj.google_map_obj.address_components[address_obj.google_map_obj.address_components.length - 6].short_name,
      unit:address_obj.google_map_obj.address_components.length > 7?address_obj.google_map_obj.address_components[address_obj.google_map_obj.address_components.length - 8].short_name:'',
    }
  }

  $scope.addressType = 'home';
  $scope.form = {};

  $timeout(function(){
    $scope.address = getAddress($scope.addressType);
    console.log($scope.address);
  }, 500);

  // $scope.back = function(){
  //     if($scope.addressType == 'bill'){
  //       $scope.addressType = 'home';
  //       $scope.address = getAddress($scope.addressType);
  //       return;
  //     }
  //     console.log($ionicHistory);
  //     $timeout(function(){
  //       $ionicHistory.goBack();
  //     });
  //
  // };

  $scope.back = function(dirty){
    console.log(dirty);
    if(dirty){
      var options = {
        title: '',
        cssClass: 'item-confirm',
        tpl: 'Do you want to Exit without Saving?',
        successCallBack:function(){
          if($scope.addressType == 'bill'){
            $scope.addressType = 'home';
            $scope.address = getAddress($scope.addressType);
            return;
          }
          console.log($ionicHistory);
          $timeout(function(){
            $ionicHistory.goBack();
          });
        },
        failCallBack:function(){
          // $state.go(stateName);
        },
      };
      $rootScope.createConfirmPop(options);
    }else{
      if($scope.addressType == 'bill'){
        $scope.addressType = 'home';
        $scope.address = getAddress($scope.addressType);
        return;
      }
      console.log($ionicHistory);
      $timeout(function(){
        $ionicHistory.goBack();
      });
    }


  };

  //Optional
  $scope.countryCode = 'AU';

  $scope.onAddressSelection = function (location, name) {
      // $scope.form.myForm.$dirty = true;
      // console.log($scope.form.myForm);
      if(name == 'home'){
        $scope.address = {
          name:'home',
      		google_map_obj:location,
      		formatted_address:location.formatted_address
        };
      }
      else if (name == 'bill') {
        $scope.address = {
          name:'bill',
      		google_map_obj:location,
      		formatted_address:location.formatted_address
        };
      }
      setAddressDisplay($scope.address);
      $scope.form.myForm.$dirty = true;
      // console.log($scope.address);
  };


  $scope.showBillAdsress = function(){
    $scope.addressType = 'bill';
    $scope.address = getAddress($scope.addressType);
  }
});
