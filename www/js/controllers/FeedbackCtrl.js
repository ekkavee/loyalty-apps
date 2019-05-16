angular.module('starter.controllers')

  .controller('FeedbackCtrl', function ($scope, $rootScope, $http, $ionicLoading, $ionicHistory, $ionicPlatform, API_URI, APP_KEY, AuthService, $timeout) {
    //$scope.refer = {};
    //$scope.referMsg = '';
    var context = this;
    $scope.msg = 'We would love to hear from you! <br/> Please enter your thoughts below.';
    $scope.rating = 0;

    $scope.init = function () {
        $scope.ratingsObject = {
            iconOn: 'ion-ios-star',    //Optional
            iconOff: 'ion-ios-star-outline',   //Optional
            iconOnColor: '#A57C57',  //Optional
            iconOffColor: '#ccc',    //Optional
            rating: 0,
            minRating: 0,    //Optional
            callback: function (rating, index) {    //Mandatory
                context.ratingsCallback(rating, index);
            }
        };
    }

    context.ratingsCallback = function (rating, index) {
        $scope.rating = rating;
    };

    $scope.init();

    $scope.back = function () {
        console.log($ionicHistory);
        $timeout(function () {
            $ionicHistory.goBack();
        });

    };

    $scope.submitFeedback = function (messege, contact_me) {
        var url = API_URI + 'member/feedback?token=' + AuthService.authToken();
        var data = {
            rating: $scope.rating,
            contact_me: contact_me || false,
            message: messege || '',
            app_token: APP_KEY.app_token,
            app_secret: APP_KEY.app_secret,
        }

        $http.post(url, data).then(function (s) {
            console.log(s);
            var options = {
                title: "",
                cssClass: 'thx-msg',
                tpl: s.data.message,
                okText: 'OK',
                okType: 'button-magenta',
                callBack: function () {
                }
            }
            $scope.back();
            $rootScope.createAlertPopup(options);
        }, function (e) {
            console.log(e);
            var options = {
                title: "Oops! Something went wrong, please try again",
                cssClass: 'thx-msg',
                tpl: e.data.message,
                okText: 'OK',
                okType: 'button-magenta',
                callBack: function () {
                }
            }
            $rootScope.createAlertPopup(options);
        }).finally(function () {
            $ionicLoading.hide();
        });

    };

    

    $timeout(function () {
      console.log('Feedbacks');
      $ionicPlatform.ready(function () {
        window.FirebasePlugin.setScreenName('Feedbacks');
      });
    });
  });
