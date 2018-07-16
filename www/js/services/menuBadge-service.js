angular.module('app.services')
.service('MenuBadge', function(){
  var badges = {};

  function useBadges(){
    if(window.localStorage.getItem('BADGES') !== null){
      badges = JSON.parse(window.localStorage.getItem('BADGES'));
    }
  }

  var getBadges = function(){
    useBadges();
    return badges;
  };

  var setBadge = function(number, category){
    if(angular.isUndefined(badges[category])){
      badges[category] = 0;
    }
    badges[category] += number;
    window.localStorage.setItem('BADGES', JSON.stringify(badges));
  };

  var clearBadges = function(){
    if(window.localStorage.getItem('BADGES') !== null){
      window.localStorage.removeItem('BADGES');
    }
  };

  useBadges();

  return{
    getBadges:getBadges,
    setBadge:setBadge,
    clearBadges:clearBadges,
  }
})
