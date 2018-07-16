angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $rootScope, $ionicLoading, $http, $ionicSlideBoxDelegate, $state, $location, $timeout, $ionicPopup, $sce, AuthService, Members, MenuBadge, LikeListing, FavoriteListing, API_URI, APP_KEY, MsgService, $ionicPlatform, NotificationService, Layout) {
    //verify the login status when url changed
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      console.log(fromState.name, toState.name, toParams, fromParams);
      // if(!AuthService.isAuthenticated()&&(toState.name=='login' || toState.name=='signup' || toState.name=='resetpassword')){
      //   return;
      // }

      //add listener to title
      $timeout(function () {
        var titles = document.querySelectorAll('.title.title-center.header-item');
        // console.log(titles);
        for (var i = 0; i < titles.length; i++) {
          titles[i].addEventListener('click', function (event) {
            $state.go('menu.tabs.home');
          });
        }
      }, 500);

      //if user login and go to 'login', 'signup', 'resetpassword' view
      if (AuthService.isAuthenticated() && ['login', 'signup', 'resetpassword'].includes(toState.name)) {
        // console.log(toState.name);
        event.preventDefault();
        return;
      }
      // if no user login and go view other than 'login', 'signup', 'resetpassword'
      if (!(window.localStorage.getItem('CURRENT_USER') && AuthService.isAuthenticated()) && !['login', 'signup', 'resetpassword'].includes(toState.name)) {
        // console.log('herein');
        event.preventDefault();// cancel request route
        $state.go('login');//return to login page
        return;
      }

      if (AuthService.isAuthenticated() && toState.name != 'menu.tabs.home' && typeof $rootScope.layout == 'undefined') {
        // console.log('herein');
        $state.go('menu.tabs.home');
        return;
      }

      //record user behavors
      // $ionicPlatform.ready(function(){
      //   var db = window.sqlitePlugin.openDatabase({name: 'my.db', location: 'Library'});
      //
      //   console.log('$cordovaSQLite:',$cordovaSQLite.openDB({name: 'my.db'}));
      //
      //   window.sqlitePlugin.selfTest(function(){
      //     alert('success');
      //   }, function(){
      //     alert('fail');
      //   });
      // });

      if (fromState.name == 'menu.profile') {
        console.log($location.search());
        if ($location.search().dirty == 'true') {
          event.preventDefault();
          var options = {
            title: '',
            cssClass: 'item-confirm',
            tpl: 'Do you want to save the Data?',
            successCallBack: function () {
              $rootScope.$broadcast('saveProfile', {});
              $state.go(toState.name);
            },
            failCallBack: function () {
              $state.go(toState.name);
            },
          };
          $rootScope.createConfirmPop(options);
        }
      }

      if (toState.name == 'menu.tabs.home') {
        NotificationService.get().then(function (s) {
          $rootScope.messages = s;
        }, function (e) {
          console.log(e);
        });
        $timeout(function () {
          $ionicSlideBoxDelegate.update();
          $ionicSlideBoxDelegate.start();

          var buttonElements = angular.element(document.getElementsByClassName('home-btn'));
          var ratio = 1;
          console.log(buttonElements);
          if(buttonElements.length>0){
            buttonElements.css('height', buttonElements[0].clientWidth / ratio);
          }
        });

      }

      if (toState.name == 'menu.contact') {
        console.log(toState, toParams);
        $timeout(function () {
          // toState.views.menuContent = {};
          toState.views.menuContent.templateUrl = 'templates/contact.html';
          toState.views.menuContent.controller = 'ContactCtrl';
          toParams.data = 123;
        });
      };


      // $timeout(function(){
      //   console.log(event);
      //   window.ga.trackView(toState.name,'', true);
      // });


      // if(toState.name == 'menu.tabs.card'){
      //   // console.log('menu.tabs.card');
      //   if (angular.isUndefined($rootScope.member.member) || !$rootScope.member.member.bepoz_account_card_number){
      //     event.preventDefault();
      //   }
      // }

    });


    function init() {
      if (window.localStorage.getItem('CURRENT_USER') && AuthService.isAuthenticated()) {
        if (current_user = JSON.parse(window.localStorage.getItem('CURRENT_USER'))) {
          $rootScope.user = current_user;
        }

        Members.getMember().then(function (member) {
          //load member details
          $rootScope.member = member.data.data;
          console.log($rootScope.member);

          //update push notification active email
          if (!angular.isUndefined(window.plugins)) {
            window.plugins.OneSignal.sendTag("email", $rootScope.member.email);
          }

          Layout.getLayout().then(function (r) {
            console.log(r);
            $rootScope.layout = r;
            $rootScope.$broadcast('LayoutReady', {});
          }, function (e) {
            $rootScope.layout = {};
            console.log(e);
          });
          //send out broadcast
          $rootScope.$broadcast('UserReady', {});
          console.log("user init");

        }, function (e) {
          console.log(e);
        });
      }
    }


    $rootScope.getViewUrl = function (view) {

      var state = {};
      // is Tab view
      var tabs = $rootScope.layout.tabs.filter(function (tab) {
        return tab.page_name === view.page_name;
      });
      console.log(tabs);
      if (tabs.length > 0) {
        switch (tabs[0].id) {
          case 1:
            state = { stateName: 'menu.tabs.home', url: '#/menu/tabs/home' };
            break;
          case 2:
            state = { stateName: 'menu.tabs.whatson', url: '#/menu/tabs/whatson' };
            break;
          case 3:
            state = { stateName: 'menu.tabs.tickets', url: '#/menu/tabs/tickets' };
            break;
          case 4:
            state = { stateName: 'menu.tabs.time-location', url: '#/menu/tabs/time-location' };
            break;
          case 5:
            state = { stateName: 'website', url: $rootScope['layout']['tabs'][4].special_link };
            break;
          default:
            state = {};
        }
        // if(tabs[0].id == 1){
        //   return {stateName:'menu.tabs.home', url:'#/menu/tabs/home'}
        // }else {
        //   return {stateName:'menu.tabs.tab'+tabs[0].id, url:'#/menu/tabs/tab'+tabs[0].id+'/'+tabs[0].id}
        // }
      }
      else {
        if (view.page_layout == 'special_view') {
          switch (view.special_page) {
            case 'ticket':
              state = { stateName: 'menu.tickets', url: '#/menu/tickets' };
              break;
            case 'voucher':
              state = { stateName: 'menu.vouchers', url: '#/menu/vouchers' };
              break;
            case 'location':
              state = { stateName: 'menu.time-location', url: '#/menu/time-location' };
              break;
            case 'promotions':
              state = { stateName: 'menu.promotions', url: '#/menu/promotions' };
              break;
            case 'website':
              state = { stateName: 'website', url: 'https://www.bepoz.com.au/' };
              break;
            default:
              state = {}
          }
        }
        else{
          switch (view.page_name) {
            case 'Promotions':
              state = { stateName: 'menu.promotions', url: '#/menu/promotions' };
              break;
            default:
              state = {}
          }
        }
      }

      return state;
    }

    $rootScope.openDynamicButton = function (button) {
      console.log(button);
      if (button[0].type == 'url') {
        var url = /^https?:\/\//.test(button[0].url) ? button[0].url : 'http://' + button[0].url;
        console.log(url);
        window.open(url, '_system');
      }
      if (button[0].type == 'listing') {
        $state.go('app.listings', { id: button[0].listing_id });
      }

    }

    $rootScope.$on('UserInit', function (event, data) {
      init();
      $rootScope.badges = MenuBadge.getBadges();
    });

    //refresh badges numbers
    $rootScope.$on('LoadBadges', function (event, data) {
      console.log('LoadBadges');
      $rootScope.badges = MenuBadge.getBadges();
    });

    init();
    $rootScope.badges = MenuBadge.getBadges();

    //logout
    $rootScope.logout = function () {
      AuthService.logout();
      $rootScope.member = {};
      $rootScope.user = {};
      // $state.go('login');
      if (!angular.isUndefined(window.plugins)) {
        window.plugins.googleplus.logout();
        facebookConnectPlugin.logout(function (s) {
          console.log('logout');
        }, function (e) {
          console.log('logout fail');
        });
        //clear push notification tag for this device!
        window.plugins.OneSignal.deleteTag("email");
      }

      $state.go('login');
    };

    //global functions
    $rootScope.minTicketPrice = function (tickets) {
      var prices = [];
      angular.forEach(tickets, function (ticket) {
        prices.push(Number(ticket.product.unit_price));
      });
      return Math.min.apply(null, prices);
    };

    $rootScope.minTicketPoint = function (listing) {
      var prices = [];
      angular.forEach(listing.products, function (product) {
        prices.push(Number(product.product.point_price));
      });
      return Math.min.apply(null, prices);
    };

    $rootScope.minPrice = function (listing) {
      var min = 0;
      if (listing.products.length > 0) {
        min = parseInt(listing.products[0].product.unit_price);
        angular.forEach(listing.products, function (product) {
          min = parseInt(product.product.unit_price) < min ? parseInt(product.product.unit_price) : min;
        });
      }
      return min;
    };

    $rootScope.objToArr = function (obj) {
      if (typeof obj == 'object') {
        return Object.keys(obj).map(function (k) { return obj[k] });
      } else {
        return obj;
      }
    }

    $rootScope.initPointRatio = function (mix) {
      if (mix == true) {
        $ionicLoading.show().then(function (s) {
          $ionicLoading.hide().then(function () {
            var url = API_URI + 'member/pointRatio';
            $http.get(url, { params: { token: AuthService.authToken(), app_token: APP_KEY.app_token, app_secret: APP_KEY.app_secret } }).then(function (s) {
              $rootScope.pointRatio = parseInt(s.data.data[0].value);
              console.log(s);
            }, function (e) {
              console.log(e);
            });
          })
        }, function (e) {
          $ionicLoading.hide();
        });
      }
    };

    $rootScope.createAlertPopup = function (options) {
      console.log(options);
      navigator.notification.alert(options.tpl, options.callBack, options.title, options.okText);
    };


    $rootScope.createConfirmPop = function (options) {
      // var confirmPopup = $ionicPopup.confirm({
      //   title: options.title,
      //   cssClass: options.cssClass,
      //   template: options.tpl,
      //   cancelText: 'Cancel', // String (default: 'Cancel'). The text of the Cancel button.
      //   cancelType: '', // String (default: 'button-default'). The type of the Cancel button.
      //   okText: 'Ok', // String (default: 'OK'). The text of the OK button.
      //   okType: 'button-blue', // String (default: 'button-positive'). The type of the OK button.
      // });

      // confirmPopup.then(function(res) {
      //   if(res) {
      //     options.successCallBack();
      //   } else {
      //     options.failCallBack();
      //     console.log('You are not sure');
      //   }
      // });
      var onConfirm = function (buttonIndex) {
        console.log('You selected button ' + buttonIndex);
        if (buttonIndex == 1) {
          options.failCallBack();
        }
        if (buttonIndex == 2) {
          options.successCallBack();
        }
      }

      navigator.notification.confirm(options.tpl, onConfirm, options.title, ['Cancel', 'Ok']);
    };


    $rootScope.$on('RewardPoint', function (e, d) {
      var options = {
        title: "Congratulations",
        cssClass: 'thx-msg',
        tpl: "You earn " + d.point + " Pts!",
        okText: 'OK',
        okType: 'button-blue',
        callBack: function () { }
      }
      if (parseInt(d.point) > 0) {
        $rootScope.createAlertPopup(options);
      }
    });

    // $rootScope.home = function(){
    //   $state.go('app.tab.home');
    // };


    //convert pts to integer
    $rootScope.ptsToInt = function (poits) {
      return parseInt(poits);
    }

    $rootScope.decodeJSON = function (json) {
      return JSON.parse(json);
    }

    $rootScope.show = true;

    //member barcode options setups
    $rootScope.barcodeOptions = {
      width: 1,
      height: 95,
      quite: 10,
      displayValue: false,
      font: "monospace",
      textAlign: "center",
      fontSize: 12,
      backgroundColor: "",
      lineColor: "#000"
    };

    $rootScope.pinToTop = function (listing) {
      var hasTag = false;
      angular.forEach(listing.tags, function (tag) {
        if (tag.tag.name == 'Pin to Top') {
          hasTag = true;
        }
      });
      return hasTag;
    }

    $rootScope.likelisting = function (listing) {
      $ionicLoading.show();
      if (listing.like == 0) {
        LikeListing.like(listing.id).then(function (r) {
          listing.like = 1;
          $ionicLoading.hide();
        });
      }
      else if (listing.like == 1) {
        LikeListing.dislike(listing.id).then(function (r) {
          listing.like = 0;
          $ionicLoading.hide();
        });
      }
    }

    $rootScope.favorlisting = function (listing) {
      // console.log(listing);
      $ionicLoading.show();
      if (listing.favorite == 0) {
        FavoriteListing.add(listing.id).then(function (r) {
          listing.favorite = 1;
          console.log(listing);
          $ionicLoading.hide();
        });
      }
      else if (listing.favorite == 1) {
        FavoriteListing.remove(listing.id).then(function (r) {
          listing.favorite = 0;
          $ionicLoading.hide();
        });
      }
    }

    $rootScope.isStocks = function (products) {
      var isStocks = false;
      if (angular.isDefined(products) && products.length > 0) {
        isStocks = true;
        // angular.forEach(products, function(product){
        //   if(product.product.length > 0 || !isEmptyObject(product.product)){
        //     isStocks = true;
        //   }
        // });
      }
      return isStocks;
    }

    $rootScope.isPlaceHolderImg = function (url) {
      return /placehold.it/.test(url);
    }

    $rootScope.removeMsg = function (msg) {
      MsgService.remove(msg);
      $rootScope.msgs = MsgService.get();
    }

    $rootScope.chooseTier = function () {
      $state.go('membership');
    }

    $rootScope.share = function (listing) {
      // console.log(listing);
      var options = {
        message: listing.desc_short, // not supported on some apps (Facebook, Instagram)
        subject: listing.heading, // fi. for email
        files: ['', ''], // an array of filenames either locally or remotely
        url: angular.isDefined(listing.social_links) && listing.social_links != null && angular.isDefined(listing.social_links.website) && listing.social_links.website != 'null' && listing.social_links.website != null ? listing.social_links.website : 'https://www.falhotels.com.au/',
        // chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
      };

      console.log(options);


      window.plugins.socialsharing.shareWithOptions(options, function () { console.log('success'); }, function () { console.log('fail'); });
    };

    $rootScope.highlightFirstWord = function (text) {
      return text;
      // return $sce.trustAsHtml(text.replace(new RegExp('^([^\\s]+)', 'gi'), '<span style="font-weight:bold;">$&</span>'));
    };

    $rootScope.timeParser = function (time) {
      // return new Date (new Date().toDateString() + ' ' + time)
      return moment(new Date().toDateString() + ' ' + time).format('h:mm a');
    }

  });
