angular.module('app.services', [])

  //http response interceptor
  .factory('AuthInterceptor', function ($rootScope, $q, $injector, $ionicPlatform) {
    // var api = '/^'+API_URI+'/';
    return {
      request: function (config) {
        $ionicPlatform.ready(function () {
          if (navigator.connection.type == 'none') {
            var options = {
              title: "No Network, Please Check Your Connection.",
              cssClass: 'thx-msg',
              tpl: "",
              okText: 'OK',
              okType: 'button-blue',
              callBack: function () {
                delete $rootScope['networkAlert'];
              }
            }
            if (angular.isUndefined($rootScope.networkAlert)) {
              $rootScope.networkAlert = true;
              $rootScope.createAlertPopup(options);
            }
          }
        });
        // config.timeout = 1;
        return config;
      },
      responseError: function (response) {
        console.log(response);
        if (/^https:\/\/api.vecport.net/.test(response.config.url) && (response.status == 401 || (response.status == 400 && response.data.error) || response.status == 403)) {
          console.log(response.status);
          $rootScope.logout();

        }
        if (/^https:\/\/api.vecport.net/.test(response.config.url) && (response.status == 503)) {
          console.log(response.status);
          var options = {
            title: "This App is under Maintenance, Please Try Again Later.",
            cssClass: 'thx-msg',
            tpl: "",
            okText: 'OK',
            okType: 'button-blue',
            callBack: function () {
            }
          }

          $rootScope.createAlertPopup(options);

        }
        if (/^https:\/\/api.vecport.net/.test(response.config.url) && (response.status == 404)) {
          $injector.get('$state').transitionTo('menu.404');
        }

        if (/^https:\/\/api.vecport.net/.test(response.config.url) && (response.status == 410)) {
          console.log(response.status);
          $rootScope.logout();
          var options = {
            title: "",
            cssClass: 'thx-msg',
            tpl: response.data.message,
            okText: 'OK',
            okType: 'button-blue',
            callBack: function () {
            }
          }

          $rootScope.createAlertPopup(options);

        }
        return $q.reject(response);
      }
    };
  })

  .service('AuthService', function ($q, $http, USER_ROLES, API_URI, $rootScope, APP_KEY) {
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var CURRENT_USER = 'CURRENT_USER';
    var email = '';
    // var member_id = '';
    // var profile_img = '';
    var isAuthenticated = false;
    var role = '';
    var authToken = '';

    function loadUserCredentials() {
      var user = JSON.parse(window.localStorage.getItem(CURRENT_USER));
      if (user) {
        useCredentials(window.localStorage.getItem(CURRENT_USER));
      }
    }

    function storeUserCredentials(user) {
      console.log(user);
      window.localStorage.setItem(CURRENT_USER, JSON.stringify(user));
      useCredentials(window.localStorage.getItem(CURRENT_USER));
    }

    function useCredentials(current_user) {
      var user = JSON.parse(current_user);
      isAuthenticated = true;
      authToken = user.token;
      $http.defaults.headers.common['X-Auth-Token'] = user.token;
    }

    function destroyUserCredentials() {
      authToken = undefined;
      isAuthenticated = false;
      $http.defaults.headers.common['X-Auth-Token'] = undefined;
      window.localStorage.removeItem(CURRENT_USER);
    }

    function destroySocialMediaToken() {
      if (window.localStorage.getItem('FACEBOOK') !== null) {
        window.localStorage.removeItem('FACEBOOK');
      }
      if (window.localStorage.getItem('GOOGLE') !== null) {
        window.localStorage.removeItem('GOOGLE');
      }
      if (window.localStorage.getItem('TWITTER') !== null) {
        window.localStorage.removeItem('TWITTER');
      }
    }


    var login = function (email, pw) {
      var deferred = $q.defer();

      var data = {
        email: email,
        password: pw,
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      };
      $http.post(API_URI + 'signin', data).then(function (resp) {
        //only store token in localStorage
        var current_user = {
          token: resp.data.token,
        }
        storeUserCredentials(current_user);
        deferred.resolve(resp);
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };

    var logout = function () {
      destroyUserCredentials();
      destroySocialMediaToken();
    };

    var isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
    };

    var storeUser = function (user) {
      storeUserCredentials(user);
    };

    var storeSocialMediaToken = function (type, Credentials) {
      if (type == 'facebook') {
        window.localStorage.setItem('FACEBOOK', JSON.stringify(Credentials));
      }
      if (type == 'google') {

      }
      if (type == 'twitter') {
        window.localStorage.setItem('TWITTER', JSON.stringify(Credentials));
      }
      if (type == 'instagram') {
        window.localStorage.setItem('INSTAGRAM', JSON.stringify(Credentials));
      }
    };



    loadUserCredentials();

    return {
      login: login,
      logout: logout,
      isAuthorized: isAuthorized,
      isAuthenticated: function () { return isAuthenticated; },
      // email: function() {return email;},
      // role: function() {return role;},
      authToken: function () { return authToken; },
      storeUser: storeUser,
      storeSocialMediaToken: storeSocialMediaToken
    };
  })

  .service('Password', function ($q, $http, API_URI, APP_KEY) {

    var emailReset = function (email) {
      var d = $q.defer();
      var url = API_URI + "reset" + '?app_token=' + APP_KEY.app_token + '&app_secret=' + APP_KEY.app_secret + '&email=' + email;
      console.log(url);
      $http.get(url).then(function (success) {
        d.resolve(success);
      }, function (error) {
        d.reject(error);
      });
      return d.promise;
    }

    var emailSMS = function (phone) {
      var d = $q.defer();
      var url = API_URI + "mobile/reset" + '?app_token=' + APP_KEY.app_token + '&app_secret=' + APP_KEY.app_secret + '&mobile=' + phone;
      console.log(url);
      $http.get(url).then(function (success) {
        d.resolve(success);
      }, function (error) {
        d.reject(error);
      });
      return d.promise;
    }

    return {
      emailReset: emailReset,
      emailSMS: emailSMS
    }
  })

  .service('Order', function ($q, $http, API_URI, APP_KEY) {

    return {
    }

  })

  .service('Voucher', function ($q, $http, API_URI, APP_KEY, PaypalService, AuthService) {
    var vouchers = {};

    var getVouchers = function () {
      var d = $q.defer();
      var url = API_URI + 'member/userVoucher';
      $http.get(url, { params: { token: AuthService.authToken(), app_token: APP_KEY.app_token, app_secret: APP_KEY.app_secret } }).then(function (r) {
        vouchers = r.data.data;
        d.resolve(vouchers);
      }, function (e) {
        d.reject(e);
      });

      return d.promise;
    }

    var getVoucherByID = function (voucher_id) {
      var voucher = {};
      var d = $q.defer();
      var url = API_URI + 'member/userVoucher/' + voucher_id;

      $http.get(url, { params: { token: AuthService.authToken(), app_token: APP_KEY.app_token, app_secret: APP_KEY.app_secret } }).then(function (r) {
        voucher = r.data.data;
        d.resolve(voucher);
      }, function (e) {
        d.reject(e);
      });

      return d.promise;
    }


    return {
      vouchers: function () { return vouchers; },
      getVouchers: getVouchers,
      getVoucherByID: getVoucherByID,
    }
  })

  .service('Transactions', function ($q, $http, API_URI, APP_KEY, AuthService) {
    var transactions = {};

    var getTransactions = function () {
      var d = $q.defer();
      var url = API_URI + 'member/transaction';
      $http.get(url, { params: { token: AuthService.authToken(), app_token: APP_KEY.app_token, app_secret: APP_KEY.app_secret } }).then(function (s) {
        transactions = s.data.data;
        d.resolve(transactions);
      }, function (e) {
        d.reject(e);
      });

      return d.promise;
    };

    var getAllBookingTransacs = function () {
      var d = $q.defer();
      var url = API_URI + 'member/memberReservation?token=' + AuthService.authToken();
      var data = {
        params:
          {
            app_token: APP_KEY.app_token,
            app_secret: APP_KEY.app_secret
          }
      };
      $http.get(url, data).then(function (s) {
        console.log(s.data.data);
        d.resolve(s.data.data);
      }, function (e) {
        d.reject(e);
      });

      return d.promise;
    }

    return {
      getTransactions: getTransactions,
      getAllBookingTransacs: getAllBookingTransacs
    }
  })

  .service('PushNotification', function ($q, $http, API_URI, APP_KEY, AuthService) {
    var init = function () {
      //OneSignal
      var notificationOpenedCallback = function (jsonData) {
        console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
      };

      window.plugins.OneSignal.init("92a18442-a782-48b9-9aec-d2136ff442a0",
        { googleProjectNumber: "" },
        notificationOpenedCallback);

      // Show an alert box if a notification comes in when the user is in your app.
      window.plugins.OneSignal.enableInAppAlertNotification(true);
    };

    return {
      init: init,
    }
  })

  .service('FAQ', function ($q, $http, API_URI, APP_KEY, AuthService, $ionicLoading, $timeout) {
    var getFaq = function () {
      var d = $q.defer();
      var url = API_URI + 'member/faq?token=' + AuthService.authToken();
      var data = {
        params: {
          app_token: APP_KEY.app_token,
          app_secret: APP_KEY.app_secret,
        }
      };
      $http.get(url, data).then(function (s) {
        console.log(s.data.data);
        d.resolve(s.data.data);
      }, function (e) {
        console.log(e);
        d.reject(e);
      });
      return d.promise;
    };

    return {
      getFaq: getFaq,
    }
  })

  .service('LikeListing', function ($q, $http, API_URI, APP_KEY, AuthService, $timeout) {

    var like = function (listing_id) {
      var d = $q.defer();
      var url = API_URI + 'member/like?token=' + AuthService.authToken();
      var data = {
        listing_id: listing_id,
        status: 'like',
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.post(url, data).then(function (s) {
        // console.log(s);
        d.resolve(s);
      }, function (e) {
        d.reject(e);
      });
      return d.promise;
    }

    var dislike = function (listing_id) {
      var d = $q.defer();
      var url = API_URI + 'member/like?token=' + AuthService.authToken();
      var data = {
        listing_id: listing_id,
        status: 'dislike',
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.post(url, data).then(function (s) {
        // console.log(s);
        d.resolve(s);
      }, function (e) {
        d.reject(e);
      });
      return d.promise;
    }

    return {
      like: like,
      dislike: dislike
    }
  })

  .service('FavoriteListing', function ($q, $http, API_URI, APP_KEY, AuthService, $timeout) {
    var add = function (listing_id) {
      var d = $q.defer();
      var url = API_URI + 'member/favorite?token=' + AuthService.authToken();
      var data = {
        listing_id: listing_id,
        status: 'favorite',
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.post(url, data).then(function (s) {
        d.resolve(s);
      }, function (e) {
        d.reject(e);
      });
      return d.promise;
    }

    var remove = function (listing_id) {
      var d = $q.defer();
      var url = API_URI + 'member/favorite?token=' + AuthService.authToken();
      var data = {
        listing_id: listing_id,
        status: 'nonfavorite',
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.post(url, data).then(function (s) {
        d.resolve(s);
      }, function (e) {
        d.reject(e);
      });
      return d.promise;
    }

    var get = function () {
      var d = $q.defer();
      var url = API_URI + 'member/favorite?token=' + AuthService.authToken();
      var data = {
        params: {
          app_token: APP_KEY.app_token,
          app_secret: APP_KEY.app_secret,
        }
      };
      $http.get(url, data).then(function (s) {
        console.log(s.data.data);
        d.resolve(s.data.data);
      }, function (e) {
        d.reject(e);
      });

      return d.promise;
    }

    return {
      add: add,
      remove: remove,
      get: get,
    }
  })

  .service('Survey', function ($q, $http, API_URI, APP_KEY, AuthService, $timeout) {

    var get = function () {
      var d = $q.defer();
      var url = API_URI + 'member/survey?token=' + AuthService.authToken();
      var data = {
        params: {
          app_token: APP_KEY.app_token,
          app_secret: APP_KEY.app_secret,
        }
      };
      $http.get(url, data).then(function (s) {
        console.log(s.data.data);
        d.resolve(s.data.data);
      }, function (e) {
        d.reject(e);
      });

      return d.promise;
    }

    var getById = function (id) {
      var d = $q.defer();
      var url = API_URI + 'member/survey/' + id;
      var data = {
        params: {
          token: AuthService.authToken(),
          app_token: APP_KEY.app_token,
          app_secret: APP_KEY.app_secret,
        }
      };
      $http.get(url, data).then(function (s) {
        console.log(s.data.data);
        d.resolve(s.data.data);
      }, function (e) {
        d.reject(e);
      });

      return d.promise;
    }

    var submit = function (survey) {
      var d = $q.defer();
      var url = API_URI + 'member/survey?token=' + AuthService.authToken();
      var data = {
        survey: survey,
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.post(url, data).then(function (s) {
        d.resolve(s.data);
      }, function (e) {
        d.reject(e);
      });
      return d.promise;
    }

    return {
      get: get,
      getById: getById,
      submit: submit
    }

  })

  .service('DynamicButton', function ($q, $http, API_URI, APP_KEY, AuthService, $timeout) {
    var get = function () {
      var d = $q.defer();
      var url = API_URI + 'member/button';
      var data = {
        params: {
          token: AuthService.authToken(),
          app_token: APP_KEY.app_token,
          app_secret: APP_KEY.app_secret,
        }
      };
      $http.get(url, data).then(function (s) {
        console.log(s.data.data);
        d.resolve(s.data.data);
      }, function (e) {
        d.reject(e);
      });

      return d.promise;
    };

    return {
      get: get,
    }
  })

  .service('HomeTiles', function ($q, $http, API_URI, APP_KEY, AuthService, $timeout) {
    var getHomeTiles = function () {
      var d = $q.defer();
      var url = API_URI + 'member/homeSetting';
      var data = {
        params: {
          token: AuthService.authToken(),
          app_token: APP_KEY.app_token,
          app_secret: APP_KEY.app_secret,
        }
      };
      $http.get(url, data).then(function (s) {
        console.log(s.data.data);
        d.resolve(s.data.data);
      }, function (e) {
        d.reject(e);
      });
      return d.promise;
    }

    return {
      get: getHomeTiles,
    }
  });
