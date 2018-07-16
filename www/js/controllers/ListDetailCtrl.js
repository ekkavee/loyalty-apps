angular.module('starter.controllers')
    .controller('ListDetailCtrl', function ($scope, $rootScope, listing, $ionicModal, moment, $state, $timeout, Order, $ionicPopup, Members, MenuBadge, $ionicLoading, Payment, $ionicHistory, OrderModal, enquiryPopup) {
        $scope.listing = listing;

        $timeout(function () {
            console.log($scope.listing.heading);
            window.ga.trackView($scope.listing.heading, '', true);
        });

        // $scope.extra_settings = {};
        // if(JSON.parse($scope.listing.extra_settings)){
        //   $scope.extra_settings = JSON.parse($scope.listing.extra_settings);
        // }
        // $scope.djs = [
        //   {
        //     img:'https://s3-ap-southeast-2.amazonaws.com/emerson-app/profile_default.png',
        //     name:'One'
        //   },{
        //     img:'https://s3-ap-southeast-2.amazonaws.com/emerson-app/profile_default.png',
        //     name:'Two'
        //   },
        //   {
        //     img:'https://s3-ap-southeast-2.amazonaws.com/emerson-app/profile_default.png',
        //     name:'Tree'
        //   },
        //   {
        //     img:'https://s3-ap-southeast-2.amazonaws.com/emerson-app/profile_default.png',
        //     name:'Four'
        //   }
        // ];
        $scope.slickConfig = {
            dots: false,
            infinite: true,
            // variableWidth: true,
            slidesToShow: 1,
            // infinite: true,
            // arrows: true,
            // centerMode:true,
        };

        $scope.fullSlickConfig = {
            dots: false,
            slidesToShow: 1,
            autoplay: true,
            speed: 300,
            infinite: true,
            fade: true
        }

        $scope.back = function () {
            console.log($ionicHistory);
            $timeout(function () {
                $ionicHistory.goBack();
            });

        };

        $scope.formatDate = function (time) {
            return moment(time).format("ddd, DD MMM YYYY");

        };

        function validQty(products) {
            var valid = false;
            angular.forEach(products, function (product) {
                angular.forEach(product.product.stocks, function (stock) {
                    if (parseInt(stock.qty) > 0) {
                        console.log(stock);
                        valid = true;
                    }
                })
            });

            return valid;
        }

        $scope.book = function (listing, flag) {
            OrderModal.showOrder(listing, flag);
        }

        $scope.enquiry = function (listing) {
            enquiryPopup.show(listing, $scope).then(function (r) {
                console.log(r);
                //submit enquiry here
            });
        }

        $scope.goSocialLink = function (url) {
            window.cordova.InAppBrowser.open(url, '_blank', 'location=no');
        }


        $scope.confirmOrder = function (products) {
            if (!validQty(products)) {
                var options = {
                    title: "Notice",
                    cssClass: 'thx-msg',
                    tpl: "No Quantity Selected.",
                    okText: 'OK',
                    okType: 'button-magenta',
                    callBack: function () { }
                }

                $rootScope.createAlertPopup(options);
                return;
            }
            var tpl = "Please confirm your order.";
            if ($scope.order.show === 'cash') {
                tpl = "Please confirm your order.";
            }

            var confirmPopup = $ionicPopup.confirm({
                title: '',
                cssClass: 'item-confirm',
                template: tpl,
                cancelText: 'Cancel', // String (default: 'Cancel'). The text of the Cancel button.
                cancelType: '', // String (default: 'button-default'). The type of the Cancel button.
                okText: 'Ok', // String (default: 'OK'). The text of the OK button.
                okType: 'button-magenta', // String (default: 'button-positive'). The type of the OK button.
            });

            confirmPopup.then(function (res) {
                if (res) {
                    var data = {
                        // type: $scope.order.mix?'mix':$scope.order.show,
                        type: $scope.order.show == 'point' ? $scope.order.show : ($scope.order.mix ? 'mix' : $scope.order.show),
                        order: JSON.stringify(products),
                        total: JSON.stringify({
                            // point:$scope.order.mix?$scope.order.pointUse:($scope.order.show == 'point'?$scope.getTotal($scope.listing.products, 'point'):0),
                            point: $scope.order.show == 'point' ? $scope.getTotal($scope.listing.products, 'point') : ($scope.order.mix ? ($scope.order.pointUse ? $scope.order.pointUse : 0) : 0),
                            cash: $scope.order.show == 'cash' ? $scope.getTotal($scope.listing.products, 'cash') : 0,
                        }),
                    };

                    console.log(data);
                    createOrder(data);
                    // redeemItem(item);
                } else {
                    console.log('You are not sure');
                }
            });
        };

        //Order Modal
        function isEmptyObject(obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    return false;
                }
            }
            return true;
        }

        $scope.isStocks = function (products) {
            var isStocks = false;
            if (products && products.length > 0) {
                isStocks = true;
                // angular.forEach(products, function(product){
                //   if(product.product.length > 0 || !isEmptyObject(product.product)){
                //     isStocks = true;
                //   }
                // });
            }
            return isStocks;
        }

        $scope.isEnoughPts = function () {
            if ($scope.order.pointUse) {
                if ($scope.order.pointUse > $rootScope.ptsToInt($rootScope.member.member.points)) {
                    var options = {
                        title: "Opps! Your do not have enough points, please try again.",
                        cssClass: 'thx-msg',
                        tpl: '',
                        okText: 'OK',
                        okType: 'button-blue',
                        callBack: function () {
                            $scope.order.pointUse = $rootScope.ptsToInt($rootScope.member.member.points);
                        }
                    }
                    $rootScope.createAlertPopup(options);
                }
            }
        }

        //show order Modal
        $scope.showOrder = function (flag) {
            if (!$scope.isStocks($scope.listing.products)) {
                return;
            }
            $scope.order = {};
            $scope.order.mix = false;
            $scope.redeemOnly = false;
            if ($scope.listing.type.name == 'Redeem') {
                $scope.redeemOnly = true;
            }
            if (flag == 'cash') {
                $scope.order.show = 'cash';

            }
            else if (flag == 'point') {
                $scope.order.show = 'point';
            }
            //pop-pu modal
            $ionicModal.fromTemplateUrl('templates/orders-modal.html', {
                scope: $scope,
                animation: 'fade-in'
            }).then(function (modal) {
                $scope.ordersModal = modal;
                $scope.ordersModal.show();
            });

            $scope.closeModal = function () {
                $scope.ordersModal.hide();
                // $scope.selectIput = null;
            };

            $scope.selectInput = {};
            $scope.itemSelected = function (stock) {
                $scope.selectInput = stock;
            };
        };

        $scope.changeOrder = function (type) {
            if ($scope.order.show != type) {
                $scope.order.show = type;
                console.log($scope.listing.products);
                // $scope.selectInput = {};
            }
        };

        $scope.getTotal = function (products, type) {
            var total = 0;
            console.log(products);
            if (angular.isDefined(products) && products.length > 0) {
                angular.forEach(products, function (product) {
                    console.log(product.qty);
                    // var qty = product.qty;
                    // angular.forEach(product.product.stocks, function(stock){
                    //     qty += stock.qty;
                    // });

                    if (type == 'point') {
                        total += Number(product.product.point_price) * product.qty;
                    } else {
                        total += Number(product.product.unit_price) * product.qty;
                    }

                });
            }
            if ($scope.order.mix && type === 'cash' && $scope.order.pointUse > 0) {
                total = total - $scope.order.pointUse / $rootScope.pointRatio;
                if (total < 0) {
                    total = 0;
                }
            }
            return total;
        };


        function createOrder(data) {

            $ionicLoading.show().then(function () {
                var msg = {};
                Payment.createOrder(data).then(function (s) {
                    console.log(s);
                    //redeem
                    if ($scope.order.show == 'point') {
                        $scope.$broadcast('ConfirmOrder', { token: s.token, paypal_id: '' });
                    }
                    //cash/mix
                    if ($scope.order.show === 'cash') {
                        var totalPrice = $scope.getTotal($scope.listing.products, 'cash');
                        pay(totalPrice, s.id, s.token);
                    }

                    // $ionicLoading.hide();

                    //refresh member points
                }, function (e) {
                    console.log(e);
                    var options = {
                        title: "Opps! Something went wrong, please try again.",
                        cssClass: 'thx-msg',
                        tpl: e.data.message,
                        okText: 'OK',
                        okType: 'button-magenta',
                        callBack: function () {
                            // $scope.closeModal();
                        }
                    }
                    $ionicLoading.hide();
                    $rootScope.createAlertPopup(options);
                });
            }, function (error) {
                $ionicLoading.hide();
            }).finally(function () {
                // $timeout(function(){
                //     $ionicLoading.hide().then(function(){
                //     });
                // }, 1000);
            })

        }

        function pay(totalPrice, orderNO, newOrderToken) {
            if (Number(totalPrice) <= 0) {
                $scope.$broadcast('ConfirmOrder', { token: newOrderToken, paypal_id: 'X-' + orderNO });
                return;
            }
            PaypalService.initPaymentUI().then(function () {
                PaypalService.makePayment(totalPrice, orderNO).then(function (s) {
                    console.log(s);
                    $scope.$broadcast('ConfirmOrder', { token: newOrderToken, paypal_id: s.response.id });
                }, function (e) {
                    console.log(e);
                    $scope.$broadcast('CancelOrder', { token: newOrderToken, paypal_id: '' });
                })
            }, function (error) {
                console.log(error);
                $scope.$broadcast('CancelOrder', { token: newOrderToken, paypal_id: '' });
            });
        }

        $scope.$on('ConfirmOrder', function (e, d) {
            console.log(d);
            // $ionicLoading.show();
            Payment.orderConfirm(d.token, 'confirmed', d.paypal_id).then(function (s) {
                var options = {
                    title: "Thank you for ordering " + $scope.listing.name + "!",
                    cssClass: 'thx-msg',
                    tpl: "Your order is being processed",
                    okText: 'OK',
                    okType: 'button-magenta',
                    callBack: function () {
                        if (parseInt(s.data.reward) > 0) {
                            $rootScope.$broadcast('RewardPoint', { point: parseInt(s.data.reward) });
                        }
                        Members.getMember().then(function (member) {
                            $rootScope.member = member.data.data;
                            $scope.closeModal();
                            MenuBadge.setBadge(1, 'orders');
                            $rootScope.$broadcast('LoadBadges', {});
                            // $state.go('app.tab.redeem');
                        });
                    }
                }

                $ionicLoading.hide();
                $rootScope.createAlertPopup(options);
            }, function (e) {
                $ionicLoading.hide();
            });
        });

        $scope.$on('CancelOrder', function (e, d) {
            console.log(d);
            Payment.orderConfirm(d.token, 'cancelled', d.paypal_id).then(function (s) {
                console.log(s);
                $ionicLoading.hide();
            }, function (e) {
                console.log(e);
                $ionicLoading.hide();
            });
        });

        $scope.shortDay = function (day) {
            return day.name.substring(0, 3);
        };

        $scope.timeParser = function (time) {
            if (time == null) {
                return '-';
            }
            if($scope.listing.type.id == 1){
                return moment(time, 'yyyy-MM-DD HH:mm:ss').format('h:mm a');
            }
            return moment(time, 'HH:mm:ss').format('h:mm a');
        }

        $scope.dateParser = function (date) {
            // console.log(date);
            if (date == null) {
                return '';
            }
            return moment(date, 'yyyy-MM-DD HH:mm:ss').format('ddd DD.MM.YYYY');
        }
    });
