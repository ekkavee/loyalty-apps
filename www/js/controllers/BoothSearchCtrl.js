angular.module('starter.controllers')

.controller('BoothSearchCtrl', function($scope, $timeout, $ionicHistory, $stateParams, $ionicLoading, $ionicScrollDelegate, $ionicSlideBoxDelegate, BoothService, $state){
  $scope.searchRes = { data:null};

  console.log($stateParams);

  $scope.search = $stateParams.data.search;

  //get locations
  BoothService.getLocations().then(function(s){
    console.log(s);
    $scope.locations = s;
    if(s.length > 0 ){
    }
  },function(e){
    console.log();
  });


  $scope.getMiniPpl = function(booth){
    var mini = 0;
    if(booth.listing.reservations.length > 0){
      mini = booth.listing.reservations[0].min_people;
    }
    // var mini = 0;
    angular.forEach(booth.listing.reservations, function(r){
      if(Number(r.min_people) < mini){
        mini = Number(r.min_people);
      }
    });
    return mini;
  };

  $scope.getMiniSpend = function(booth){
    var min = 0;
    if(booth.listing.reservations.length > 0){
      mini = booth.listing.reservations[0].min_spend;
    }

    // var mini = 0;
    angular.forEach(booth.listing.reservations, function(r){
      if(Number(r.min_spend) < mini){
        mini = Number(r.min_spend);
      }
    });
    return mini;
  };

  $scope.getSessionById = function(sessions, session_id){
    var session = {};
    angular.forEach(sessions, function(s){
      if(s.id === parseInt(session_id)){
        session = s;
      }
    });
    // console.log(session);
    return session;
  };

  $scope.back = function(){

      $timeout(function(){
        $ionicHistory.goBack();
      });
  };


  $scope.searchBooth = function(search){
    $ionicLoading.show();
    BoothService.searchSlot(search).then(function(s){
      $scope.searchRes.data = null;
      console.log(s);
      $timeout(function(){
        $scope.searchRes.data = s.data;
        $scope.searchRes.message = s.message;
        $ionicSlideBoxDelegate.update();
        $ionicSlideBoxDelegate.start();
      });
      // if(s.message == 'alternative'){
      //   $scope.searchRes.data = s.data;
      //   $scope.searchRes.message = s.message;
      //   $ionicSlideBoxDelegate.update();
      //   $ionicSlideBoxDelegate.start();
      // }else{
      //   $scope.searchRes.data = s.data;
      //   $scope.searchRes.message = s.message;
      //   $ionicSlideBoxDelegate.update();
      //   $ionicSlideBoxDelegate.start();
      // }
    }, function(e){
      $scope.searchRes.data = [];
      $scope.searchRes.message = 'error';
    }).finally(function(){
      $ionicLoading.hide();
      $timeout(function(){
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
      });
    });
  }

  $scope.slideHasChanged = function(index){
    console.log(index);
  }

  $scope.dateFormat = function(time, format){
    return moment(time).tz('Australia/Melbourne').format(format);
  };

  $scope.bookBooth = function(search, booth){

    console.log(search, booth);
    $state.go('menu.detail', {booking:search, res:booth});
    // if($scope.searchRes.data!=null && $scope.searchRes.data.length > 0 && $scope.searchRes.message == 'alternative'){
    //   var new_search = {
    //
    //   }
    //   $state.go('menu.detail', {booking:search, res:booth});
    // }
  }


});
