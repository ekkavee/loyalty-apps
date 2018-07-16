angular.module('app.services')
.service('OrderModal', function($ionicModal){
  var l = {};
  var f = null;
  var orderModal = null;
  var order = null;
  var orderType = 0;

  function isEmptyObject(obj) {
    for(var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false;
      }
    }
    return true;
  }

  function isStocks(products){
    var isStocks = false;
    if(products.length > 0){
      angular.forEach(products, function(product){
        if(product.product.stocks.length > 0 || !isEmptyObject(product.product.stocks)){
          isStocks = true;
        }
      });
    }
    return isStocks;
  }

  var showOrder = function(listing, flag){
    // if(!isStocks(listing.products)){
    //   return;
    // }
    //pop-pu modal
    $ionicModal.fromTemplateUrl('templates/orders-modal.html', {
        scope: null,
        animation: 'slide-in-up'
    }).then(function(modal) {
        l = listing;
        f = flag;
        orderType = 0;
        ordersModal = modal;
        ordersModal.show();
    });

  }

  var showGCOrder = function(listing, flag){
    $ionicModal.fromTemplateUrl('templates/orders-modal.html', {
        scope: null,
        animation: 'slide-in-up'
    }).then(function(modal) {
        l = listing;
        f = flag;
        orderType = 1;
        ordersModal = modal;
        ordersModal.show();
    });
  }

  var closeModal = function(){
    // console.log(l);
    ordersModal.hide();
  }

  return{
    listing:function(){return l;},
    flag:function(){return f;},
    orderType:function(){return orderType;},
    showOrder:showOrder,
    closeModal:closeModal,
    showGCOrder:showGCOrder,
  }
});
