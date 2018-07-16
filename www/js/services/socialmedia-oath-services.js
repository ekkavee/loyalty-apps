angular.module('app.services')

.service('SocialMediaOauth', function($q, $http, $rootScope, $cordovaOauth, AuthService, $twitterApi, API_URI, APP_KEY){
  //facebook
  function facebookOauth(){
    var options = {
      clientId:'1847731918777250',
      appScope:["email", "public_profile"],
      options:{},
    }
    var d = $q.defer();
    // $cordovaOauth.facebook(options.clientId, options.appScope, options.options).then(function(result) {
    //
    //   d.resolve(result);
    // }, function(error) {
    //
    //   d.reject(error);
    // });

    facebookConnectPlugin.login(options.appScope, function(result){
      console.log(result);
      d.resolve(result.authResponse);
    }, function(error){
      d.reject(error);
    });

    return d.promise;
  }

  function getFacebookInfo (access_token){
    var deferred = $q.defer();
    var url = 'https://graph.facebook.com/v2.8/me?fields=id,name,email&access_token='+access_token;
    $http.get(url).then(function(resp){
      AuthService.storeSocialMediaToken('facebook', {access_token:access_token, id:resp.data.id});
      deferred.resolve(resp);
    },function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  //twitter
  var twCredentials = {
    consumerKey:"E6UhrOeTAre9E65tR87HBecZZ",
    consumerSecret: "UVcj4vsHVTSmiI32OhzRmXxK7qPbHLzyX3lKlzCQPP1K6smycl",
  };

  function getTwAuth(){
    // console.log('here');
    var d = $q.defer();
    // $cordovaOauth.twitter(twCredentials.consumerKey, twCredentials.consumerSecret).then(function(result) {
    //   AuthService.storeSocialMediaToken('twitter', result);
    //   $twitterApi.configure(twCredentials.consumerKey, twCredentials.consumerSecret, result);
    //   d.resolve(result);
    // }, function(error) {
    //   console.log(JSON.stringify(error));
    //   d.reject(error);
    // });
    TwitterConnect.login(
      function(result) {
        console.log(result);
        AuthService.storeSocialMediaToken('twitter', result.token);
        $twitterApi.configure(twCredentials.consumerKey, twCredentials.consumerSecret, {oauth_token:result.token, oauth_token_secret:result.secret});
        d.resolve(result);
      },
      function(error) {
        console.log(error);
        d.reject(error);
      }
    );
    // TwitterConnect.showUser(
    //   function(result) {
    //     console.log('User Profile:');
    //     console.log(result);
    //     console.log('Twitter handle :'+ result.screen_name);
    //   },
    //   function(error) {
    //     console.log('Error retrieving user profile');
    //     console.log(error);
    //   }
    // );
    return d.promise;
  };

  function getTWInfo(){
    var d = $q.defer();
    var url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
    $twitterApi.getRequest(url, {skip_status:true, include_email:true}).then(function(s){
            // alert(JSON.stringify(s));
            d.resolve(s);
        }, function(e){
            console.log(e);
            d.reject(e);
        });
    return d.promise;
  }


  var socialMediaAuth = function(SMName){
    var d = $q.defer();
    var promise = d.promise;
    switch(SMName) {
      case 'facebook':
          facebookOauth().then(function(s){
            getFacebookInfo(s.accessToken).then(function(result){
              console.log(result);
              var name = result.data.name.split(' ');
              var user ={
                email: result.data.email,
                first_name: name[0],
                last_name: name[name.length-1],
                type:'facebook',
              };
              d.resolve(user);
            }, function(e){
              console.log(e);
              d.reject(e);
            });
          }, function(e){
            console.log(e);
            d.reject(e);
          });
          break;
      case 'twitter':
        getTwAuth().then(function(s){
          getTWInfo().then(function(res){
            var name = res.name.split(' ');
            var user ={
              email: res.email,
              first_name: name[0],
              last_name: name[name.length-1],
              type:'twitter',
            };
            console.log(res);
            d.resolve(user);
          }, function(e){
            console.log(e);
            d.reject(e);
          });
        }, function(e){
          console.log(e);
          d.reject(e);
        });
        break;
      case 'google':
        window.plugins.googleplus.login({}, function(user_data){
          // alert(JSON.stringify(user_data));
          var name = user_data.displayName.split(' ');
          var user ={
            email:user_data.email,
            first_name: name[0],
            last_name: name[name.length-1],
            type:'gmail',
          };
          console.log(user);
          d.resolve(user);
        }, function(e){
          // alert(JSON.stringify(e));
          console.log(e);
          d.reject(e);
        });
        break;
      default:
          break;
    }

    return promise;
  }

  var socialLogin = function(user){
    var deferred = $q.defer();
    //var user = user;
    var uri = API_URI+'social/login?';
    var data = {
      email:user.email,
      type:user.type,
      first_name:user.first_name,
      last_name:user.last_name,
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret
    }
    // console.log(uri);
    // alert('here');
    $http.post(uri, data).then(function(result){
      console.log(result);
      var current_user = {
        token: result.data.token,
      };
      //save the user token from api
      AuthService.storeUser(current_user);

      deferred.resolve(current_user);
    }, function(error){
      deferred.reject(error);
    });
    return deferred.promise;
  };

  //requuest api to issue point rewards for social media actions
  var getRewards = function(options){
    var d = $q.defer();
    // options.app_token = APP_KEY.app_token;
    // options.app_secret = APP_KEY.app_secret;
    var url = API_URI+'member/claimReward?app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret+'&token='+AuthService.authToken();
    $http.post(url, options).then(function(s){
      // alert(JSON.stringify(s));
      console.log(s);
      if(parseInt(s.data.points) > 0){
        $rootScope.$broadcast('RewardPoint', {point:parseInt(s.data.points)});
        Members.getMember().then(function(member){
          $rootScope.member = member.data.data;
        });
      }
      d.resolve(s);
    },function(e){
      // alert(JSON.stringify(e));
      d.reject(e);
    });
    return d.promise;
  };

  return{
    socialMediaAuth:socialMediaAuth,
    socialLogin:socialLogin,
    getRewards:getRewards,
  }
});
