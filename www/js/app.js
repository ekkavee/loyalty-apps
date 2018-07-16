// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'app.services', 'app.directives', 'app.filters', 'ngCordovaOauth', 'ngTwitter', 'angularMoment', 'slickCarousel', 'barcode', 'ngFileUpload', 'ion-google-autocomplete', 'credit-cards', 'ionicLazyLoad', 'ngInputCurrency', 'ion-datetime-picker', 'angularLazyImg'])

  .run(function ($ionicPlatform, $rootScope, AuthService, $state, $timeout, MsgService, GeofenceService, MenuBadge, $window, Layout) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);

        window.ga.startTrackerWithId('UA-122012592-1', function () {
          console.log('google analytics Enable!');
        }, function () {
          console.log('google analytics error');
        });

        var notificationOpenedCallback = function (jsonData) {
          console.log(jsonData);
          if (jsonData.notification.payload.additionalData.category === 'ticket') {
            $state.go('menu.tabs.tickets');
          }
          //add one for each voucher issued
          if (jsonData.notification.payload.additionalData.category === 'voucher') {
            $state.go('menu.vouchers');
          }
        };

        var onNotificationReceived = function (data) {
          console.log(data);
        }

        window.plugins.OneSignal
          .startInit("84fc1aec-7679-49db-8530-f85cedbaa204")
          .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
          .handleNotificationReceived(onNotificationReceived)
          .handleNotificationOpened(notificationOpenedCallback)
          .endInit();

        cordova.getAppVersion.getVersionNumber(function (version) {
          $rootScope.appVersion = version;
        });

      }

      if (window.StatusBar) {
        StatusBar.styleDefault();
        StatusBar.styleLightContent();
      }

      console.log('device api init!');
    });


    //get screen size
    $rootScope.screen = {
      width: $window.screen.width,
      height: $window.screen.height
    }

    // load layouts
    Layout.getLayout().then(function (r) {
      console.log(r);
      $rootScope.layout = r;
      $rootScope.$broadcast('LayoutReady', {});
    }, function (e) {
      $rootScope.layout = {};
      console.log(e);
    });


  })


  //constants
  .constant('APP_KEY', {
    app_token: '12a3e1a732ee',
    app_secret: '2da489f7ac6cce34ddcda02ef126270b'
  })

  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })

  .constant('USER_ROLES', {
    admin: 'admin_role',
    member: 'member_role'
  })

  .constant('API_URI', 'https://api.vecport.net/bepozws/public/api/')
  // .constant('API_URI','https://api.vecport.net/bepozws/public/api/')

  .constant('PROFILE_DEFAULT', 'https://s3-ap-southeast-2.amazonaws.com/meadows-imgs/profile_default.png')

  .constant('$ionicLoadingConfig', {
    template: '<ion-spinner class="text-center"></ion-spinner>',
    duration: 40000,
  })

  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {
    $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      .state('signup', {
        url: '/signup',
        params: { user: {} },
        templateUrl: 'templates/sign-up.html',
        controller: 'SignupCtrl'
      })

      .state('resetpassword', {
        url: '/reset-password',
        templateUrl: 'templates/reset-password.html',
        controller: 'PasswordCtrl'

      })

      .state('membership', {
        url: '/membership',
        // params:{user:{}},
        templateUrl: 'templates/membership.html',
        controller: 'MembershipCtrl'
      })

      .state('menu', {
        url: '/menu',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'MenuCtrl'
      })

      // setup an abstract state for the tabs directive
      .state('menu.tabs', {
        url: '/tabs',
        abstract: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/tabs.html',
            controller: 'TabsCtrl'
          }
        }
      })

      // .state('menu.profile', {
      //   url: '/profile',
      //   cache:false,
      //   views:{
      //     'menuContent': {
      //       templateUrl: 'templates/profile.html',
      //       controller: 'ProfileCtrl'
      //     }
      //   }
      // })

      .state('menu.crop-img', {
        url: '/crop-img',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/crop-img.html',
            controller: 'CropimgCtrl'
          }
        }
      })

      .state('menu.pickup', {
        url: '/pickup',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/pickup.html',
            controller: 'PickupCtrl'
          }
        }
      })

      .state('menu.contact', {
        url: '/contact',
        cache: false,
        views: {
          'menuContent': {
          }
        }
      })

      .state('menu.about', {
        url: '/about',
        views: {
          'menuContent': {
            templateUrl: 'templates/about.html',
            controller: 'AboutCtrl'
          }
        }
      })

      .state('menu.promotions', {
        url: '/promotions',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/promotions.html',
            controller: 'ProCtrl'
          }
        }
      })

      .state('menu.vouchers', {
        url: '/vouchers',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/vouchers.html',
            controller: 'VouchersCtrl'
          }
        }
      })

      .state('menu.tickets', {
        url: '/tickets',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/tickets.html',
            controller: 'TicketsCtrl'
          }
        }
      })


      .state('menu.tabs.whatson', {
        url: '/whatson',
        params: {
          view: {
            layout: 'tabs',
            index: 1,
            view: 'whatson'
          }
        },
        // cache: false,
        views: {
          'tab-whats@menu.tabs': {
            templateUrl: 'templates/tabPage-tpl.html',
            controller: 'PageCtrl'
          }
        }
      })

      .state('menu.tabs.promotions', {
        url: '/promotions',
        params: {
          view: {
            layout: 'tabs',
            index: 2,
            view: 'promotions'
          }
        },
        // cache:false,
        views: {
          'tab-pro@menu.tabs': {
            templateUrl: 'templates/promotions.html',
            controller: 'ProCtrl'
          }
        }
      })

      .state('menu.tabs.tickets', {
        url: '/tickets',
        params: {
          view: {
            layout: 'tabs',
            index: 2,
            view: 'tickets'
          }
        },
        // cache:false,
        views: {
          'tab-pro@menu.tabs': {
            templateUrl: 'templates/ticketsTab.html',
            controller: 'TicketsCtrl'
          }
        }
      })

      .state('menu.tabs.gift-cards', {
        url: '/gift_cards',
        params: {
          view: {
            layout: 'tabs',
            index: 3,
            view: 'gift card'
          }
        },
        // cache:false,
        views: {
          'tab-gift@menu.tabs': {
            templateUrl: 'templates/gift-certificates.html',
            controller: 'PageCtrl'
          }
        }
      })

      .state('menu.tabs.time-location', {
        url: '/time-location',
        params: {
          view: {
            layout: 'tabs',
            index: 3,
            view: 'find us'
          }
        },
        // cache:false,
        views: {
          'tab-gift@menu.tabs': {
            templateUrl: 'templates/time-locationTab.html',
            controller: 'TimeLocationCtrl'
          }
        }
      })


      .state('menu.tabs.tab1', {
        url: '/tab1/:id',
        cache: false,
        views: {
          'tab1@menu.tabs': {
            // templateUrl: 'templates/page-tpl.html',
            // controller: 'PageCtrl'
          }
        },
      })

      .state('menu.tabs.tab2', {
        url: '/tab2/:id',
        cache: false,
        views: {
          'tab2@menu.tabs': {
            // templateUrl: 'templates/page-tpl.html',
            // controller: 'PageCtrl'
          }
        },
      })

      .state('menu.tabs.tab3', {
        url: '/tab3/:id',
        cache: false,
        views: {
          'tab3@menu.tabs': {
            templateUrl: 'templates/page-tpl.html',
            controller: 'PageCtrl'
          }
        },
      })

      .state('menu.tabs.tab4', {
        url: '/tab4/:id',
        cache: false,
        views: {
          'tab4@menu.tabs': {
            templateUrl: 'templates/page-tpl.html',
            controller: 'PageCtrl'
          }
        },
      })

      .state('menu.tabs.tab5', {
        url: '/tab5/:id',
        cache: false,
        views: {
          'tab5@menu.tabs': {
            templateUrl: 'templates/page-tpl.html',
            controller: 'PageCtrl'
          }
        },
      })

      .state('menu.redeems', {
        url: '/redeems',
        views: {
          'menuContent': {
            templateUrl: 'templates/redeems.html',
            controller: 'RedeemCtrl'
          }
        }
      })

      .state('menu.parterns', {
        url: '/parterns',
        views: {
          'menuContent': {
            templateUrl: 'templates/parterns.html',
            controller: 'ParternsCtrl'
          }
        }
      })

      .state('menu.gifts', {
        url: '/gifts',
        params: {
          view: {
            layout: 'side_menus',
            index: 2,
            view: 'gift card'
          }
        },
        views: {
          'menuContent': {
            templateUrl: 'templates/gift-certificates.html',
            controller: 'PageCtrl'
          }
        }
      })

      .state('menu.bookings', {
        url: '/bookings',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/bookings.html',
            controller: 'BookingsCtrl'
          }
        }
      })

      .state('menu.time-location', {
        url: '/time-location',
        views: {
          'menuContent': {
            templateUrl: 'templates/time-location.html',
            controller: 'TimeLocationCtrl'
          }
        }
      })

      .state('menu.booths', {
        url: '/booths',
        // cache:false,
        views: {
          'menuContent': {
            templateUrl: 'templates/booths.html',
            controller: 'BoothsCtrl'
          }
        }
      })

      .state('menu.function', {
        url: '/function',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/function.html',
            controller: 'FunctionsCtrl'
          }
        }
      })

      .state('menu.booking-history', {
        url: '/booking-history',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/booking-history.html',
            controller: 'BookingHistoryCtrl'
          }
        }
      })

      .state('menu.booth-search', {
        cache: false,
        url: '/booth-search',
        params: { data: {} },
        views: {
          'menuContent': {
            templateUrl: 'templates/booth-search-result.html',
            controller: 'BoothSearchCtrl'
          }
        }
      })

      .state('menu.detail', {
        url: '/booths-detail',
        cache: false,
        params: { booking: {}, res: [] },
        views: {
          'menuContent': {
            templateUrl: 'templates/booths-detail.html',
            controller: 'BoothsDetailCtrl'
          }
        }
      })

      .state('menu.legals', {
        url: '/legals',
        views: {
          'menuContent': {
            templateUrl: 'templates/legals.html',
            controller: 'LegalsCtrl'
          }
        }
      })

      .state('menu.faq', {
        url: '/faq',
        views: {
          'menuContent': {
            templateUrl: 'templates/faq.html',
            controller: 'FaqCtrl'
          }
        }
      })

      .state('menu.refer', {
        url: '/refer',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/refer.html',
            controller: 'ReferCtrl'
          }
        }
      })

      .state('menu.surveys', {
        url: '/surveys',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/surveys.html',
            controller: 'SurveysCtrl'
          }
        }

      })

      .state('menu.survey', {
        url: '/surveys/:id',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/survey-details.html',
            controller: 'SurveyDetailCtrl'
          }
        },
        resolve: {
          survey: function (Survey, $stateParams) {
            return Survey.getById($stateParams.id).then(function (s) {
              return s;
            }, function (e) {
              return [];
            });
          }
        }
      })

      .state('menu.guestlist', {
        url: '/guestlist',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/guestlist.html',
            controller: 'GuestlistCtrl'
          }
        }
      })

      .state('menu.history', {
        url: '/history',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/history.html',
            controller: 'HistoryCtrl'
          }
        }
      })

      .state('menu.listing', {
        url: '/listing/:id',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/listing-details.html',
            controller: 'ListDetailCtrl'
          }
        },
        resolve: {
          listing: function (Listings, $stateParams, $state, $q) {
            var d = $q.defer();
            Listings.getListingById($stateParams.id).then(function (s) {
              d.resolve(s);
            }, function (e) {
              d.reject(e);
              // $state.go('menu.404');
            });
            return d.promise;
          }
        }
      })

      .state('menu.404', {
        url: '/404',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/404-page.html',
            controller: 'Page404Ctrl'
          }
        }
      })

      .state('menu.tabs.home', {
        url: '/home',
        // cache:false,
        views: {
          'tab-home@menu.tabs': {
            templateUrl: 'templates/home.html',
            controller: 'HomeCtrl'
          }
        }
      })

      .state('menu.tabs.home.listing', {
        url: '/listing/:id',
        cache: false,
        views: {
          'tab-home@menu.tabs': {
            templateUrl: 'templates/listing-details.html',
            controller: 'ListDetailCtrl'
          }
        },
        resolve: {
          listing: function (Listings, $stateParams) {
            return Listings.getListingById($stateParams.id).then(function (s) {
              return s;
            }, function (e) {
              return [];
            });
          }
        }
      })

      .state('menu.favor', {
        url: '/favor',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/favor.html',
            controller: 'FavorCtrl'
          }
        }
      })

      .state('menu.team', {
        url: '/team',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/team.html',
            controller: 'TeamCtrl'
          }
        }
      })

      .state('menu.tabs.search', {
        url: '/memberships',
        cache: false,
        views: {
          'tab-search@menu.tabs': {
            templateUrl: 'templates/members.html',
            controller: 'MemberTiersCtrl'
          }
        }
      })

      .state('menu.tabs.search.tier', {
        url: '/tier/:id',
        views: {
          'tab-search@menu.tabs': {
            templateUrl: 'templates/memberTier.html',
            controller: 'TierCtrl'
          }
        },
        resolve: {
          listing: function (Listings, $stateParams) {
            return Listings.getListingById($stateParams.id).then(function (s) {
              return s;
            }, function (e) {
              return [];
            });
          }
        }
      })

      .state('menu.whats', {
        url: '/whats',
        // cache:false,
        views: {
          'menuContent': {
            templateUrl: 'templates/whatson.html',
            controller: 'WhatsOnCtrl'
          }
        }
      })

      .state('menu.food', {
        url: '/food',
        // cache:false,
        views: {
          'menuContent': {
            templateUrl: 'templates/food-beverages.html',
            controller: 'FoodCtrl'
          }
        }
      })

      .state('menu.tabs.events.listing', {
        url: '/listing/:id',
        cache: false,
        views: {
          'tab-whats@menu.tabs': {
            templateUrl: 'templates/listing-details.html',
            controller: 'ListDetailCtrl'
          }
        },
        resolve: {
          listing: function (Listings, $stateParams) {
            return Listings.getListingById($stateParams.id).then(function (s) {
              return s;
            }, function (e) {
              return [];
            });
          }
        }
      })

      .state('menu.tabs.account', {
        url: '/account',
        cache: false,
        views: {
          'tab-more@menu.tabs': {
            // templateUrl: 'templates/tabMore.html',
            // controller: 'MoreCtrl'
          }
        }
      })

      .state('menu.account', {
        url: '/account',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/more.html',
            controller: 'MoreCtrl'
          }
        }
      })

      .state('menu.profile', {
        url: '/profile',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl'
          }
        }
      })

      .state('menu.address', {
        url: '/address',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/address.html',
            controller: 'AddressCtrl'
          }
        }
      })

      .state('menu.email', {
        url: '/email',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/emailUpdate.html',
            controller: 'EmailCtrl'
          }
        }
      })

      .state('menu.tabs.account.profile', {
        url: '/profile',
        cache: false,
        views: {
          'tab-more@menu.tabs': {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl'
          }
        }
      })

      .state('menu.tabs.account.address', {
        url: '/address',
        cache: false,
        views: {
          'tab-more@menu.tabs': {
            templateUrl: 'templates/address.html',
            controller: 'AddressCtrl'
          }
        }
      })
      .state('menu.tabs.account.email', {
        url: '/email',
        cache: false,
        views: {
          'tab-more@menu.tabs': {
            templateUrl: 'templates/emailUpdate.html',
            controller: 'EmailCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/menu/tabs/home');

    //register the Interceptor
    $httpProvider.interceptors.push([
      '$injector',
      function ($injector) {
        return $injector.get('AuthInterceptor');
      }
    ]);
    // $httpProvider.defaults.timeout = 8000;

    $ionicConfigProvider.tabs.position('bottom');
  });