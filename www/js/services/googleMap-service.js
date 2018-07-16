angular.module('app.services')

.service('GoogleMap', function(){
  var div = document.getElementById("map-canvas");
  console.log(div);
  var map = {};
  var init = function(){
    map = plugin.google.maps.Map.getMap(div);
    return this;
  }

  var ready = function(){
    map.addEventListener(plugin.google.maps.event.MAP_READY, loadMap);
  }

  function loadMap(){
    map.showDialog();
    alert(JSON.stringify(document.getElementById("map-canvas")));
  }

  return{
    init:init,
    ready:ready,
  }
});
