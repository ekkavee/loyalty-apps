angular.module('app.services')

.service('creditCardService', function($ionicModal, Payment, $q, Payment, Stripe){
  var order_details = null;
  var creditCardModal = null;


  var openCCModal = function(options){
    var d = $q.defer();
    $ionicModal.fromTemplateUrl('templates/booth-credit-card-modal.html', {
    animation: 'slide-in-up'
    }).then(function(modal) {
      // payment_info = options.payment_info;
      // order_token = options.order_token;
      // ccModalTitle = options.ccModalTitle;
      // ccPayModel = options.ccPayModel;
      // book = options.book;
      // listing = options.listing;
      order_details = options;
      creditCardModal = modal;
      // getCust();
      creditCardModal.show();
      d.resolve(creditCardModal);
    }, function(e){
      d.reject(false);
    });

    return d.promise;
  };

  var closeCCModal = function(){
    cancelOrder(order_details.order_token);
    creditCardModal.hide();
    creditCardModal = null;
  }

  function cancelOrder(token, paypal_id=''){
    Payment.orderConfirm(token, 'cancelled', paypal_id).then(function(s){
        console.log(s);
    }, function(e){
        console.log(e);
    });
  }

  function getCust(){
    console.log('here');
    Stripe.getCustInfo().then(function(s){
      console.log(s);
    }, function(e){
      console.log(e);
    });
  }

  return{
    order_details:function(){return order_details;},
    creditCardModal:function(){return creditCardModal},
    closeCCModal:closeCCModal,
    // payment_info:function(){return payment_info;},
    openCCModal:openCCModal,
  }
})
