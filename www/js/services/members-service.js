angular.module('app.services')
.service('Members', function($q, $http, API_URI, AuthService, APP_KEY){
  var member = {};

  function loadMember(){};

  var getMember = function(){
    var d = $q.defer();

    $http.get(API_URI+'member/profile?app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret+'&token='+AuthService.authToken())
        .then(function(data){
          member = data.data.data;
          console.log(data);
          d.resolve(data);

        },
        function(error){
          d.reject(error);
        });

    return d.promise;
  };

  var setMember = function(key, val){

  };

  var setPhoto = function(photo_url){
    var deferred = $q.defer();

    $http.put(API_URI+'member/profile/photo?app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret+'&token='+AuthService.authToken()+"&photo_url="+photo_url)
        .then(function(success){
          deferred.resolve(success);
        },function(error){
          deferred.reject(error);
        });

    return deferred.promise;
  };

  //get interests list
  var getInterests = function(){
    var d = $q.defer();
    var url = API_URI+'member/memberInterests?app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret+'&token='+AuthService.authToken();
    console.log(url);
    $http.get(url).then(function(member_interests){
      member.interests = member_interests.data;
      d.resolve(member_interests.data);
    }, function(error){
      d.reject(error);
    });
    return d.promise;
  };

  var disableInterest = function(member_interest_id){
    var d = $q.defer();
    var url = API_URI+'member/interest/'+member_interest_id+'?app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret+'&token='+AuthService.authToken();
    // var url = API_URI+'member/interest/'+member_interest_id+'?app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret+'&token=';
    console.log(url);
    $http.delete(url).then(function(success){

      d.resolve(success);
    }, function(error){
      d.reject(error);
    });
    return d.promise;
  };

  var enableInterest = function(id){
    var d = $q.defer();
    var url = API_URI+'member/interest?app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret+'&token='+AuthService.authToken()+'&interest_id='+id+'&sort_number=0';
    console.log(url);
    $http.post(url).then(function(success){

      d.resolve(success);
    }, function(error){
      d.reject(error);
    });
    return d.promise;
  }

  var getMemberAddress = function(){
    var d = $q.defer();
    var url = API_URI+'member/interest?token='+AuthService.authToken();
    $http.get(url, {params:{app_token:APP_KEY.app_token, app_secret:APP_KEY.app_secret}}).then(function(s){
      d.resolve(s);
    }, function(e){
      d.$$reject(e);
    });

    return d.promise;
  };

  var createMemberAddress = function(place, category){
    var d = $q.defer();
    var url = API_URI+'member/address?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
      payload:JSON.stringify(place),
      // street: place.street_name,
      // recipient_name: place.name,
      // unit_number: place.unit,
      // postcode: place.postcode,
      // state:place.state,
      // suburb:place.suburb,
      category: category,
      // country:'Australia'
    };
    console.log(data);

    $http.post(url, data).then(function(s){
      d.resolve(s);
    },function(e){
      d.reject(e);
    });

    return d.promise;
  };

  var getMemberAddressById = function(id){
    var address = {};
    angular.forEach(member.member.member_addresses, function(add){
      if(parseInt(add.id) == parseInt(id)){
        address = add;
      }
    });
    return address;
  };

  var updateMemberProfile = function(profile){
    var d = $q.defer();
    var url = API_URI+'member/profile?token='+AuthService.authToken()+'&app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret;
    var data = {
      first_name:profile.first_name,
      last_name:profile.last_name,
      // phone:profile.phone,
      mobile:profile.mobile,
      dob:profile.dob?profile.dob.toDateString():null,
      wedding_day:profile.wedding_day?profile.wedding_day.toDateString():null,
    };
    console.log(data);

    $http.put(url, data).then(function(s){
      d.resolve(s);
    },function(e){
      d.reject(e);
    });

    return d.promise;
  };

  var updateMemberAddress = function(place_id, address){
    var d = $q.defer();
    var url = API_URI+'member/address/'+place_id+'?token='+AuthService.authToken()+'&app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret;
    var data = {
      // app_token:APP_KEY.app_token,
      // app_secret:APP_KEY.app_secret,
      // id:place_id,
      payload:JSON.stringify(address),
    };
    $http.put(url, data).then(function(s){
      d.resolve(s);
    },function(e){
      d.reject(e);
    });

    return d.promise;
  };

  var getAddFileds = function(){
    var d = $q.defer();
    var url = API_URI+'member/metaAdditionalField?token='+AuthService.authToken()+'&app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret;
    $http.get(url).then(function(s){
      d.resolve(s.data.data);
    }, function(e){
      d.reject(e);
    });

    return d.promise;
  };

  var getAddFieldValues = function(){
    var d = $q.defer();
    var url = API_URI+'member/additionalField?token='+AuthService.authToken()+'&app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret;
    $http.get(url).then(function(s){
      d.resolve(s.data.data);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  };

  var saveAddFields = function(addFields){
    var d = $q.defer();
    var url = API_URI+'member/additionalField?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
      metas:JSON.stringify(addFields),
    };
    $http.post(url, data).then(function(s){
      d.resolve(s);
    },function(e){
      d.reject(e);
    });
    return d.promise;
  };

  var updateEmail = function(form){
    var d = $q.defer();
    var url = API_URI+'member/profile/email?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
      email:form.email,
      password:form.password,
    };
    console.log(data);
    $http.post(url, data).then(function(s){
      d.resolve(s);
    },function(e){
      d.reject(e);
    });
    return d.promise;
  }

  var resendConfirmEmail = function(){
    var d = $q.defer();
    var url = API_URI+'member/resendConfirmationEmail?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    };
    console.log(data);
    $http.post(url, data).then(function(s){
      console.log(s);
      d.resolve(s);
    },function(e){
      d.reject(e);
    });
    return d.promise;
  };

  var updatePassword = function(new_password){
    var d = $q.defer();
    var url = API_URI+'member/password?token='+AuthService.authToken();
    var data = {
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
      old_password:new_password.password,
      new_password:new_password.new_password,
    };
    console.log(data);
    $http.put(url, data).then(function(s){
      AuthService.storeUser({token:s.data.token});
      d.resolve(s);
    },function(e){
      d.reject(e);
    });
    return d.promise;
  }

  var getMemberTiers = function(){
    var d = $q.defer();
    var url = API_URI+'member/tier?token='+AuthService.authToken()+'&app_token='+APP_KEY.app_token+'&app_secret='+APP_KEY.app_secret;
    $http.get(url).then(function(s){
      d.resolve(s);
    },function(e){
      d.reject(e);
    });
    return d.promise;
  }

  var tierUpgrade = function(tier){
    var d = $q.defer();
    var url = API_URI+'member/tierupgrade?token='+AuthService.authToken();
    var data = {
      data:JSON.stringify(tier),
      app_token:APP_KEY.app_token,
      app_secret:APP_KEY.app_secret,
    };
    console.log(data);
    $http.post(url, data).then(function(s){
      d.resolve(s);
    },function(e){
      d.reject(e);
    });
    return d.promise;
  }


  return{
    member:function(){return member},
    getMember:getMember,
    setMember:setMember,
    setPhoto:setPhoto,
    getInterests:getInterests,
    disableInterest:disableInterest,
    enableInterest:enableInterest,
    getMemberAddress:getMemberAddress,
    createMemberAddress:createMemberAddress,
    getMemberAddressById:getMemberAddressById,
    updateMemberAddress:updateMemberAddress,
    updateMemberProfile:updateMemberProfile,
    getAddFileds:getAddFileds,
    getAddFieldValues:getAddFieldValues,
    saveAddFields:saveAddFields,
    updateEmail:updateEmail,
    resendConfirmEmail:resendConfirmEmail,
    getMemberTiers:getMemberTiers,
    tierUpgrade:tierUpgrade,
    updatePassword:updatePassword,
  }

})
