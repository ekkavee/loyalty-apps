angular.module('app.services')
.service('enquiryPopup', function($q, $http, API_URI, APP_KEY, AuthService, $ionicPopup, $timeout, $ionicLoading, $rootScope){
  var popup = null;
  var listing = null;
  var msg = null;
  var title = null;
  // $scope.data = {};

  function submit(listing_id, enquiry){
    // console.log('here');
    var d = $q.defer();
    var url = API_URI+'member/enquire?token='+AuthService.authToken();
    var data = {
      listing_id:listing_id,
      subject:enquiry.title,
      message:enquiry.msg,
      app_token: APP_KEY.app_token,
      app_secret: APP_KEY.app_secret,
    }
    $http.post(url, data).then(function(s){
      // console.log(s);
      d.resolve(s);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  }

  var show = function(l, s){
    listing = l;
    // console.log(s);
    s.data = {title:listing.heading};
    var options = {
      title: listing.heading,
      cssClass: 'enquiry-popoup',
      subTitle: 'Please use the form below to contact Us.', // String (optional). The sub-title of the popup.
      templateUrl: 'templates/enquiry-form.html', // String (optional). The URL of an html template to place in the popup   body.
      scope: s, // Scope (optional). A scope to link to the popup content.
      buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
        text: 'Cancel',
        type: 'button-stable',
        onTap: function(e) {
          // e.preventDefault() will stop the popup from closing when tapped.
          // e.preventDefault();
        }
      }, {
        text: 'OK',
        type: 'button-positive',
        onTap: function(e) {
          // console.log(s.myForm.$valid);
          if(angular.isDefined(s.data.title) && angular.isDefined(s.data.msg)){
            $ionicLoading.show();
            console.log({listing:listing, data:s.data});
            submit(listing.id, s.data).then(function(s){
              $ionicLoading.hide();
              console.log(s);
              var options = {
                  title:"",
                  cssClass:'thx-msg',
                  tpl:'Thanks for your enquiry. We will contact you shortly',
                  okText:'OK',
                  okType: 'button-blue',
                  callBack: function(){
                      // $scope.closeModal();
                  }
              }
              $rootScope.createAlertPopup(options);
            },function(e){
              $ionicLoading.hide();
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

          }
          else {
            e.preventDefault();
          }
          // Returning a value will cause the promise to resolve with the given value.
          // return scope.data.response;
          // e.preventDefault();
        }
      }]
    }

    popup = $ionicPopup.show(options);
    return popup;

  }

  return{
    show:show,
  }
});
