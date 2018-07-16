angular.module('app.services')

.service('SocialMediaReader', function($q, $http){
  var access_token = {
    facebook: 'EAAIviszWXQABAJGcslRYDU2BMKmiPiMa5NSQAyE26zQyvrD7ratTuHyRdTSYtxkmPbN1OgYPiZCXBrxUNgWiwoq3zRIXr5omFQwLmbEyMigONCgfXlonZCdZAlCBzZBFQojBlDGIwiOIhBoeLWk0FKgGgG558WTZCGO4cRhP2iAZDZD',
  };

  var getFBfeed = function(){
    var d = $q.defer();
    var url = 'https://graph.facebook.com/v2.7/me';
    var params = {
      fields:'id,name,cover,photos{picture},posts.limit(5){message,picture,full_picture,created_time,link,likes}',
      access_token:access_token.facebook,
    };
    $http.get(url, {params:params}).then(function(res){
      d.resolve(res);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  };

  var getFBObjectLikedList = function(object_id, access_token){
    var d = $q.defer();
    var url = 'https://graph.facebook.com/'+object_id+'/likes';
    $http.get(url, {params:{access_token:access_token, summary:true}}).then(function(s){
      console.log(s);
      d.resolve(s.data.summary);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  };

  var likeFBPost = function(object_id, access_token){
    var d = $q.defer();
    var url = 'https://graph.facebook.com/'+object_id+'/likes';
    $http.post(url, {access_token:access_token}).then(function(s){
      console.log(s);
      d.resolve(s.data.success);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  };

  var unlikeFBPost = function(object_id, access_token){
    var d = $q.defer();
    var url = 'https://graph.facebook.com/'+object_id+'/likes';
    $http.delete(url, {params:{access_token:access_token}}).then(function(s){
      console.log(s);
      d.resolve(s.data.success);
    }, function(e){
      d.reject(e);
    });
    return d.promise;
  };

  return{
    getFBfeed:getFBfeed,
    getFBObjectLikedList:getFBObjectLikedList,
    likeFBPost:likeFBPost,
    unlikeFBPost:unlikeFBPost,
  }
});
