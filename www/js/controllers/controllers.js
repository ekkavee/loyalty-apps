angular.module('starter.controllers')

  .controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicLoading, $timeout, $http, $ionicPopup, SocialMediaOauth, AuthService, API_URI, APP_KEY) {
    $scope.loginData = {
      email: '',
      password: ''
    };

    $scope.login = function (loginform) {
      console.log(loginform);
      $ionicLoading.show().then(function () {
        AuthService.login(loginform.email, loginform.password).then(function (data) {
          $ionicLoading.hide().then(function () {
            loginform.email = '';
            loginform.password = '';
            $rootScope.$broadcast('UserInit', {});
            $rootScope.$broadcast('updateListings', {});
            $state.go('menu.tabs.home');
          });

        },
          function (err) {
            console.log(err);
            $ionicLoading.hide();
            $rootScope.createAlertPopup({
              tpl: err.data.message,
              callBack: function () { },
              title: 'Sorry',
              okText: 'OK',
            });
            // alert(JSON.stringify(err));
          });
      });

    };

    $scope.registerUrl = function () {
      $state.go('signup', { user: $scope.loginData });
    };

    $scope.socialMediaLogin = function (SMName) {
      $ionicLoading.show();
      SocialMediaOauth.socialMediaAuth(SMName).then(function (user) {
        // alert(JSON.stringify(user));
        SocialMediaOauth.socialLogin(user).then(function (result) {
          // alert(JSON.stringify(result));
          // console.log(result);
          $rootScope.$broadcast('UserInit', {});
          $rootScope.$broadcast('updateListings', {});
          $state.go('menu.tabs.home');
          $timeout(function () {
            $ionicLoading.hide();
          }, 3000);
        }, function (error) {
          console.log(error);
          // alert(JSON.stringify(error));
          $ionicLoading.hide();
        });
      }, function (e) {
        $ionicLoading.hide();
        // alert(JSON.stringify(e));
      });
    };

    function loadLegals() {
      var url = API_URI + 'legals';
      var data = {
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.get(url, { params: data }).then(function (s) {
        $scope.legals = s.data.data;
        console.log($scope.legals);
      }, function (e) {

      });
    };

    loadLegals();

    $scope.openLegaslAlert = function (key) {
      if ($scope.legalsAlert) {
        return;
      }
      $scope.showLegal = $scope.legals[key]
      if ($scope.legals) {
        $scope.legalsAlert = $ionicPopup.alert({
          title: $scope.showLegal[0],
          scope:$scope,
          templateUrl:'templates/legas-popup.html',
          okType:'button-light'
        });

        $scope.legalsAlert.then(function(){
          delete $scope.legalsAlert;
        });
      }
    }

  })


  .controller('MenuCtrl', function ($scope, $rootScope, $state, $ionicModal, MenuBadge) {
    $scope.isBadge = function () {
      var isbadge = false;
      angular.forEach($rootScope.badges, function (item) {
        if (item > 0) {
          console.log(item);
          isbadge = true;
        }
      });
      return isbadge;
    };

    $rootScope.goSocialLink = function (url) {
      if (/www.snapchat.com/.test(url)) {
        window.open(url, '_system');
        return;
      }
      window.cordova.InAppBrowser.open(url, '_blank', 'location=no');
    }

    // $scope.loadDynaButton = function(){
    //   DynamicButton.get().then(function(s){
    //     $rootScope.dyButton = s;
    //   }, function(e){
    //     console.log(e);
    //   });
    //
    // }

    $scope.clearBadge = function (category) {
      if (angular.isUndefined($rootScope.badges[category]) || $rootScope.badges[category] == 0) {
        return
      }

      //clear badge nmeber to 0
      MenuBadge.setBadge(0 - ($rootScope.badges[category]), category);
      $rootScope.badges = MenuBadge.getBadges();
      //console.log($rootScope.badges);

    };


    $scope.go = function (view) {
      $state.go(view);
    };
  })

  .controller('PlaylistCtrl', function ($scope, $stateParams) {
  })

  .controller('SignupCtrl', function ($scope, $stateParams, $rootScope, $state, $http, $q, $ionicPopup, AuthService, API_URI, APP_KEY, Members, $ionicLoading) {
    console.log($stateParams.user);

    $scope.dateInputType = 'text';

    $scope.form = {
      email: angular.isUndefined($stateParams.user.email) ? '' : $stateParams.user.email,
      password: angular.isUndefined($stateParams.user.password) ? '' : $stateParams.user.password,
      confirm_password: '',
      first_name: '',
      last_name: '',
      mobile: '',
      dob: null
    };

    $scope.back = function () {
      $state.go('login');
    }

    $scope.changeInputToDate = function () {
      if ($scope.form.dob != null) {
        $scope.dateInputType = 'date';
      }
      else {
        $scope.dateInputType = 'text';
      }
      console.log($scope.dateInputType);
    }

    function loadVenues() {
      var url = API_URI + 'tiers';
      var data = {
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.get(url, { params: data }).then(function (s) {
        $scope.venues = s.data.data;
        if ($scope.venues.length == 1) {
          $scope.form.tier_id = $scope.venues[0].id;
        }
      });
    }

    loadVenues();

    // $scope.show = false;

    $scope.signup = function (form) {
      var uri = API_URI + 'signup';
      var data = {
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirm_password,
        first_name: form.first_name,
        last_name: form.last_name,
        mobile: form.mobile,
        dob: form.dob,
        tier_id: form.tier_id
      }
      console.log(uri);
      // $scope.show = true;
      $ionicLoading.show().then(function () {
        //do something
        $http.post(uri, data).then(function (data) {
          console.log(data);
          var user = {
            token: data.data.token,
          };
          //store current user to localstorage
          AuthService.storeUser(user);

          //empty signup form
          $scope.form = {
            email: '',
            password: '',
            confirm_password: '',
            first_name: '',
            last_name: '',
            mobile: '',
          };
          //hide loading
          $ionicLoading.hide().then(function () {
            //refresh data
            $rootScope.$broadcast('UserInit', {});
            $state.go('menu.tabs.home');
            //confirm email popup notice
            var options = {
              title: "Notice",
              cssClass: 'thx-msg',
              tpl: "Remember to check your email and click confirm to unlock all of your App features.",
              okText: 'OK',
              okType: 'button-blue',
              callBack: function () { }
            }

            $rootScope.createAlertPopup(options);
          });


        }, function (error) {
          console.log(error);
          //hide loading
          $ionicLoading.hide().then(function () {
            console.log("The loading indicator is now hidden");
          });
        });

      });
    }

    function loadLegals() {
      var url = API_URI + 'legals';
      var data = {
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.get(url, { params: data }).then(function (s) {
        $scope.legals = s.data.data;
        console.log($scope.legals);
      }, function (e) {

      });
    };

    loadLegals();

    $scope.openLegaslAlert = function (key) {
      if ($scope.legalsAlert) {
        return;
      }
      $scope.showLegal = $scope.legals[key]
      if ($scope.legals) {
        $scope.legalsAlert = $ionicPopup.alert({
          title: $scope.showLegal[0],
          scope:$scope,
          templateUrl:'templates/legas-popup.html',
          okType:'button-light'
        });

        $scope.legalsAlert.then(function(){
          delete $scope.legalsAlert;
        });
      }
    }

  })

  .controller('PasswordCtrl', function ($scope, Password, $ionicLoading, $ionicHistory, $timeout) {
    $scope.selected = 'e';
    $scope.form = {};
    $scope.msg = '';

    $scope.back = function () {
      $timeout(function () {
        $ionicHistory.goBack();
      });
    };

    $scope.resetPassword = function (selected) {
      $ionicLoading.show().then(function () {

        if (selected == "e") {
          //reset password by email
          Password.emailReset($scope.form.email).then(
            function (success) {
              console.log(success);

              $ionicLoading.hide().then(function () {
                $scope.msg = "A reset password email has been sent!";
                $scope.form = {};
              });
            }, function (error) {
              console.log(error);
              $ionicLoading.hide().then(function () {
                $scope.msg = error.data.message + " please try agian!"
                $scope.form = {};
              });
            }
          );

        }

        else if (selected == "s") {
          if ($scope.form.phone.indexOf('0') == 0) {
            $scope.form.phone = $scope.form.phone.substr(1);
            console.log($scope.form.phone);
          }
          $scope.form.phone = '61' + $scope.form.phone;
          //reset password by sms
          Password.emailSMS($scope.form.phone).then(
            function (success) {
              console.log(success);

              $ionicLoading.hide().then(function () {
                $scope.msg = "Reset password SMS has been sent!";
                $scope.form = {};
              });
            }, function (error) {
              console.log(error);
              $ionicLoading.hide().then(function () {
                $scope.msg = error.data.message + " please try agian!"
                $scope.form = {};
              });
            }
          );
        }

      });

    }
  })

  .controller('TabsCtrl', function ($scope, $rootScope, $window, $ionicModal, $timeout, $compile) {
    // load layout settings
    // $rootScope.$on('LayoutReady', function(event, data){
    //   $timeout(function(){
    //     var tabItems = angular.element(document.querySelectorAll('.main-tab-bar a.tab-item'));
    //     console.log('tabs',tabItems);
    //     var newTabItem = angular.element('<a class="tab-item" ng-click="openCard()"><i class="icon fa fa-shopping-bag"></i></a>');
    //     newTabItem.insertAfter(tabItems[3]);
    //     $compile(newTabItem)($scope);
    //   });
    // });

    $scope.getTabUrl = function (id) {
      var tab = $rootScope.layout.tabs.filter(function (tab) {
        return tab.id === id;
      })[0];

      if (id != 1) {
        return '#/menu/tabs/tab' + tab.id + '/' + tab.id;
      } else {
        var url = '';
        switch (tab.special_page) {
          case 'home':
            url = '#/menu/tabs/home';
            break;
        }

        return url;
      }
    }

    $scope.getTab = function (id) {
      var tab = $rootScope.layout.tabs.filter(function (tab) {
        return tab.id === id;
      })[0];

      return tab;

      // if(tab.page_layout != 'special_view'){
      //   return 'tab'+tab.id;
      // }else{
      //   var name = '';
      //   switch(tab.special_page){
      //     case 'home':
      //       name = 'tab-home';
      //       break;
      //   }
      //
      //   return name;
      // }
    }

    $scope.goState = function (url) {
      console.log(url);
      $window.location.href = url;
    };

    $scope.openCard = function () {
      // if (angular.isDefined($rootScope.member.member) && $rootScope.member.member.bepoz_account_card_number) {
      //   $ionicModal.fromTemplateUrl('templates/card-modal.html', {
      //     scope: $scope,
      //     animation: 'fade-in',
      //     backdropClickToClose: false,
      //   }).then(function (modal) {
      //     $scope.cardModal = modal;
      //     $scope.cardModal.show();
      //   });
      //
      //   $scope.closeModal = function () {
      //     $scope.cardModal.hide();
      //   }
      // }
      // else {
      //   var options = {
      //     title: "",
      //     cssClass: 'thx-msg',
      //     tpl: "Your membership barcode is being generated. You will be notified when it is ready.",
      //     okText: 'OK',
      //     okType: 'button-magenta',
      //     callBack: function () {
      //       $rootScope.$broadcast('UserInit', {});
      //     }
      //   }
      //
      //   $rootScope.createAlertPopup(options);
      // }

      $rootScope.goSocialLink($rootScope.layout.tabs[4].special_link);
    }

    $timeout(function () {
      var tabItems = angular.element(document.querySelectorAll('.main-tab-bar a.tab-item'));
      console.log('tabs', tabItems);
      var newTabItem = angular.element('<a class="tab-item" ng-click="openCard()"><i class="icon fa {{$root.layout.tabs[4].icon}}"></i></a>');
      newTabItem.insertAfter(tabItems[3]);
      $compile(newTabItem)($scope);
    });

  })

  .controller('ProfileCtrl', function ($scope, $rootScope, $state, $ionicHistory, Members, AuthService, $ionicLoading, $timeout, $ionicModal) {

    $scope.profile = {};
    $scope.addFields = [];

    $scope.getAddFileds = function () {
      Members.getAddFileds().then(function (f) {
        var fields = f;
        console.log(fields);
        Members.getAddFieldValues().then(function (val) {
          var values = val;
          console.log(values);

          angular.forEach(fields, function (field) {
            angular.forEach(values, function (val) {
              if (field.id === val.meta.id) {
                field.value = val.value;
                field.status = val.status;
                field.additional_field_id = field.id;
              }
              // else{
              //   field.value = null;
              // }
            })
          });
          $scope.addFields = fields;
          console.log($scope.addFields);
        }, function (e) {
          console.log(e);
        });
      }, function (e) {
        console.log(e);
      });
    };

    $scope.studentId = {
      has: false,
      obj: null,
    };

    $scope.back = function (dirty) {
      console.log(dirty);
      if (dirty) {
        var options = {
          title: '',
          cssClass: 'item-confirm',
          tpl: 'Do you want to Exit without Saving?',
          successCallBack: function () {
            // $rootScope.$broadcast('saveProfile', {});
            $timeout(function () {
              $ionicHistory.goBack();
            });
          },
          failCallBack: function () {
            // $state.go(stateName);
          },
        };
        $rootScope.createConfirmPop(options);
      } else {
        $timeout(function () {
          $ionicHistory.goBack();
        });
      }


    };

    $scope.isStudentID = function (fields) {
      var studentId = {
        has: false,
        obj: null,
      };
      // var hasStudentID = false;
      angular.forEach(fields, function (field) {
        if (field.key === 'student_id') {
          studentId.has = true;
          studentId.obj = field;
        }
      });
      return studentId;
    }

    $scope.isStudentIDValid = function (fields) {
      var studentId = $scope.isStudentID(fields);
      // alert(JSON.stringify(studentId));
      if (studentId.has) {
        if (studentId.obj.status != 'unlocked') {
          return true;
        }
        else {
          return false;
        }
      }
    }

    function init() {
      $scope.profile = {
        first_name: $rootScope.member.member.first_name,
        last_name: $rootScope.member.member.last_name,
        email: $rootScope.member.email,
        phone: $rootScope.member.member.phone,
        mobile: $rootScope.member.mobile,
        dob: $rootScope.member.member.dob ? new Date($rootScope.member.member.dob.replace(/-/g, '/')) : null,
        // wedding_day:$rootScope.member.member.wedding_day?new Date($rootScope.member.member.wedding_day.replace(/-/g, '/')):null,
      };
      // $scope.getAddFileds();
      console.log($scope.profile);
    };

    if ($rootScope.member) {
      init();
    }

    $rootScope.$on('UserReady', function (event, data) {
      init();
    });

    $scope.updateMember = function (profile) {
      $ionicLoading.show().then(function () {
        console.log(profile);
        Members.updateMemberProfile(profile).then(function (s) {
          console.log(s);
          AuthService.storeUser({ token: s.data.token });
          if ($scope.addFields) {
            $scope.saveAddFields($scope.addFields);
          }
          $rootScope.$broadcast('UserInit', {});
          $timeout(function () {
            $state.go($state.current, {}, { reload: true });
            $ionicLoading.hide();
          }, 3000);
        }, function (e) {
          console.log(e);
          $ionicLoading.hide();
        });
      });
    };

    $rootScope.$on('saveProfile', function (e, d) {
      $scope.updateMember($scope.profile);
    });

    $scope.addFields = {};

    $scope.saveAddFields = function (addFields) {
      console.log(addFields);
      Members.saveAddFields(addFields).then(function (s) {
        console.log(s);
      }, function (e) {
        console.log(e);
      });
    };

    $scope.go = function (stateName, dirty) {
      // console.log($rootScope.member.email_confirmation);
      if (stateName == 'app.email' && $rootScope.member.email_confirmation == 1) {
        return;
      }
      console.log(dirty);
      if (dirty) {
        var options = {
          title: '',
          cssClass: 'item-confirm',
          tpl: 'Do you want to Exit without Saving?',
          successCallBack: function () {
            // $rootScope.$broadcast('saveProfile', {});
            $state.go(stateName);
          },
          failCallBack: function () {
            // $state.go(stateName);
          },
        };
        $rootScope.createConfirmPop(options);
      } else {
        $state.go(stateName);
      }

    };

    $scope.openPasswordModal = function (dirty) {
      if (dirty) {
        var options = {
          title: '',
          cssClass: 'item-confirm',
          tpl: 'Do you want to Exit without Saving?',
          successCallBack: function () {
            openPasswordModal();
          },
          failCallBack: function () {
            // openPasswordModal();
          },
        };
        $rootScope.createConfirmPop(options);
      } else {
        openPasswordModal();
      }
    };

    function openPasswordModal() {
      $ionicModal.fromTemplateUrl('templates/changePassword-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.pwModal = modal;
        $scope.new_pw = {};
        $scope.pwModal.show();
      });
    };

    $scope.updatePw = function (new_password) {
      $ionicLoading.show();
      Members.updatePassword(new_password).then(function (s) {
        $rootScope.$broadcast('UserInit', {});
        var options = {
          title: "Password Updated Successfully",
          cssClass: 'thx-msg',
          tpl: '',
          okText: 'OK',
          okType: 'button-blue',
          callBack: function () {
            // $scope.closeModal();
          }
        }
        $rootScope.createAlertPopup(options);
        $scope.pwModal.hide();
      }, function (e) {
        var options = {
          title: "Oops! Something went wrong, please try again.",
          cssClass: 'thx-msg',
          tpl: e.data.message,
          okText: 'OK',
          okType: 'button-blue',
          callBack: function () {
            // $scope.closeModal();
          }
        }
        $rootScope.createAlertPopup(options);

      }).finally(function () {
        $ionicLoading.hide();
      });
    }


    $scope.goStudentIdUpload = function (dirty) {
      if ($scope.isStudentIDValid($scope.addFields)) {
        return;
      }
      console.log(dirty);
      if (dirty) {
        var options = {
          title: '',
          cssClass: 'item-confirm',
          tpl: 'Do you want to save the Data?',
          successCallBack: function () {
            $rootScope.$broadcast('saveProfile', {});
            $state.go('app.studentId');
          },
          failCallBack: function () {
            $state.go('app.studentId');
          },
        };
        $rootScope.createConfirmPop(options);
      } else {
        $state.go('app.studentId');
      }
    }
  })

  .controller('AddressesCtrl', function ($scope, $rootScope, $q, $http, $state, $ionicPopup, $ionicModal, Members) {
    $scope.addresses = {};
    $scope.edit = false;
    //pop-pu modal
    $ionicModal.fromTemplateUrl('templates/address-modal.html', {
      scope: $scope,
      animation: 'fade-in',
      backdropClickToClose: false,
    }).then(function (modal) {
      $scope.addressModal = modal;
    });

    $scope.getAddresses = function () {
      // Members.getMemberAddress().then(function(s){},function(){});
      $rootScope.$broadcast('UserInit', {});
      $rootScope.$on('UserReady', function (event, data) {
        $scope.addresses = $rootScope.member.member.member_addresses;
        console.log("$scope.addresses");
      });
    };


    $scope.editMod = function () {
      $scope.edit = true;
      $scope.place = {
        name: $rootScope.member.member.first_name + " " + $rootScope.member.member.last_name,
        type: 'Home',
      };
      console.log($scope.place.street_name);
      $scope.addressModal.title = 'New Address';
      $scope.addressModal.button = 'Add';
      $scope.addressModal.show();
    };

    $scope.closeModal = function () {
      $scope.addressModal.hide();
      $scope.edit = false;
      // if($scope.addressModal.button == 'Add'){
      //   $scope.place = {};
      // }
      $scope.place = {};
    };


    // $scope.$watch(function(){
    //   return this.details;
    // }, function(details){
    //   console.log('aaa');
    // });
    $scope.setAddress = function (event) {

      if (typeof ($scope.place.street_name) == 'object') {
        $scope.place.suburb = $scope.place.street_name.address_components[2].short_name;
        $scope.place.state = $scope.place.street_name.address_components[4].short_name;
        $scope.place.postcode = parseInt($scope.place.street_name.address_components[6].short_name);
        $scope.place.street_name = $scope.place.street_name.address_components[0].short_name + ' ' + $scope.place.street_name.address_components[1].short_name;
      } else {
        // var input = event.target;
        // console.log(input);
        // Get the predictions element
        var container = document.getElementsByClassName('pac-container');
        container = angular.element(container);

        // Apply css to ensure the container overlays the other elements, and
        // events occur on the element not behind it
        container.css('z-index', '5000');
        container.css('pointer-events', 'auto');

        // Disable ionic data tap
        container.attr('data-tap-disabled', 'true');

        // Leave the input field if a prediction is chosen
        // container.on('click', function(){
        //   input.blur();
        // });
      }
    };

    function createAddress(place) {
      Members.createMemberAddress(place).then(function (s) {
        console.log(s);
        $scope.closeModal();
        $scope.getAddresses();
      }, function (e) {
        console.log(e);
      });
    }

    $scope.editAddress = function (id) {
      $scope.edit = true;
      var currentAdd = Members.getMemberAddressById(id);
      console.log(currentAdd);
      $scope.place = {
        id: id,
        type: currentAdd.category.charAt(0).toUpperCase() + currentAdd.category.slice(1),
        name: currentAdd.recipient_name,
        unit: currentAdd.unit_number,
        suburb: currentAdd.suburb,
        postcode: parseInt(currentAdd.postcode),
        state: currentAdd.state,
        street_name: currentAdd.street,
      }
      $scope.addressModal.title = 'Edit Address';
      $scope.addressModal.button = 'Save';
      $scope.addressModal.show();
    };

    function updateAddress(place) {
      Members.updateMemberAddress(place).then(function (s) {
        console.log(s);
        $scope.closeModal();
        $scope.getAddresses();
      }, function (e) {
        console.log(e);
      });
    }

    $scope.submit = function () {
      if ($scope.addressModal.button == 'Add') {
        createAddress($scope.place);
      }
      if ($scope.addressModal.button == 'Save') {
        updateAddress($scope.place);
      }
    };

    $scope.delete = function (addressid) {

    }


    //
    //$scope.options = { types: 'geocode', country: 'au' };

    $scope.disableTap = function (event) {
      var input = event.target;

      // Get the predictions element
      var container = document.getElementsByClassName('pac-container');
      container = angular.element(container);

      // Apply css to ensure the container overlays the other elements, and
      // events occur on the element not behind it
      container.css('z-index', '5000');
      container.css('pointer-events', 'auto');

      // Disable ionic data tap
      container.attr('data-tap-disabled', 'true');

      // Leave the input field if a prediction is chosen
      container.on('click', function () {
        input.blur();
      });
    };


    $scope.getAddresses();

  })


  .controller('InterestsCtrl', function ($scope, $ionicLoading, Members, $timeout, $state) {
    // $scope.back = function(){
    //   $state.go('app.profile');
    // }

    $scope.init = function () {
      $ionicLoading.show().then(function () {
        //do something
        Members.getInterests().then(function (interests) {
          $scope.interests = interests.data;
          console.log($scope.interests);

          $timeout(function () {
            $ionicLoading.hide().then(function () {
              console.log("interests list loaded");
            });
          }, 500);

        }, function (error) {
          $ionicLoading.hide().then(function () {
            console.log("interests list fail" + error);
          });
        });

      });
    }


    $scope.updateInterest = function (member_interest_id, interest_id) {
      //console.log(member_interest_id);
      if (member_interest_id) {
        //console.log('disable '+member_interest_id);
        Members.disableInterest(member_interest_id).then(function (success) {
          $scope.init();
        }, function (error) {
          console.log(error);
          $scope.init();
        })
      } else {
        //console.log('enable '+interest_id);
        Members.enableInterest(interest_id).then(function (success) {
          $scope.init();
        }, function (error) {
          console.log(error);
          $scope.init();
        });
      }
    }
    $scope.init();

  })

  .controller('AdditionsCtrl', function ($scope, $ionicLoading, Members) {
    $scope.addFields = {};

    $scope.init = function () {
      $ionicLoading.show().then(function () {
        Members.getAddFileds().then(function (f) {
          var fields = f;
          console.log(fields);
          Members.getAddFieldValues().then(function (val) {
            var values = val;
            console.log(values);

            angular.forEach(fields, function (field) {
              angular.forEach(values, function (val) {
                if (field.id === val.meta.id) {
                  field.value = val.value;
                  field.status = val.status;
                  field.additional_field_id = field.id;
                }
                else {
                  field.value = null;
                }
              })
            })
            $ionicLoading.hide().then(function () {
              $scope.addFields = fields;
            });
          }, function (e) {
            $ionicLoading.hide().then(function () {
              console.log(e);
            });
          });

        }, function (e) {
          $ionicLoading.hide().then(function () {
            console.log(e);
          });
        });
      }, function (e) {
        $ionicLoading.hide().then(function () {
          console.log(e);
        });
      });
    };

    $scope.save = function (addFields) {
      console.log(addFields);
      Members.saveAddFields(addFields).then(function (s) {
        console.log(s);
        $scope.init();
      }, function (e) {
        console.log(e);
        $scope.init();
      });
    };

    $scope.init();

  })

  //
  //EventsCtrl
  //
  // .controller('EventsCtrl', function($scope, $rootScope, Events, Listings, $ionicLoading, moment, $timeout, eventListings, _) {
  //   $scope.events = _.sortBy(eventListings, function(eventListing){
  //     return eventListing.tags[0].tag.name;
  //   });
  //
  //   $scope.refresh = function(){
  //       //do something
  //      Listings.getListings('1').then(function(s){
  //        $scope.events = s;
  //     }, function(e){
  //       console.log(e);
  //     }).finally(function() {
  //       // Stop the ion-refresher from spinning
  //       $scope.$broadcast('scroll.refreshComplete');
  //     });
  //   };
  //
  //   // Listings.getListingTypes();
  //
  //   $scope.formatDate = function(time){
  //     return moment(time).format("ddd, DD MMM YYYY");
  //   };
  //
  //   $scope.minPrice = function(listing){
  //     var min = 0;
  //     if(listing.products.length > 0){
  //       min = parseInt(listing.products[0].product.unit_price);
  //       angular.forEach(listing.products, function(product){
  //         min = parseInt(product.product.unit_price) < min?parseInt(product.product.unit_price):min;
  //       });
  //     }
  //     return min;
  //   }
  //
  // })
  //
  // .controller('EventDetailCtrl', function($scope, $rootScope, Events, listing, $ionicModal, moment, $state, $timeout, Order, $ionicPopup, Members, MenuBadge, PaypalService, $ionicLoading, Payment) {
  //
  //   $scope.listing = listing;
  //
  //   $scope.back = function(){
  //     $timeout(function(){
  //       $state.go('app.tab.events')
  //     });
  //
  //   };
  //
  //   $scope.formatDate = function(time){
  //     return moment(time).format("ddd, DD MMM YYYY");
  //
  //   };
  //
  //   $scope.confirmOrder = function(products) {
  //     var tpl = "<p class='text-center'>Are you sure to redeem "+ products[0].product.name+"?</p>";
  //     if($scope.order.show === 'cash'){
  //       tpl = "<p class='text-center'>Are you sure to buy "+ products[0].product.name+"?</p>";
  //     }
  //
  //     var confirmPopup = $ionicPopup.confirm({
  //       title: '',
  //       cssClass: 'item-confirm',
  //       template: tpl,
  //       cancelText: 'Cancel', // String (default: 'Cancel'). The text of the Cancel button.
  //       cancelType: '', // String (default: 'button-default'). The type of the Cancel button.
  //       okText: 'Ok', // String (default: 'OK'). The text of the OK button.
  //       okType: 'button-magenta', // String (default: 'button-positive'). The type of the OK button.
  //     });
  //
  //     confirmPopup.then(function(res) {
  //       if(res) {
  //         var data = {
  //           type: $scope.order.mix?'mix':$scope.order.show,
  //           order: JSON.stringify(products),
  //           total: JSON.stringify({
  //             point:$scope.order.mix?$scope.order.pointUse:($scope.order.show == 'point'?$scope.getTotal($scope.listing.products, 'point'):0),
  //             cash:$scope.order.show == 'cash'?$scope.getTotal($scope.listing.products, 'cash'):0,
  //           }),
  //         };
  //
  //         console.log(data);
  //         createOrder(data);
  //         // redeemItem(item);
  //       } else {
  //         console.log('You are not sure');
  //       }
  //     });
  //   };
  //
  //   //Order Modal
  //   //show order Modal
  //   $scope.showOrder = function(flag){
  //     $scope.order = {};
  //     $scope.order.mix = false;
  //     $scope.redeemOnly = false;
  //     if(flag == 'cash'){
  //       $scope.order.show = 'cash';
  //
  //     }
  //     else if(flag == 'point'){
  //       $scope.order.show = 'point';
  //     }
  //     //pop-pu modal
  //     $ionicModal.fromTemplateUrl('templates/orders-modal.html', {
  //       scope: $scope,
  //       animation: 'fade-in'
  //     }).then(function(modal) {
  //       $scope.ordersModal = modal;
  //       $scope.ordersModal.show();
  //     });
  //
  //     $scope.closeModal = function(){
  //       $scope.ordersModal.hide();
  //       // $scope.selectIput = null;
  //     };
  //
  //     $scope.selectInput = {};
  //     $scope.itemSelected = function(stock){
  //       $scope.selectInput = stock;
  //     };
  //   };
  //
  //   $scope.changeOrder = function(type){
  //     if($scope.order.show != type){
  //       $scope.order.show =type;
  //       $scope.selectInput = {};
  //     }
  //   };
  //
  //   $scope.getTotal = function(products, type){
  //     var total = 0;
  //     if(products.length > 0){
  //       angular.forEach(products, function(product){
  //         var qty = 0;
  //         angular.forEach(product.product.stocks, function(stock){
  //           qty += stock.qty;
  //         });
  //
  //         if(type == 'point'){
  //           total += Number(product.product.point_price)*qty;
  //         }else{
  //           total += Number(product.product.unit_price)*qty;
  //         }
  //
  //       });
  //     }
  //     if($scope.order.mix && type ==='cash' && $scope.order.pointUse >0){
  //       total = total - $scope.order.pointUse/100;
  //       if(total < 0){
  //         total = 0;
  //       }
  //     }
  //     return total;
  //   };
  //
  //
  //   function createOrder(data){
  //
  //     $ionicLoading.show().then(function(){
  //       var msg = {};
  //       Payment.createOrder(data).then(function(s){
  //         console.log(s);
  //         //redeem
  //         if($scope.order.show == 'point'){
  //           $scope.$broadcast('ConfirmOrder', {token:s.token});
  //         }
  //         //cash/mix
  //         if($scope.order.show === 'cash'){
  //           var totalPrice = $scope.getTotal($scope.listing.products, 'cash');
  //           pay(totalPrice, s.id, s.token);
  //         }
  //
  //         //refresh member points
  //       },function(e){
  //         console.log(e);
  //         var options = {
  //           title:"",
  //           cssClass:'thx-msg',
  //           tpl:"<p class='text-center'>"+e.data.message+" <br>Please Try Again!</p>",
  //           okText:'OK',
  //           okType: 'button-magenta',
  //           callBack: function(){
  //             $scope.closeModal();
  //           }
  //         }
  //
  //         $rootScope.createAlertPopup(options);
  //       });
  //     }, function(error){
  //     }).finally(function() {
  //       $timeout(function(){
  //         $ionicLoading.hide().then(function(){
  //         });
  //       }, 1000);
  //     })
  //
  //   }
  //
  //   function pay(totalPrice, orderNO, newOrderToken){
  //     PaypalService.initPaymentUI().then(function () {
  //       PaypalService.makePayment(totalPrice, orderNO).then(function(s){
  //         console.log(s);
  //         $scope.$broadcast('ConfirmOrder', {token:newOrderToken});
  //       }, function(e){
  //         console.log(e);
  //       })
  //     }, function(error){
  //       console.log(error);
  //     });
  //   }
  //
  //   $scope.$on('ConfirmOrder', function(e, d){
  //     Payment.orderConfirm(d.token, 'confirmed').then(function(s){
  //       var options = {
  //         title:"Thank you for redeeming your "+$scope.listing.name+"!",
  //         cssClass:'thx-msg',
  //         tpl:"<p class='text-center'>Your order is being processed</p>",
  //         okText:'OK',
  //         okType: 'button-magenta',
  //         callBack: function(){
  //           Members.getMember().then(function(member){
  //             $rootScope.member = member.data.data;
  //             $scope.closeModal();
  //             MenuBadge.setBadge(1, 'orders');
  //             $rootScope.$broadcast('LoadBadges', {});
  //             // $state.go('app.tab.redeem');
  //           });
  //         }
  //       }
  //
  //       $rootScope.createAlertPopup(options);
  //     }, function(e){
  //
  //     });
  //   });
  //
  // })
  //
  .controller('RacingCtrl', function ($scope, $cordovaDevice, pdfDelegate, $timeout, $ionicLoading, $http, API_URI, APP_KEY, AuthService, FavoriteListing) {
    // $scope.pdfUrl = '';
    $scope.listings = [];
    $scope.init = function () {
      $ionicLoading.show();
      FavoriteListing.get().then(function (s) {
        $scope.listings = s;
        $ionicLoading.hide();
      }, function (e) {
        $ionicLoading.hide();
        console.log(e);
      }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.init();

    $scope.remove = function (listing) {
      FavoriteListing.remove(listing.listing.id).then(function (r) {
        $scope.listings.splice($scope.listings.indexOf(listing), 1);
      });
    }


    // $scope.pdfUrl = "https://s3-ap-southeast-2.amazonaws.com/meadows-imgs/pdf/TheWhisper.pdf";
    // $scope.pdfUrl='https://s3-ap-southeast-2.amazonaws.com/meadows-imgs/pdf/1/test.pdf';
    $scope.openPDF = function (url) {
      console.log("url: " + url);
      switch ($cordovaDevice.getPlatform()) {
        case 'Android':

          /**
           * Android devices cannot open up PDFs in a sub web view (inAppBrowser) so the PDF needs to be downloaded and then opened with whatever
           * native PDF viewer is installed on the app.
           */

          var fileURL = cordova.file.externalApplicationStorageDirectory + "local.pdf";

          var fileTransfer = new FileTransfer();
          var uri = encodeURI(url);

          fileTransfer.download(
            uri,
            fileURL,
            function (entry) {
              // $scope.data.localFileUri = entry.toURL();
              window.plugins.fileOpener.open(entry.toURL());
            },
            function (error) {

            },
            false
          );


          break;
        default:

          /**
           * IOS and browser apps are able to open a PDF in a new sub web view window. This uses the inAppBrowser plugin
           */
          var ref = window.open(url, '_blank', 'location=no,toolbar=yes,closebuttoncaption=Close PDF,enableViewportScale=yes');
          break;
      }
    }
  })

  .controller('VouchersCtrl', function ($scope, Voucher, $state, $ionicModal, moment) {
    $scope.vouchers = [];

    $scope.init = function () {
      Voucher.getVouchers().then(function (vouchers) {
        console.log(vouchers);
        $scope.vouchers = vouchers;
        //pop-pu modal
        $ionicModal.fromTemplateUrl('templates/voucher-modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          $scope.voucherModal = modal;
        });

      }, function (e) {
        console.log(e);
      }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
    };


    $scope.barcodeOptions = {
      width: 2,
      height: 100,
      quite: 10,
      displayValue: true,
      font: "monospace",
      textAlign: "center",
      fontSize: 12,
      backgroundColor: "",
      lineColor: "#000"
    };

    $scope.getVoucherByID = function (voucher_id) {
      $scope.currentVoucher = {};
      $ionicModal.fromTemplateUrl('templates/voucher-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.voucherModal = modal;
      });

      Voucher.getVoucherByID(voucher_id).then(function (v) {
        console.log(v);
        $scope.currentVoucher = v;
        $scope.voucherModal.show();
      });

    }

    $scope.showVoucher = function (index) {
      $scope.currentVoucher = {};

      angular.forEach($scope.vouchers, function (voucher) {
        if (voucher.id == index) {
          $scope.currentVoucher = voucher;
        }
      });
      $scope.voucherModal.show();


    };

    $scope.closeModal = function () {
      $scope.voucherModal.hide();
      $scope.currentVoucher = {};
    };

    $scope.formatDate = function (time) {
      return moment(time).format("ddd, DD MMM YYYY, HH:mm:ss");
    }

    $scope.init();
    //console.log('voucher init');
  })


  .controller('CropimgCtrl', function ($scope, $rootScope, $state, Upload, API_URI, APP_KEY, AuthService, $ionicLoading, $timeout, $ionicHistory) {

    $scope.img = {};
    // $scope.back = function(){
    //   $state.go('profile');
    // }

    $scope.getPicture = function (sourceType) {
      var options = {
        quality: 10,
        correctOrientation: true,
        sourceType: sourceType,
      };


      $ionicLoading.show();
      navigator.camera.getPicture(function (imgURL) {

        //crop image
        console.log(imgURL);
        $timeout(function () {
          $ionicLoading.hide();
        }, 2000);

        if (device.platform == 'Android') {
          imgURL = 'file://' + imgURL;
        }

        var options = { quality: 25 };
        /* Using cordova-plugin-crop starts here */
        plugins.crop.promise(imgURL, options).then(function (path) {
          console.log('Cropped Image Path!: ' + path);
          $timeout(function () {
            $scope.img.URL = path;
          });
        }, function (e) {
          console.log(e);
        });


      }, function (err) {
        console.log(err);
        $ionicLoading.hide();
      }, options);
    };

    $scope.cancel = function () {
      $scope.img.URL = null;
      $ionicHistory.goBack();
      // $state.go('menu.profile');
    };

    $scope.back = function () {
      $ionicHistory.goBack();
      // $state.go('app.profile');
    };

    $scope.removeProtocol = function (img) {
      console.log(device.platform);
      if (device.platform == 'iOS') {
        console.log(img.replace(/^file:\/\//, ''));
        return img.replace(/^file:\/\//, '');
      }
      return img;
    }




    // $scope.upload = function (dataUrl, name) {
    //   var dirName = $rootScope.member.member.id;
    //   console.log(dirName);
    //   var file = Upload.dataUrltoBlob(dataUrl, name);
    //   console.log(file);
    //   var policy = {
    //     // url: 'https://meadows-imgs.s3.amazonaws.com/',
    //     url:'https://meadows-imgs.s3.amazonaws.com/',
    //     data: {
    //       key: dirName+'/'+ name, // the key to store the file on S3, could be file name or customized
    //       AWSAccessKeyId: 'AKIAJBQ627RCR4JFTHFQ',
    //       acl: 'private', // sets the access to the uploaded file in the bucket: private, public-read, ...
    //       policy: "ewogICJleHBpcmF0aW9uIjogIjIwMjAtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogIm1lYWRvd3MtaW1ncyJ9LAogICAgWyJzdGFydHMtd2l0aCIsICIka2V5IiwgIiJdLAogICAgeyJhY2wiOiAicHJpdmF0ZSJ9LAogICAgWyJzdGFydHMtd2l0aCIsICIkQ29udGVudC1UeXBlIiwgIiJdLAogICAgWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsIDAsIDUyNDI4ODAwMF0KICBdCn0=", // base64-encoded json policy (see article below)
    //       signature: "5ypDFqfIt/7+3yZDetytG/vZfQI=", // base64-encoded signature based on policy string (see article below)
    //       "contents-Type": file.type != '' ? file.type : 'application/octet-stream', // contents type of the file (NotEmpty)
    //       // filename: file.name, // this is needed for Flash polyfill IE8-9
    //       file: Upload.dataUrltoBlob(dataUrl, name)
    //     }
    //   };
    //
    //   $ionicLoading.show().then(function() {
    //     //do something
    //     Upload.upload(policy).then(function (response) {
    //
    //       $timeout(function () {
    //         //upadte photo to api
    //         Members.setPhoto('https://s3-ap-southeast-2.amazonaws.com/meadows-imgs/'+dirName+'/'+ name+'?'+ new Date().getTime()).then(function(success){
    //           //hide loading
    //           $ionicLoading.hide().then(function(){
    //             console.log("The loading indicator is now hidden");
    //             $state.go('app.profile');
    //             $rootScope.$broadcast('UserInit', {});
    //             $scope.img = {};
    //           });
    //
    //         }, function(error){
    //           console.log(error);
    //           //hide loading
    //           $ionicLoading.hide().then(function(){
    //             console.log("The loading indicator is now hidden");
    //           });
    //         });
    //       });
    //
    //     }, function (response) {
    //       if (response.status > 0) $scope.errorMsg = response.status
    //           + ': ' + response.data;
    //           $ionicLoading.hide().then(function(){
    //             console.log("The loading indicator is now hidden");
    //           });
    //
    //     }, function (evt) {
    //       $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
    //     });
    //   });
    // }

    $scope.upload = function (imgUrl) {
      if (imgUrl != '') {
        console.log(imgUrl);
        // Upload.defaults.blobUrlsMaxMemory = 10000;
        Upload.urlToBlob(imgUrl).then(function (blob) {
          var data = blob;
          console.log(blob);
          $ionicLoading.show().then(function () {
            Upload.upload({
              url: API_URI + 'member/profile/photo?token=' + AuthService.authToken(),
              method: 'POST',
              data: { app_token: APP_KEY.app_token, app_secret: APP_KEY.app_secret, photo: data },
            }).then(function (s) {
              $ionicLoading.hide().then(function () {
                // $state.go('menu.profile');
                $ionicHistory.goBack();
                $rootScope.$broadcast('UserInit', {});
                $scope.img = {};
              });
            }, function (e) {
              // if (e.status > 0){
              //   $scope.errorMsg = e.status + ': ' + response.data;
              // }
              // alert(e.message);
              $ionicLoading.hide().then(function () {
                var options = {
                  title: "Sorry",
                  cssClass: 'thx-msg',
                  tpl: "<p class='text-center'>Opps! Something went wrong, please try again.</p>",
                  okText: 'OK',
                  okType: 'button-magenta',
                  callBack: function () { }
                }

                $rootScope.createAlertPopup(options);
              });
            });
          });
        }, function (e) {
          console.log(e);
          // alert("here");
        });
      }

      // $ionicLoading.show().then(function(){
      //   Upload.upload({
      //     url: API_URI +'member/profile/photo?token='+AuthService.authToken(),
      //     method: 'POST',
      //     data: {app_token:APP_KEY.app_token, app_secret:APP_KEY.app_secret, photo:data},
      //   }).then(function (s) {
      //     $ionicLoading.hide().then(function(){
      //       $state.go('app.profile');
      //       $rootScope.$broadcast('UserInit', {});
      //       $scope.img = {};
      //     });
      //   }, function(e){
      //     // if (e.status > 0){
      //     //   $scope.errorMsg = e.status + ': ' + response.data;
      //     // }
      //     $ionicLoading.hide().then(function(){
      //       console.log(e);
      //       var options = {
      //         title:"Sorry",
      //         cssClass:'thx-msg',
      //         tpl:"<p class='text-center'>Opps! Something went wrong, please try again.</p>",
      //         okText:'OK',
      //         okType: 'button-magenta',
      //         callBack: function(){}
      //       }
      //
      //       $rootScope.createAlertPopup(options);
      //     });
      //   });
      // });



    }


  })

  .controller('StudentIdCtrl', function ($scope, $rootScope, $state, $cordovaDevice, $jrCrop, Upload, API_URI, APP_KEY, AuthService, $ionicLoading, $timeout, $ionicHistory) {
    $scope.img = {};
    // $scope.back = function(){
    //   $state.go('profile');
    // }

    $scope.getPicture = function (sourceType) {
      var options = {
        quality: 10,
        correctOrientation: true,
        sourceType: sourceType,
      };
      $ionicLoading.show();
      navigator.camera.getPicture(function (imgURL) {

        //crop image
        console.log(imgURL);
        $timeout(function () {
          $ionicLoading.hide();
        }, 2000);
        // $jrCrop.crop({
        //   url: imgURL,
        //   width: 200,
        //   height: 200,
        // }).then(function(canvas) {
        //   // success!
        //   $scope.img.URL = canvas.toDataURL();
        //
        //   console.log($scope.img.URL);
        // }, function() {
        //   // User canceled or couldn't load image.
        // });

        // if($cordovaDevice.getPlatform() == 'Android'){
        //   imgURL = 'file://' + imgURL;
        // }

        $scope.img.URL = imgURL;

        // var options = { quality: 25 };
        /* Using cordova-plugin-crop starts here */
        // plugins.crop.promise(imgURL, options).then( function(path){
        //   console.log('Cropped Image Path!: ' + path);
        //   $timeout(function(){
        //     $scope.img.URL = path;
        //   });
        // }, function(e){
        //   console.log(e);
        // });


      }, function (err) {
        console.log(err);
        $ionicLoading.hide();
      }, options);
    };

    $scope.cancel = function () {
      $scope.img.URL = null;
      $state.go('app.profile');
    };

    $scope.back = function () {
      $ionicHistory.goBack();
      // $state.go('app.profile');
    };

    $scope.upload = function (imgUrl) {
      if (imgUrl != '') {
        console.log(imgUrl);
        // Upload.defaults.blobUrlsMaxMemory = 10000;
        Upload.urlToBlob(imgUrl).then(function (blob) {
          var data = blob;
          console.log(blob);
          $ionicLoading.show().then(function () {
            Upload.upload({
              url: API_URI + 'member/profile/extraPhoto?token=' + AuthService.authToken(),
              method: 'POST',
              data: { app_token: APP_KEY.app_token, app_secret: APP_KEY.app_secret, photo: data },
            }).then(function (s) {
              $ionicLoading.hide().then(function () {
                $state.go('app.profile');
                $rootScope.$broadcast('UserInit', {});
                $scope.img = {};
              });
            }, function (e) {
              // if (e.status > 0){
              //   $scope.errorMsg = e.status + ': ' + response.data;
              // }
              // alert(e.message);
              $ionicLoading.hide().then(function () {
                var options = {
                  title: "Sorry",
                  cssClass: 'thx-msg',
                  tpl: "<p class='text-center'>Opps! Something went wrong, please try again.</p>",
                  okText: 'OK',
                  okType: 'button-magenta',
                  callBack: function () { }
                }

                $rootScope.createAlertPopup(options);
              });
            });
          });
        }, function (e) {
          console.log(e);
          // alert("here");
        });
      }
    }


  })

  .controller('FacebookCtrl', function ($scope, $rootScope, $http, $state, SocialMediaReader, $timeout, $ionicLoading) {

    $scope.facebook = {};
    // window.localStorage.setItem('FACEBOOK', JSON.stringify({access_token:'EAAYj8xc8ThQBAN08VyOEP8pOmgkfaKNTRabzEaygdwqAnpHZAPPgFzof8tg2WCInTZC3sf1ty8WHbwCsd4XfgegnOUlbFr2V6ZA0ytANNmksKqACpChba4Q8ZADE7p806aW4mcEysNOXBJWoNsg2K9bTNzAxcZAuMrvEOKdy4VTezotAnTDNX', id:'107838426308080'}));
    if (window.localStorage.getItem('FACEBOOK') !== null) {
      $scope.facebook_token = JSON.parse(window.localStorage.getItem('FACEBOOK')).access_token;
    }



    $scope.init = function () {
      $ionicLoading.show().then(function () {
        SocialMediaReader.getFBfeed().then(function (res) {
          console.log(res.data);
          $scope.facebook = res.data;
          $timeout(function () {
            $ionicLoading.hide().then(function () {
              console.log("The loading indicator is now hidden");
            });
          }, 3000);
        }, function (e) {
          console.log(e);
          $timeout(function () {
            $ionicLoading.hide().then(function () {
              console.log("The loading indicator is now hidden");
            });
          }, 4000);
        });

      }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.$on('facebookInit', function (e, d) {
      console.log('facebookInit');
      $scope.init();
    });

    $scope.GotoLink = function (url) {
      window.open(url, '_system');
    };

    $scope.init();


    $scope.loadMore = function () {
      $http.get($scope.facebook.posts.paging.next).success(function (items) {
        console.log(items);
        if (items.paging === undefined) {
          $scope.facebook.posts.paging.next = '';
        } else {
          angular.forEach(items.data, function (item) {
            $scope.facebook.posts.data.push(item);
          });

          console.log($scope.facebook);
          $scope.facebook.posts.paging.next = items.paging.next;
        }

        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };
  })

  .controller('TwitterCtrl', function ($scope, $rootScope, $http, TwitterREST, $timeout, $ionicLoading, SocialAuth, AuthService) {
    // $scope.likedlistings = likedlistings;

    $scope.init = function () {
      TwitterREST.sync('').then(function (tweets) {
        $scope.tweets = tweets;
        $timeout(function () {
          $ionicLoading.hide().then(function () {
          });
        }, 3000);
      }, function (e) {
        $timeout(function () {
          $ionicLoading.hide().then(function () {
            console.log(e);
          });
        }, 3000);
      }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    $rootScope.$on('twInit', function (d) {
      $scope.init();
    });

    $scope.loadMore = function () {
      if ($scope.tweets.length > 0) {
        var maxid = $scope.tweets[$scope.tweets.length - 1].id;
        TwitterREST.sync(maxid).then(function (s) {
          console.log(s);
          angular.forEach(s, function (tweet) {
            if (tweet.id != maxid) {
              $scope.tweets.push(tweet);
            }
          });
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function (e) {
          console.log(e);
        });
      }
    };

    $scope.innapBrowser = function (value) {
      window.open(value, '_blank');
    };

    $ionicLoading.show().then(function () {
      $scope.init();
    }, function () {
      $timeout(function () {
        $ionicLoading.hide().then(function () {
        });
      }, 3000);
    });

    $scope.doLike = function (id) {
      if (window.localStorage.getItem('TWITTER') === null) {
        // console.log('here');
        SocialAuth.getTwAuth().then(function (s) {
          TwitterREST.addLike(id).then();
        }, function (e) {
        });

      } else {
        TwitterREST.addLike(id).then(function (s) {
          console.log(s);
        });
      }
    }
  })

  .controller('OrdersCtrl', function ($scope, $rootScope, Transactions, $ionicPopup, PaypalService, Members, Order) {
    $scope.orders = [];

    $scope.getOrders = function () {
      Transactions.getTransactions().then(function (s) {
        console.log(s);
        $scope.orders = s;
      }, function (e) {
        console.log(e);
      });
    };

    $scope.formatDate = function (time) {
      return moment.utc(time).local().format("DD MMM YYYY HH:mm:ss");

    }

    $scope.getItemTotal = function (item, orderType) {
      if (orderType == 'cash' || orderType == 'mix') {
        return Number(item.unit_price) * Number(item.qty);
      } else {
        return parseInt(item.point_price) * Number(item.qty);
      }
    };

    $scope.getOrders();


    $scope.payOrder = function (order) {
      console.log(order);
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm Your Order',
        cssClass: 'item-confirm',
        template: "<p class='text-center'>Are you sure to confirm this order?</p>",
        cancelText: 'Cancel', // String (default: 'Cancel'). The text of the Cancel button.
        cancelType: '', // String (default: 'button-default'). The type of the Cancel button.
        okText: 'Ok', // String (default: 'OK'). The text of the OK button.
        okType: 'button-magenta', // String (default: 'button-positive'). The type of the OK button.
      });

      confirmPopup.then(function (res) {
        if (res) {
          if (order.type == 'cash') {
            //cash Order
            var newOrderToken = order.token;
            //process payment on paypal
            pay(order.total_price, order.id, newOrderToken);
          }

          // if(order.type == 'point'){
          //   //redeem order
          //
          //   $scope.$broadcast('ConfirmOrder', {token:order.token});
          //
          // }
        } else {
          console.log('You are not sure');
        }
      });
    };

    function pay(totalPrice, orderNO, newOrderToken) {
      PaypalService.initPaymentUI().then(function () {
        PaypalService.makePayment(totalPrice, orderNO).then(function (s) {
          console.log(s);
          $scope.$broadcast('ConfirmOrder', { token: newOrderToken });
        }, function (e) {
          console.log(e);
        })
      }, function (error) {
        console.log(error);
      });
    }

    //fire order confirmation callback
    $scope.$on('ConfirmOrder', function (e, data) {
      Order.confirmOrder(data.token, 'confirmed').then(function (s) {
        console.log(s);
        //thank you msg
        var title = "Thanks for your purchasing!";
        var tpl = "<p class='text-center'>The voucher(s) will be issued</p>";

        var alertPopup = $ionicPopup.alert({
          title: title,
          cssClass: 'thx-msg', // String, The custom CSS class name
          template: tpl,
          okText: 'OK',// String (default: 'OK'). The text of the OK button.
          okType: 'button-magenta',// String (default: 'button-positive'). The type of the OK button.
        });

        alertPopup.then(function (res) {
          Members.getMember().then(function (member) {
            $rootScope.member = member.data.data;
            $scope.getOrders();
            alert('here');
          });
        });

      }, function (e) {
        console.log(e);
        //error msg
        var title = "Error";
        var tpl = "<p class='text-center'>Please check you internet connection or contact us!</p>" + e.data.message;

        var alertPopup = $ionicPopup.alert({
          title: title,
          cssClass: 'thx-msg', // String, The custom CSS class name
          template: tpl,
          okText: 'OK',// String (default: 'OK'). The text of the OK button.
          okType: 'button-magenta',// String (default: 'button-positive'). The type of the OK button.
        });

        alertPopup.then(function (res) {
          return;
        });
      });
    });
  })

  .controller('VenuesCtrl', function ($scope, Transactions) {
    $scope.venues = {};


  })

  .controller('FaqCtrl', function ($scope, FAQ) {
    $scope.init = function () {
      FAQ.getFaq().then(function (s) {
        $scope.faqs = s;
      }).finally(function () {
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.init();


  })

  .controller('EmailCtrl', function ($scope, $rootScope, $timeout, $state, $ionicLoading, Members) {
    $scope.new = {};

    $scope.updateEmail = function (form) {
      $ionicLoading.show();
      Members.updateEmail(form).then(function (s) {
        $rootScope.$broadcast('UserInit', {});
        var options = {
          title: "",
          cssClass: 'thx-msg',
          tpl: "<p class='text-center'>Email Updated Successfully</p>",
          okText: 'OK',
          okType: 'button-blue',
          callBack: function () {
          }
        }

        $scope.new = {};

        $timeout(function () {
          $ionicLoading.hide();
          $state.go('app.profile');
          $rootScope.createAlertPopup(options);
        }, 3000);

      }, function (e) {
        console.log(e);
        var options = {
          title: "Sorry",
          cssClass: 'thx-msg',
          tpl: "<p class='text-center'>Opps! Something went wrong, please try again.</p>",
          okText: 'OK',
          okType: 'button-blue',
          callBack: function () {
          }
        }
        $ionicLoading.hide();
        $rootScope.createAlertPopup(options);
      });
    }

    $scope.resendEmail = function () {
      $ionicLoading.show();
      Members.resendConfirmEmail().then(function (s) {
        var options = {
          title: "",
          cssClass: 'thx-msg',
          tpl: "<p class='text-center'>Email Successfully Sent, Please Check Your Inbox.</p>",
          okText: 'OK',
          okType: 'button-blue',
          callBack: function () {
          }
        }

        $ionicLoading.hide();
        $rootScope.createAlertPopup(options);
      }, function (e) {
        console.log(e);
        var options = {
          title: "Sorry",
          cssClass: 'thx-msg',
          tpl: "<p class='text-center'>" + e.data.message + ".</p>",
          okText: 'OK',
          okType: 'button-blue',
          callBack: function () {
          }
        }
        $ionicLoading.hide();
        $rootScope.createAlertPopup(options);
      });
    }
  })

  .controller('LegalsCtrl', function ($scope, $q, $http, $ionicScrollDelegate, $timeout, $ionicLoading, API_URI, APP_KEY, AuthService) {
    $scope.init = function () {
      var url = API_URI + 'member/legals';
      var data = {
        token: AuthService.authToken(),
        app_token: APP_KEY.app_token,
        app_secret: APP_KEY.app_secret,
      }
      $http.get(url, { params: data }).then(function (s) {
        $scope.legals = s.data.data;
        console.log($scope.legals);
      }, function (e) {

      });
    }

    $scope.init();

    $scope.groups = [
      {
        name: 'Terms and conditions',
        contents: `
        <div class="legals_page">
        <div id="page_1">


<P class="p0 ft0">The Emerson Club</P>
<P class="p1 ft0">MEMBERSHIP TERMS AND CONDITIONS</P>
<P class="p1 ft0">General terms and conditions</P>
<P class="p2 ft3"><SPAN class="ft1">1.</SPAN><SPAN class="ft2">These terms and conditions (as varied from time to time as provided for herein) set out the terms and conditions of membership with “The Emerson Club”, being the business and trading name of One 4 Five Pty Ltd (ABN 62149599851) of </SPAN><NOBR>143-145</NOBR> Commercial Rd South Yarra, VIC, 3141, telephone (03) 9825 0900 (“Promoter”).</P>
<P class="p3 ft3"><SPAN class="ft1">2.</SPAN><SPAN class="ft2">Membership entails entry into the scheme of membership described in these terms and conditions only. It does not confer on the member any interest or entitlement, whether proprietary or otherwise, in or to the business or operating entity of The Emerson Club.</SPAN></P>
<P class="p4 ft3"><SPAN class="ft1">3.</SPAN><SPAN class="ft2">Membership is at the discretion of The Emerson Club, which reserves the right to cancel any membership at any time with or without cause and with or without notice. The Emerson Club reserves the right to reject any application for membership for any reason whatsoever. Applications for membership must be performed in the manner prescribed by the Emerson Club.</SPAN></P>
<P class="p5 ft3"><SPAN class="ft1">4.</SPAN><SPAN class="ft2">Membership of The Emerson Club is personal and is only available to persons over the age of 18. The membership and benefits cannot be used by anyone apart from the individual members. Only one membership per person.</SPAN></P>
<P class="p6 ft3"><SPAN class="ft1">5.</SPAN><SPAN class="ft2">Notwithstanding the aforesaid, upon the death of a member the legal personal representative of that member may apply to The Emerson Club to request that such membership be assigned to a member of the immediate family of that member. The Emerson Club will reasonably consider any such request.</SPAN></P>
<P class="p7 ft3"><SPAN class="ft1">6.</SPAN><SPAN class="ft2">Unless cancelled or terminated earlier, membership shall be for a term of 12 months from the date of application. Membership shall automatically be renewed for a further period of 12 months upon the expiry of the initial term, or any further term (as the case may be) unless cancelled by the member prior to the date of renewal. Upon renewal a renewal fee may be payable.</SPAN></P>
<P class="p8 ft3"><SPAN class="ft1">7.</SPAN><SPAN class="ft2">The member consents to and accepts registration and processing of personal information by The Emerson Club in accordance with prevailing legislation, these membership terms and conditions and the prevailing privacy policy of The Emerson Club. This information, as well as purchase and rewards redemption information, may be used by The Emerson Club and participating businesses to administer The Emerson Club, including storage and calculation of rewards points. Members’ postal addresses, </SPAN><NOBR>e-mail</NOBR> addresses and mobile numbers may be used to send out information and offers within the framework of prevailing laws and regulations.</P>
<P class="p9 ft3"><SPAN class="ft1">8.</SPAN><SPAN class="ft2">Members have the right to inspect or correct their own personal information. Members can withdraw consent for allowing The Emerson Club to register and process their personal information. Withdrawal of consent will be treated as termination of membership with The Emerson Club.</SPAN></P>
<P class="p9 ft3"><SPAN class="ft1">9.</SPAN><SPAN class="ft2">The Emerson Club reserves the right, at any time, to verify the identity of members or applicants for membership (including an entrant’s age and place of residence) and reserves the right, in its sole discretion, to terminate without refund the membership of and/or disqualify any individual from membership who The Emerson Club has reason to believe has breached any of these terms and conditions, tampered with the entry process or engaged in any misconduct in connection with their membership. The Emerson Club must collect your Date of Birth and GEO Location when signing up for The Emerson Club App. Date of Birth is required, The Emerson Club is a licensed over 18s venue, The Emerson Club App's content is strictly 18 plus, The Emerson Club requires Identification when verifying Members via phone, The Emerson Club requires all members to be 18 plus as they are offered Birthday related prizes and promotions. GEO location is required: To determine when Members are at The Emerson Club, To render specific content when members are at The Emerson Club, To offer prizes and promotions to members at The Emerson Club, and during arrival timeframes, To offer promotions to members in the vicinity of the The Emerson Club</SPAN></P>
</div>
<div id="page_2">


<P class="p10 ft3"><SPAN class="ft1">10.</SPAN><SPAN class="ft4">A membership card will be issued as proof of membership. If enrolment is done through the internet, a membership card will only be issued to residents of Australia. In order to register rewards points and to receive personal benefits, members are personally responsible for presenting their membership card or their electronic device (such as an iPhone) on which the App is downloaded or installed. The membership card must be signed by the cardholder. Replacement cards for lost or destroyed membership cards may be provided upon provision of satisfactory proof that the card has been lost or destroyed, at a cost of $30.</SPAN></P>
<P class="p11 ft3"><SPAN class="ft1">11.</SPAN><SPAN class="ft4">In the event of misconduct with respect to a membership card or rewards program, without limiting its rights hereunder The Emerson Club reserves the right to exclude the member(s) in question from any program.</SPAN></P>
<P class="p12 ft3"><SPAN class="ft1">12.</SPAN><SPAN class="ft4">The Emerson Club reserves the right to wind up its membership scheme with a </SPAN><NOBR>one-month</NOBR> notice period to members. Any such notice will be sent by <NOBR>e-mail,</NOBR> or there will be a notice on the The Emerson Club website or App. The Emerson Club will not be responsible for any losses to the individual member which may ensue from this <NOBR>winding-up</NOBR></P>
<P class="p13 ft3"><SPAN class="ft1">13.</SPAN><SPAN class="ft4">Members can cancel their membership of The Emerson Club at any time. Cancellation must be in writing and sent to The Emerson Club. Cancellation will take immediate effect from the date on which The Emerson Club receives notice of cancellation. Cancellation of membership, on any ground, means that you can no longer use earned bonus points. No refund shall be payable in the event of cancellation of membership for any reason.</SPAN></P>
<P class="p5 ft3"><SPAN class="ft1">14.</SPAN><SPAN class="ft4">The Emerson Club reserves the right to unilaterally change the membership terms and conditions without giving further notice to the individual member. Such changes will, unless otherwise stated, take immediate effect. The Emerson Club will publish changes to the terms and conditions on its website or App. However, members are responsible for keeping themselves updated in relation to any changes to the terms and conditions. The membership terms and conditions published on the website or App are to be considered the applicable membership terms and conditions for The Emerson Club.</SPAN></P>
<P class="p14 ft1"><SPAN class="ft1">15.</SPAN><SPAN class="ft5">Employees (and their immediate families) of The Emerson Club are ineligible for membership.</SPAN></P>
<P class="p15 ft1"><SPAN class="ft1">16.</SPAN><SPAN class="ft5">In these terms and conditions:</SPAN></P>
<P class="p16 ft3"><SPAN class="ft1">(a)</SPAN><SPAN class="ft2">“Immediate family” means any of the following: spouse, </SPAN><NOBR>ex-spouse,</NOBR> <NOBR>de-facto</NOBR> spouse, child or <NOBR>step-child</NOBR> (whether natural or by adoption), parent, <NOBR>step-parent,</NOBR> grandparent, <NOBR>step-grandparent,</NOBR> uncle, aunt, niece, nephew, brother, sister, <NOBR>step-brother,</NOBR> <NOBR>step-sister</NOBR> or first cousin;</P>
<P class="p17 ft7"><SPAN class="ft1">(b)</SPAN><SPAN class="ft6">“misconduct” means unlawful or other improper conduct, behaviour which is troublesome or shows a lack of respect towards the staff, partners or venues, criminal actions or actions which are generally perceived to be immoral, unethical or contrary to these membership terms and conditions.</SPAN></P>
<P class="p18 ft0">Membership Tiers</P>
<P class="p19 ft3"><SPAN class="ft1">17.</SPAN><SPAN class="ft4">Membership are divided into tiers. At the time of publication of these terms and conditions, such tiers are “Bronze”, “Silver”, “Gold” and “Sundays - Copper”. The Emerson Club may introduce or remove tiers at any time at their discretion. If a tier is removed, then all members on that tier at the time of removal shall be transferred to another tier that is not worse off for members than the removed tier, or continue those members in the removed tier until the end of the then current term of their membership, at the election of The Emerson Club.</SPAN></P>
<P class="p20 ft3"><SPAN class="ft1">18.</SPAN><SPAN class="ft4">The membership cost of entry into each tier shall be set by The Emerson Club at its discretion and may be altered from time to time as The Emerson Club determines. Any such alteration shall apply with respect to a member from the next date of renewal of that member’s membership.</SPAN></P>
<P class="p21 ft3"><SPAN class="ft1">19.</SPAN><SPAN class="ft4">Members may upgrade to a higher tier upon request. An additional fee may be payable for such upgrade. Members may not downgrade to a lower tier other than at the time of renewal of a membership in accordance with these terms and conditions.</SPAN></P>
<P class="p22 ft7"><SPAN class="ft1">20.</SPAN><SPAN class="ft6">The Emerson Club shall determine from time to time the membership benefits conferred on members in each tier. The Emerson Club reserves the right to introduce new benefits or withdraw</SPAN></P>
</div>
<div id="page_3">


<div id="id_1">
<P class="p0 ft1">benefits as it considers fit.</P>
<P class="p23 ft7"><SPAN class="ft1">21.</SPAN><SPAN class="ft6">Details of each membership tier, including the cost of entry and the applicable benfits, shall be disclosed on The Emerson Club’s electronic device (such as an iPhone) application (App) or its website, or in such other manner as The Emerson Club decides.</SPAN></P>
<P class="p24 ft0">Rewards Points and Redemption of Rewards</P>
<P class="p25 ft3"><SPAN class="ft1">22.</SPAN><SPAN class="ft4">Members may receive rewards points for acquiring products or services from The Emerson Club. Rewards points shall be allocated by reference to the total dollar spend on products or services. The Emerson Club reserves the right to set and alter from time to time at its discretion the number of rewards points allocated for each dollar spent.</SPAN></P>
<P class="p9 ft3"><SPAN class="ft1">23.</SPAN><SPAN class="ft4">Allocation of rewards points is performed electronically, by presenting the member’s membership card or electronic device (such as an iPhone) on which the App has been downloaded and installed for scanning at the point of sale. Rewards points will not be allocated in any other way. Failure to present a membership device or electronic device at the point of sale will disentitle the member to receive an allocation of points for the particular purchase.</SPAN></P>
<P class="p26 ft3"><SPAN class="ft1">24.</SPAN><SPAN class="ft4">Rewards points earned and membership numbers are personal and cannot be transferred to another members’ bonus accounts or redeemed for cash.</SPAN></P>
<P class="p27 ft3"><SPAN class="ft1">25.</SPAN><SPAN class="ft4">Members’ rewards points balance will be available through the App or by request in writing to The Emerson Club. The Emerson Club does not warrant that any rewards points balance stated or provided to a member is complete, correct or up to date as such balance may be affected by the allocation of additional points or the redemption of rewards between the time at which the balance information is requested and the time at which it is made available.</SPAN></P>
<P class="p28 ft1"><SPAN class="ft1">26.</SPAN><SPAN class="ft5">In the event of any misuse, misconduct or breach of these terms and conditions by a member, The Emerson Club may at its discretion (and without limiting its rights generally) cancel some or all rewards points allocated to that member.</SPAN></P>
<P class="p29 ft3"><SPAN class="ft1">27.</SPAN><SPAN class="ft4">Rewards points are valid for three years (36 months) from the month in which they were earned, subject to the member maintaining their membership throughout such period. If a member’s membership is terminated, cancelled or expires then all rewards points then accrued shall be automatically invalid. After this time the rewards points will automatically become invalid and cannot be used subsequently. On redemption of rewards points, the oldest, valid rewards points will be redeemed first.</SPAN></P>
<P class="p30 ft3"><SPAN class="ft1">28.</SPAN><SPAN class="ft4">To redeem rewards points, members must have sufficient valid rewards points in their rewards points account. Rewards available to members and the number of reward points required to be redeemed to receive that reward shall be advertised through the App or such other means determined by The Emerson Club from time to time, or can be advised upon request.</SPAN></P>
<P class="p4 ft3"><SPAN class="ft1">29.</SPAN><SPAN class="ft4">The Emerson Club does not warrant that any particular reward shall be available for redemption and reserves the right to withdraw or substitute for a suitable replacement any reward. If any reward is withdrawn after being selected by a member, then that member’s rewards points shall be restored to their account. The Emerson Club reserves the right to increase or decrease the number of rewards points required to be redeemed for any particular reward.</SPAN></P>
<P class="p17 ft3"><SPAN class="ft1">30.</SPAN><SPAN class="ft4">Rewards are taken by members at their own risk. If rewards are supplied by third party suppliers, then to the maximum extent permitted by law The Emerson Club is not responsible for and members release The Emerson Club from any liability with respect to the performance, fitness for purpose, quality, function or any other similar matter of any reward supplied by such third party supplier, or for any failure on behalf of such third party supplier to supply such reward.</SPAN></P>
</div>
<div id="id_2">
<P class="p0 ft0">Membership (Benefits)</P>
</div>
</div>
<div id="page_4">


<P class="p0 ft8">Credit</P>
<P class="p31 ft3">Your preloaded credit can be redeemed on selected beverages and food at The Emerson. Beverages will be limited to our Beverage Partners, and will change seasonally. You also may use your credit on food purchased from the A la carte menu. Your credit may also be used on booth bookings and bottle service, on any level at The Emerson. Your credit can not be used on functions, function food or function beverages.</P>
<P class="p32 ft8">Beverage Discount</P>
<P class="p31 ft3">Your discount entitlement cannot be used in conjunction with your credit. Once you have exhausted your allocated credit, your purchase of selected partnered <NOBR>alcohol/non-alcoholic</NOBR> drinks will automatically have discount applied. Discount cannot be used in conjunction with any other promotion, for example, Friday <NOBR>after-work</NOBR> drinks, cocktail specials, happy hours etc.</P>
<P class="p32 ft8">Food Discount</P>
<P class="p33 ft7">Food discount only applies to food purchased from the A la carte menu. Food discount does not apply to functions and function food.</P>
<P class="p24 ft8">Booth Discount</P>
<P class="p34 ft3">Booth discount applies to all Ultra Members on any booth booked at The Emerson, on any level – Club, VIP or Rooftop. Discount will apply to the minimum spend when booking the booth. For example, if you book a booth with a $2,000 minimum spend you’ll only need to <NOBR>pre-pay</NOBR> $1,800, and still get $2,000 worth of food and/or beverages. Drink and food discounts will still apply to the total bill. There may be blackout periods throughout the year where booths may not be available, please check the Membership App, website, or contact The Emerson Office for dates.</P>
<P class="p32 ft8">Entry to The Emerson</P>
<P class="p35 ft3">All members will get priority and free entry to The Emerson, dependent on your Membership Level. You will be required to show your valid membership upon entry, either via the Membership App or membership card. There may be times when The Emerson is closed to the public for private functions. The Emerson reserves the right to refuse entry if the member does not meet the requirements of entry.</P>
<P class="p36 ft8">Guest Entry to The Emerson</P>
<P class="p37 ft3">For Premium and Ultra Members, you may also get priority and/or free access to The Emerson for a guest, and/or number of guests. Guests must be with you upon entry, when you show your valid membership. Alternatively, you may create a guest list via the Membership App which your guests will be sent a notification and valid unique barcode to show upon entry. Barcodes can only be used once. The Emerson reserves the right to refuse entry if the guest does not meet entry requirements.</P>
<P class="p32 ft8">Guest List Discount</P>
<P class="p38 ft7">All members can create guest lists via your Membership App. Guests will receive a notification of your invitation. Guests of Premium and Ultra members will receive a $5 discount on entry with a valid barcode. Barcodes are unique and can only be redeemed once.</P>
</div>
<div id="page_5">


<div id="id_1">
<P class="p0 ft8">VIP Cocktail Bar and Lounge ‘The VIP Bar’</P>
<P class="p39 ft3">All Ultra Members will have guaranteed access for themselves and 3 guests to the members only VIP Bar located on Level 1 at The Emerson. You must show your valid membership on arrival to The Emerson to gain access. There may be times when The VIP Bar is closed for private functions. When and if this happens, all members will be notified in advance. The Emerson reserves the right to refuse entry if the member or guest does not meet entry requirements.</P>
<P class="p40 ft3">All Premium Members will have access to the VIP Bar for themselves and 1 guest, however, bookings must be made in advance. To book, please submit an enquiry via the Membership App or alternatively please contact The Emerson Office directly. The Emerson reserves the right to refuse entry if the member does not meet the requirements of entry.</P>
<P class="p32 ft8">Private Car Pickup</P>
<P class="p39 ft3">All car pickups must be organised in advance by completing the Car Pickup Request on the Membership App or by calling The Emerson Office directly. The Emerson Office will then be in contact with you directly to organise your chauffer. All pickups must be requested before 7pm on the day of the required pick up. Chauffeured pickups will only be taken to The Emerson, <NOBR>141-145</NOBR> Commercial Road, South Yarra. Pickups are dependent on availability, location and are only available for groups up to 12.</P>
<P class="p41 ft8">Member Only Events</P>
<P class="p42 ft3">All members are invited to exclusive member only events. If you are unable to attend these events, you will not be reimbursed. Some events may have a ticket cost associated. You may use your membership credit or points to pay for this. If you don’t have enough credit or points, you’re able to split payment and pay the difference. Book your tickets through the Membership App in advance to confirm attendance.</P>
<P class="p43 ft7">Premium and Ultra Members will also receive invitations to four personal development events over the course of 12 months. These personal development events are free of charge, however, spaces are limited and must be booked via the Membership App.</P>
<P class="p18 ft8">The Emerson Events</P>
<P class="p44 ft3">Premium and Ultra Members will receive discounts to public events held at The Emerson. Discounts will vary for each event, and must be booked via the Membership App to deduct discount. Ultra Members will also have access to <NOBR>pre-sale</NOBR> tickets via the Membership App and will be advised when these are available via notifications through the app.</P>
<P class="p32 ft8">Birthday Vouchers</P>
<P class="p45 ft3">As a Premium or Ultra Member, you will receive a $100 birthday voucher to use on the closest weekend of your birthday at The Emerson, valid before 9pm. Vouchers can be redeemed on selected beverages and food at The Emerson. Drink and food discounts do not apply. Vouchers can only be redeemed by you, with your valid membership.</P>
</div>
<div id="id_2">
<P class="p0 ft8">Birthday Extras for Ultra Members</P>
</div>
</div>
<div id="page_6">


<P class="p46 ft3">As an Ultra Member, you’ll also receive one night’s accommodation, for a maximum of 2 people, during the closest weekend of your birthday at The Cullen, 164 Commercial Rd, Prahran, VIC, 3181. To book your accommodation, you must contact The Emerson Office. Bookings are subject to availability, please request your bookings as far in advance as possible. There may be blackout periods, at which point The Emerson will endeavour to allocate another suitable date.</P>
<P class="p47 ft7">You’ll also receive dinner on us, for you and a guest, on the weekend closest to your birthday with one of our partner restaurants. To book your dinner, you must contact The Emerson Office. Bookings are subject to availability, please request your bookings as far in advance as possible.</P>
</div>
        </div>
      `
      },
      // {
      //   name:'Refund policy',
      //   contents:""
      // },
      {
        name: 'Privacy and security policy',
        contents: `
      <div class="legals_page">
      <div id="page_1">


<P class="p0 ft0">Privacy Policy</P>
<P class="p1 ft1">THE EMERSON CLUB</P>
<P class="p1 ft1">PRIVACY COLLECTION STATEMENT AND PRIVACY POLICY</P>
<P class="p1 ft1">PRIVACY COLLECTION STATEMENT</P>
<P class="p2 ft2">This Privacy Collection Statement is made by One 4 Five Pty Ltd trading as The Emerson Club (ABN: 62 149 599 851) of <NOBR>143-145</NOBR> Commercial Road, South Yarra, Victoria, 3141 (“The Emerson Club”, “we”, “us” or “our”). This Privacy Collection Statement is to provide you with a general overview about the collection and use of your personal information. For further details, please see our Privacy Policy.</P>
<P class="p3 ft0">Reasons for collection</P>
<P class="p4 ft2">We collect your personal information for various reasons, including to: provide you with news, event details, ticket deals and other special offers; market products and services to you; and</P>
<P class="p0 ft1">comply with our legal, moral and social obligations.</P>
<P class="p5 ft0">Consent</P>
<P class="p6 ft2">By providing us with your personal information, you give us your express consent to exchange your personal information with our related bodies corporate, agents and contractors (such as call centres and third party suppliers), some of whom reside outside of Australia. If you provide us with personal information about another person (such as an additional family member), please make sure that you tell that person about this privacy statement. To access any personal information that we hold about you, call us on 03 9825 0900.</P>
<P class="p5 ft0"><NOBR>Opt-out</NOBR></P>
<P class="p7 ft2">If you no longer want to receive communications from us, you may request to <NOBR>opt-out</NOBR> from receiving such marketing communication by contacting us on 03 9825 0900 or by emailing us at info@theemerson.com.au. We will not charge you for any request to <NOBR>opt-out</NOBR> and will process your request as soon as reasonably practicable.</P>
<P class="p8 ft0">PRIVACY POLICY</P>
<P class="p9 ft0">THE EMERSON CLUB PRIVACY POLICY</P>
<P class="p10 ft3">The Emerson Club is committed to protecting the privacy and personal information of its customers, members and subscribers. This Privacy Policy describes the practices and processes we have in place to properly manage and safeguard that information.</P>
<P class="p11 ft0">PRIVACY LAWS THAT APPLY TO THE EMERSON CLUB</P>
<P class="p12 ft2">The Emerson Club is required to comply with the Privacy Act 1988 (Cth) and is bound by the Australian Privacy Principles (‘APPs’) set out in that Act. The APPs establish minimum standards for the collection, use, disclosure and handling of personal information. They apply to personal information in any form, including electronic and digital form. The APPs can be accessed at the website of the office of the Australian Information Commissioner: www.privacy.gov.au.</P>
<P class="p13 ft2">The Emerson Club is also subject to other laws relating to the protection of personal information. Amongst other things, the Emerson Club’s direct marketing activities must also comply with the Do Not Call Register Act 2006 (Cth) and the Spam Act 2010 (Cth)</P>
<P class="p0 ft1">In this Privacy Policy, unless the context otherwise requires:</P>
<P class="p0 ft1">‘Privacy Law’ refers to any legislative or other legal requirement that applies to The Emerson Club’s</P>
</div>
<div id="page_2">


<P class="p0 ft1">collection, use, disclosure or handling of personal information;</P>
<P class="p14 ft2">‘Personal information’ means information or an opinion about an identified individual or an individual who is reasonably identifiable, whether the information or opinion is true or not and whether the information or opinion is recorded in material form or not. Personal information includes sensitive information; and</P>
<P class="p15 ft2">‘Sensitive information’ means personal information about an individual’s racial or ethnic origin, political opinions or memberships, religious beliefs or affiliations, philosophical beliefs, professional or trade association/union memberships, sexual preferences and practices or criminal record. It also includes information about a person’s health and medical history.</P>
<P class="p8 ft0">SENSITIVE INFORMATION</P>
<P class="p16 ft2">If it is reasonably necessary in the circumstances, The Emerson Club may also collect sensitive information.</P>
<P class="p17 ft3">Sensitive information is afforded a higher level of privacy protection than other personal information. Where you provide sensitive information to The Emerson Club, you also provide consent to us collecting it in accordance with this Privacy Policy, unless you tell us otherwise.</P>
<P class="p18 ft0">WHY DOES THE EMERSON CLUB COLLECT PERSONAL INFORMATION?</P>
<P class="p19 ft2">The Emerson Club collects personal information in order to carry out its functions, including to provide you with requested products and services, news, special offers and other information that you requested as well as to facilitate the provisions of marketing and promotional services that may be of interest to you.</P>
<P class="p20 ft2">The Emerson Club uses personal information only for the purposes for which it was provided and for directly related purposes (unless otherwise required by or authorised under law). We may state a more specific purpose at the point we collect your information.</P>
<P class="p21 ft3">If you do not provide us with the information that we request, we may not be able to provide you with our products or services.</P>
<P class="p22 ft2">The Emerson Club must collect your Date of Birth and GEO Location when signing up for The Emerson Club App:</P>
<P class="p8 ft1">Date of Birth is required:</P>
<P class="p9 ft1"><SPAN class="ft1">1)</SPAN><SPAN class="ft4">The Emerson Club is a licensed over 18s venue</SPAN></P>
<P class="p9 ft1"><SPAN class="ft1">2)</SPAN><SPAN class="ft4">The Emerson Club App's content is strictly 18 plus</SPAN></P>
<P class="p9 ft1"><SPAN class="ft1">3)</SPAN><SPAN class="ft4">The Emerson Club requires Identification when verifying Members via phone</SPAN></P>
<P class="p23 ft3"><SPAN class="ft1">4)</SPAN><SPAN class="ft5">The Emerson Club requires all members to be 18 plus as they are offered Birthday related prizes and promotions</SPAN></P>
<P class="p24 ft1">GEO location is required:</P>
<P class="p9 ft1"><SPAN class="ft1">1)</SPAN><SPAN class="ft4">To determine when Members are at The Emerson Club</SPAN></P>
<P class="p9 ft1"><SPAN class="ft1">2)</SPAN><SPAN class="ft4">To render specific content when members are at The Emerson Club</SPAN></P>
<P class="p9 ft1"><SPAN class="ft1">3)</SPAN><SPAN class="ft4">To offer prizes and promotions to members at The Emerson Club, and during arrival timeframes</SPAN></P>
<P class="p9 ft1"><SPAN class="ft1">4)</SPAN><SPAN class="ft4">To offer promotions to members in the vicinity of the The Emerson Club</SPAN></P>
<P class="p1 ft0">WHOSE PERSONAL INFORMATION DOES THE EMERSON CLUB COLLECT?</P>
<P class="p25 ft2">The Emerson Club collects or holds personal information about individuals who are: people we think may be interested in our products and services as well as people who have expressed interest in obtaining or learning more about those products and services; and</P>
<P class="p26 ft3">people who previously requested The Emerson Club products or services or who are followers of The Emerson Club.</P>
</div>
<div id="page_3">


<P class="p27 ft2">The Emerson Club may collect personal information about associates of its customers, such as family members, employees or agents. For example, we may collect personal information about nominated or authorised representatives, or the holder of a credit card that is used to pay for a service(s).</P>
<P class="p28 ft2">The Emerson Club may in rare circumstances collect personal information from people who are under the age of 18. If The Emerson Club does this, The Emerson Club may also collect personal information about the parent or guardian of that person.</P>
<P class="p29 ft2">The Emerson Club also collects personal information about all the individuals who are involved in providing us with products and services. This includes:</P>
<P class="p30 ft3">staff of The Emerson Club entities and associated clubs or venues; and service providers and suppliers, agents and affiliates, and their staff.</P>
<P class="p24 ft0">CAN YOU DEAL WITH THE EMERSON CLUB WITHOUT IDENTIFYING YOURSELF?</P>
<P class="p31 ft2">In some limited situations, individuals may be able to deal with The Emerson Club anonymously or using a pseudonym. For example, if you make a general inquiry, or want to make a complaint (unless the inquiry or complaint relates to a particular person). However, if you do not wish to be identified we may not be able to provide the information or assistance you require.</P>
<P class="p8 ft0">WHAT PERSONAL INFORMATION DOES THE EMERSON CLUB USUALLY COLLECT?</P>
<P class="p32 ft2">The Emerson Club collects a wide range of personal information about its customers, but the type and amount of information collected depends on the particular context. However, The Emerson Club seeks at all times to ensure that it only collects the personal information that is necessary for the purposes of its business activities. The Emerson Club needs to collect basic identifying and contact information for all subscribers. This will usually include name, date of birth, email address, telephone number(s) and residential address.</P>
<P class="p15 ft2">The Emerson Club also collects information about purchasing patterns, consumer preferences and attitudes from prospective attendees for marketing purposes, including to analyse markets, develop marketing strategies and to identify and develop products and services that may be of interest to its customers.</P>
<P class="p33 ft1">We also collect information about the way our customers use The Emerson Club products and services. This includes information about:</P>
<P class="p34 ft2">product and service usage; club affiliations;</P>
<P class="p0 ft1">event participation;</P>
<P class="p35 ft2">responses to offers made and/or promotions run by The Emerson Club or its affiliates; and inquiries and complaints.</P>
<P class="p36 ft2">We collect information about our employees and prospective employees for the purpose of making employment decisions and managing our staff. We also collect information about suppliers, service providers, agents and affiliates, and their staff, for the purposes of conducting our <NOBR>day-to-day</NOBR> business activities.</P>
<P class="p37 ft0">HOW DOES THE EMERSON CLUB COLLECT PERSONAL INFORMATION?</P>
<P class="p38 ft1">Information may be collected when you:</P>
<P class="p9 ft1">subscribe to any guest list;</P>
<P class="p39 ft2">subscribe to any publication of The Emerson Club, including electronic publications and social media; provide details to The Emerson Club in an application, consent form, competition, survey, feedback form or incident report;</P>
<P class="p40 ft2">enter personal information into, or agree to having your personal information entered into, one of The Emerson Club online systems or by completing a form at an activation site;</P>
<P class="p41 ft2">contact The Emerson Club via email, telephone or mail or engage with The Emerson Club via social media;</P>
<P class="p0 ft1">participate in any program, activity, competition or event run by The Emerson Club;</P>
</div>
<div id="page_4">


<P class="p42 ft2">purchase a service(s) from The Emerson Club or an authorised agent or licensee; are elected or appointed to the Board or a committee of The Emerson Club; or apply for employment or a volunteer position with The Emerson Club.</P>
<P class="p43 ft2">Personal information may also be collected where The Emerson Club is required to do so by law (for education, child protection, work health and safety laws, charitable collections, medical treatment or other legislation in Australia).</P>
<P class="p0 ft1">Providing information</P>
<P class="p44 ft2">If you do not provide some or all of the information that we request from you, this may affect our ability to communicate with you or provide the requested products or services.</P>
<P class="p45 ft2">By not providing requested information, you may jeopardise your ability to participate in programs or competitions or apply for employment or volunteer positions with The Emerson Club. If it is impracticable for The Emerson Club to deal with you as a result of you not providing the requested information or consent, we may refuse to do so.</P>
<P class="p0 ft1">Collection from third parties</P>
<P class="p46 ft2">In some circumstances, The Emerson Club collects information from other third parties. Information storage and protection</P>
<P class="p47 ft2">The Emerson Club stores information in different ways, including in paper and electronic form. Much of the information we collect from and about our subscribers and from or about people who register their interest in The Emerson Club is added to one of our databases. When your information is entered into our database, the information may be combined or linked with other information held about you.</P>
<P class="p48 ft2">Security of your personal information is important to The Emerson Club. The Emerson Club has taken steps to protect the information we hold from misuse, loss, unauthorised access, modification or disclosure. Some of the security measures we use includes strict confidentiality requirements of our employees, contractors, agents, volunteers, service providers, suppliers, security measures for system access, and security measures for our website and venue.</P>
<P class="p49 ft6">WHAT INFORMATION WILL THE EMERSON CLUB GIVE YOU WHEN IT COLLECTS YOUR PERSONAL INFORMATION?</P>
<P class="p50 ft2">The Emerson Club is required by Privacy Law to take reasonable steps to ensure that you are made aware of certain information when it collects personal information about you. For example, we are required to:</P>
<P class="p0 ft1">tell you which entity you are dealing with and how to contact it;</P>
<P class="p40 ft2">make sure you are aware that we have collected the information (if we collect it from a third party without your knowledge);</P>
<P class="p0 ft1">identify any law that authorises or requires collection of the information;</P>
<P class="p39 ft2">let you know the purpose(s) for which we collect the information, the entities that the information is likely to be disclosed to and whether the information will be transferred outside Australia; and</P>
<P class="p47 ft2">tell you how to access our Privacy Policy and complaint handling procedures. This Privacy Policy sets out this information in general terms. However, where we collect personal information in relation to a particular product or service, and the information we are required to provide is not likely to be obvious from the circumstances, we usually provide the required information in a ‘collection statement’. The way we do this will depend on how you are dealing with us.</P>
<P class="p0 ft1">For example:</P>
<P class="p51 ft2">when personal information is collected via The Emerson Club website or any affiliate website that The Emerson Club may advertise on, a statement is displayed or a link provided to a statement that sets out the information we are required to provide;</P>
<P class="p52 ft2">a statement containing the required information is printed on the <NOBR>sign-up</NOBR> page of most of the standard forms we use to collect personal information; and</P>
<P class="p53 ft3">when you deal with us on the telephone, this information is given to you by the operator or via a recorded message. If we collect personal information about you from a third party, we take</P>
</div>
<div id="page_5">


<P class="p29 ft2">reasonable steps to ensure you receive the information we are required to provide. However, we may do this by requiring the third party to provide the information, rather than us providing the information to you directly. We may also include information about our collection of personal information in notices and other documents we give to our customers, followers, and members.</P>
<P class="p5 ft0">THE EMERSON CLUB’S USE AND DISCLOSURE OF PERSONAL INFORMATION</P>
<P class="p9 ft1">Use</P>
<P class="p54 ft2">The Emerson Club, and third parties to whom we may disclose personal information in accordance with this Privacy Policy, may collect, hold and use your personal information to:</P>
<P class="p55 ft2">verify your identity; complete background checks;</P>
<P class="p40 ft2">research, develop, run, administer and market competitions, programs, activities and other events relating to our services and offerings;</P>
<P class="p51 ft2">research, develop and market products, services, merchandise and special offers made available by us and third parties, licensees, suppliers and sponsors;</P>
<P class="p0 ft1">respond to emergency situations involving or requiring medical treatment;</P>
<P class="p56 ft2">keep you informed of news and information relating to various events, activities and opportunities via various mediums.</P>
<P class="p57 ft2">The Emerson Club may use health information to ensure that programs we operate are run safely and in accordance with any special health needs participants may require. Health information may also be kept for insurance purposes. In addition, we may use <NOBR>pre-identified</NOBR> health information and other sensitive information to carry out research, to prepare submissions to government, or to plan events and activities.</P>
<P class="p3 ft0">Disclosure</P>
<P class="p58 ft2">The Emerson Club may disclose your personal information to a range of organisations which include, but are not limited to:</P>
<P class="p0 ft1">other partnered venues in Australia;</P>
<P class="p56 ft2">companies we engage to carry out functions and activities on The Emerson Club’s behalf, including direct marketing;</P>
<P class="p59 ft2">our professional advisers, including our accountants, auditors and lawyers; our insurers;</P>
<P class="p0 ft1">relevant bodies; and</P>
<P class="p9 ft1">in other circumstances permitted by law.</P>
<P class="p60 ft2">In some circumstances personal information may also be disclosed outside of Australia. In such circumstances, we will use our best endeavours to ensure such parties are subject to a law, binding scheme or contract which effectively upholds principles for fair handling of the information that are suitably similar to the Australian Privacy Principles.</P>
<P class="p37 ft0">Direct marketing</P>
<P class="p61 ft2">We will use <NOBR>non-sensitive</NOBR> personal information to provide better services and for marketing purposes (including disclosure of such information to service providers).</P>
<P class="p15 ft3">If you do not wish to receive <NOBR>e-mail,</NOBR> SMS or posted offers from us, you may <NOBR>opt-out</NOBR> by using the link provided. Alternatively, you may advise us at any time by contacting us via the contact details set out in this policy.</P>
<P class="p18 ft0">Other disclosures</P>
<P class="p62 ft2">In addition, The Emerson Club may also disclose your personal information: with your express or implied consent;</P>
<P class="p0 ft1">when required or authorised by law;</P>
</div>
<div id="page_6">


<P class="p0 ft1">to an enforcement body when reasonably necessary; or</P>
<P class="p9 ft1">to lessen or prevent a threat to an individual or public health or safety.</P>
<P class="p1 ft0">The Emerson Club website</P>
<P class="p63 ft2">When you visit our website, our systems may record certain information about your use of the site, including the web pages visited and the time and date of their visit as well as the IP address visited from. We use this information to help analyse and improve the performance of The Emerson Club website.</P>
<P class="p64 ft2">In addition, we may use “cookies” on The Emerson Club website. Cookies are small text files that assist our website to retain user preferences to improve the experience of using our website. In some cases, the cookies that we use may collect some personal information. The Emerson Club will treat this information in the same way as other personal information we collect. You are free to disable cookies on your internet browser to prevent this information being collected; however, you will lose the benefit of the enhanced website experience that the use of cookies may offer. Websites linked to The Emerson Club website are not subject to our privacy standards, policies or procedures. We cannot take any responsibility for the collection, use, disclosure or security of any personal information that you provide to a third party website.</P>
<P class="p24 ft0">HOW DOES THE EMERSON CLUB PROTECT YOUR PERSONAL INFORMATION?</P>
<P class="p65 ft2">The Emerson Club recognises the importance of protecting your personal information and of ensuring that it is complete, accurate, <NOBR>up-to-date</NOBR> and relevant. The Emerson Club will take all reasonable steps to ensure that the personal information it collects, uses or discloses is accurate, complete and <NOBR>up-to-date.</NOBR> However, we rely on the accuracy of personal information as provided to us both directly and indirectly.</P>
<P class="p66 ft2">Our staff are trained to properly handle the different types of information they receive, particularly sensitive information. We have quality assurance measures in place to monitor calls to ensure that our processes are being followed. While some of the personal information we collect is held in hardcopy form, most personal information is stored in electronic databases. We have extensive processes in place to ensure that our information systems and files are kept secure from unauthorised access and interference.</P>
<P class="p67 ft0">CAN YOU ACCESS OR CORRECT PERSONAL INFORMATION THE EMERSON CLUB HOLDS ABOUT YOU?</P>
<P class="p2 ft2">We encourage you to regularly review and update your personal information. If you would like to access the personal information that we hold about you, please let us know by making a request via the contact details set out below. We will respond to your request for access within a reasonable period. If you find that the personal information we hold about you is inaccurate, incomplete or out- <NOBR>of-date,</NOBR> please contact us immediately and we will correct it.</P>
<P class="p37 ft0">RESOLVING PRIVACY ISSUES AND COMPLAINTS</P>
<P class="p68 ft2">Any issues or complaints in relation to the collection, use, disclosure, quality, security of and access to your personal information may be made to The Emerson Club in one of the following ways:</P>
<P class="p69 ft2">By telephone on 03 9825 0900. Write to</P>
<P class="p70 ft2">The Emerson Club, <NOBR>143-145</NOBR> Commercial Road SOUTH YARRA VIC 3141</P>
<P class="p0 ft1">By email to info@theemerson.com.au</P>
<P class="p43 ft2">We will respond to your complaint within a reasonable period, and try to resolve your complaint for you. If we are unable to resolve your complaint or you are unhappy with the outcome, you can contact the Office of Australian Information Commissioner via its enquiries line 1300 363 992 or website http://www.oaic.gov.au/ to lodge a complaint.</P>
</div>
<div id="page_7">


<P class="p71 ft2">For further information on The Emerson Club’s management of personal information, please contact The Emerson Club.</P>
<P class="p0 ft1">The Emerson Club may amend this Privacy Policy from time to time.</P>
</div>
</div>
      `
      },
      // {
      //   name:'Payments page',
      //   contents:""
      // }
    ];


    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */
    $scope.toggleGroup = function (title) {
      if ($scope.show == title) {
        $scope.show = '';
      } else {
        $ionicLoading.show();
        $scope.show = title;
      }

      $ionicScrollDelegate.$getByHandle('mainScroll').resize();
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
      $timeout(function () {
        $ionicLoading.hide();
      }, 1500);
    };

    $scope.isGroupShown = function (title) {
      return $scope.show == title;
    };
  })

  .controller('FunctionsCtrl', function ($scope, $rootScope, $state, $timeout, $ionicModal, $ionicLoading, $ionicHistory, moment, BoothService, $ionicSlideBoxDelegate, $ionicScrollDelegate, Listings, $q, $http, API_URI, APP_KEY, AuthService, Payment, BoothService) {
    $scope.locations = [];
    $scope.enquiry = {};
    $scope.back = function () {
      $timeout(function () {
        $ionicHistory.goBack();
      });
    };

    $scope.init = function () {
      BoothService.getLocations().then(function (s) {
        console.log(s);
        $scope.locations = s;
        if (s.length > 0) {
          // $scope.selectedLoc = s[0];
          $ionicSlideBoxDelegate.update();
          $ionicSlideBoxDelegate.start();
        }
      }, function (e) {
        console.log();
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.init();


    $scope.openEnquiryModal = function () {
      $ionicModal.fromTemplateUrl('templates/function-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        // search.booth_listing_id = booth.listing.id;
        // search.location = booth.listing.spaces[0].space;
        console.log($scope.enquiry);
        $scope.modal.show();
      });
    };

    $scope.sendFunEnquiry = function (enquiry) {
      $ionicLoading.show();
      BoothService.makeFunEnquiry(enquiry).then(function (s) {
        console.log(s);
        var options = {
          title: "Thank you for enquiry",
          cssClass: 'thx-msg',
          tpl: "A team member will contact you shortly.",
          okText: 'OK',
          okType: 'button-magenta',
          callBack: function () { }
        }
        $rootScope.createAlertPopup(options);
        $scope.modal.hide();
      }, function (e) {
        var options = {
          title: "Oops! Something went wrong, please try again.",
          cssClass: 'thx-msg',
          tpl: e.data.message,
          okText: 'OK',
          okType: 'button-blue',
          callBack: function () {
            // $scope.closeModal();
          }
        }
        $rootScope.createAlertPopup(options);
      }).finally(function () {
        $ionicLoading.hide();
      });
    }


  });
