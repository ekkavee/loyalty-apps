angular.module('app.directives', [])
    .directive('compareTo', [function () {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function (scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function (modelValue) {
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function () {
                    ngModel.$validate();
                });
            }
        };
    }])

    .directive('dobCheck', function () {
        return {
            require: "ngModel",
            link: function (scope, element, attributes, ngModel) {

                ngModel.$validators.dobCheck = function (dob) {
                    return moment().diff(dob, 'years', false) >= 18;
                };

            }
        };
    })

    .directive('emailExists', ['$http', 'API_URI', 'APP_KEY', function ($http, API_URI, APP_KEY) {
        return {
            require: 'ngModel',
            link: function ($scope, element, attrs, ngModel) {
                //ngModel.$asyncValidators.usernameAvailable = function(username) {
                ngModel.$asyncValidators.emailExists = function (email) {
                    //console.log(email);

                    return $http.get(API_URI + 'email/check?email=' + email + '&app_token=' + APP_KEY.app_token + '&app_secret=' + APP_KEY.app_secret);


                };
            }
        }
    }])

    .directive('hideTabs', function ($rootScope, $timeout, $ionicScrollDelegate) {
        return {
            restrict: 'A',
            link: function ($scope, $el) {
                $rootScope.hideTabs = 'tabs-item-hide';
                $scope.$on('$destroy', function () {
                    $rootScope.hideTabs = '';
                    $timeout(function () {
                        $ionicScrollDelegate.resize()
                    }, 1000);
                });
            }
        };
    })

    .directive('hasLikedFb', function ($q, $state, SocialMediaReader, $cordovaOauth, SocialAuth, $timeout, $ionicPopup, moment) {
        //login to facebook
        function facebookLogin() {
            var d = $q.defer();
            $cordovaOauth.facebook("1728376834117140", ["email", "publish_actions", "user_likes"]).then(function (result) {
                console.log(result.access_token);
                SocialAuth.getFacebookInfo(result.access_token).then(function (s) {
                    console.log(s);
                    $state.go('app.tab.home');
                    $timeout(function () {
                        $state.go('app.socialtab.facebook');
                    }, 1000);
                    d.resolve(s);
                }, function (e) {
                    console.log(e);
                    d.reject(e);
                });
            }, function (e) {
                console.log(e);
                d.reject(e);
            });
            return d.promise;
        }

        return {
            restrict: 'A',
            scope: {
                postId: "=hasLikedFb",
            },
            template: "<button ng-if='ready' class='button button-small like-button' ng-class=\"{'button-assertive':liked}\"><i class='icon ion-android-favorite'></i> {{total}}</button><ion-spinner ng-if='!ready' icon='lines'></ion-spinner>",
            link: function (s, e, a) {

                e.bind('click', function ($event) {
                    s.ready = false;
                    $event.preventDefault();
                    if (window.localStorage.getItem('FACEBOOK') === null) {
                        s.ready = true;
                        $ionicPopup.confirm({
                            title: 'Notice',
                            cssClass: 'thx-msg',
                            template: "<p class='text-center'>Please login your Facebook account!<p>",
                            cancelText: 'Cancel',
                            cancelType: 'button-assertive',
                            okText: 'OK',
                            okType: 'button-balanced',
                        }).then(function (res) {
                            if (res) {
                                facebookLogin().then(function (s) { }, function (e) { });
                            }
                        });

                        return;
                    }
                    if (!s.liked) {
                        SocialMediaReader.likeFBPost(s.postId, JSON.parse(window.localStorage.getItem('FACEBOOK')).access_token).then(function (success) {
                            s.ready = true;
                            if (success) {
                                s.liked = true;
                                s.total += 1;
                                var options = {
                                    reward_type: 'facebook',
                                    claimed_at: moment(),
                                    event: 'like'
                                };

                                console.log(options);
                                SocialAuth.getRewards(options).then(function (s) {

                                }, function (e) {

                                });
                            }
                        }, function (e) {
                            console.log(e);
                            s.ready = true;
                            //popup
                            var template = "<p class='text-justify'>Session has expired, Please login your facebook account again!</p>";
                            $ionicPopup.confirm({
                                title: 'Notice',
                                cssClass: 'thx-msg',
                                template: template,
                                cancelText: 'Cancel',
                                cancelType: 'button-assertive',
                                okText: 'OK',
                                okType: 'button-balanced',
                            }).then(function (res) {
                                if (res) {
                                    facebookLogin().then(function (s) { }, function (e) { });
                                }
                            });
                        });
                    }
                    if (s.liked) {
                        SocialMediaReader.unlikeFBPost(s.postId, JSON.parse(window.localStorage.getItem('FACEBOOK')).access_token).then(function (success) {
                            s.ready = true;
                            if (success) {
                                s.liked = false;
                                s.total = s.total > 0 ? s.total - 1 : 0;
                            }
                        }, function (e) {
                            console.log(e);
                            s.ready = true;
                            var template = "<p class='text-justify'>Session has expired, Please login your facebook account again!</p>";
                            $ionicPopup.confirm({
                                title: 'Notice',
                                cssClass: 'thx-msg',
                                template: template,
                                cancelText: 'Cancel',
                                cancelType: 'button-assertive',
                                okText: 'OK',
                                okType: 'button-balanced',
                            }).then(function (res) {
                                if (res) {
                                    facebookLogin().then(function (s) { }, function (e) { });
                                }
                            });
                        });
                    }


                });
                // console.log(a);
                console.log(s.postId);
                if (window.localStorage.getItem('FACEBOOK') === null) {
                    s.ready = true;
                    s.liked = false;
                    return;
                }
                SocialMediaReader.getFBObjectLikedList(s.postId, JSON.parse(window.localStorage.getItem('FACEBOOK')).access_token).then(function (summary) {
                    s.ready = true;
                    if (summary.has_liked) {
                        s.liked = true;
                    } else {
                        s.liked = false;
                    }
                    s.total = summary.total_count;

                }, function (e) {
                    console.log(e);
                    s.ready = true;
                });
            }
        }

    })

    .directive('hasAddInfo', function (Members) {
        return {
            restrict: 'A',
            link: function (s, e, a) {
                s.hasAInfo = true;
                Members.getAddFileds().then(function (s) {
                    if (s.length === 0) {
                        s.hasAInfo = false;
                    }
                }, function (e) { });
            }
        };
    })

    .directive('dinnerTickets', function (moment) {
        return {
            restrict: 'A',
            template: "<option ng-repeat='stock in dinnerTickets.stocks' value='{{stock.id}}'>{{formatDate(stock.date.start_date)}}</option>",
            scope: {
                dinnerTickets: '=dinnerTickets',
            },
            link: function (s, e, a) {
                s.formatDate = function (time) {
                    return moment(time).format("ddd, DD MMM YYYY");
                }
            }
        };

    })

    .directive('showPrices', function () {
        function minTicketPoint(listing) {
            var prices = [];
            angular.forEach(listing.products, function (product) {
                prices.push(Number(product.product.point_price));
            });
            return Math.min.apply(null, prices) == 0 ? 'FREE' : Math.min.apply(null, prices);
        };


        function minPrice(listing) {
            var min = 0;
            if (listing.products.length > 0) {
                min = parseInt(listing.products[0].product.unit_price);
                angular.forEach(listing.products, function (product) {
                    min = parseInt(product.product.unit_price) < min ? parseInt(product.product.unit_price) : min;
                });
            }
            return min == 0 ? 'FREE' : min;
        };

        return {
            restrict: 'A',
            scope: {
                listing: "=showPrices",
            },
            template: '<span style="font-size: 8px; vertical-align: super;" ng-if="mult">From</span> <span ng-if="MinCashPrice !=\'FREE\'">$</span></span>{{MinCashPrice}} | {{MinPointPrice}}',
            link: function (s, e, a) {
                s.mult = false;
                if (s.listing.products.length > 1 || s.listing.products[0].product.stocks.length > 1) {
                    s.mult = true;
                }
                s.MinPointPrice = minTicketPoint(s.listing);
                s.MinCashPrice = minPrice(s.listing);
                console.log(s.mult, s.MinPointPrice, s.MinCashPrice);
            }
        };
    })

    .directive('productPrices', function () {
        return {
            restrict: 'A',
            scope: {
                product: "=productPrices",
                type: "=listingType"
            },
            template: '<span ng-if="type != \'Redeem\'">{{unit_price | currency}} | {{point_price | number}} Pts</span><span ng-if="type == \'Redeem\'">{{point_price | number}} Pts</span>',
            link: function (s, e, a) {
                if (s.type != 'Redeem') {
                    s.unit_price = s.product.product.unit_price ? s.product.product.unit_price : 'FREE';
                    s.point_price = s.product.product.point_price ? s.product.product.point_price : 'FREE';
                } else {
                    s.point_price = s.product.product.point_price ? s.product.product.point_price : 'FREE';
                }

            }
        };
    })

    .directive('getDiningDate', function (moment) {
        function formatDate(time) {
            return moment(time).format("ddd, DD MMM YYYY");

        };

        return {
            restrict: 'A',
            scope: {
                listing: "=getDiningDate",
            },
            template: '<span ng-if="!multiTime" style="line-height: 2em; vertical-align: middle;">{{str_start}}</span><span ng-if="multiTime" style="line-height: 2em; vertical-align: middle;">{{str_start}}</span><span ng-if="multiTime" style="line-height: 2em; vertical-align: middle;"> - {{str_end}}</span>',
            link: function (s, e, a) {
                if (formatDate(s.listing.listing.date_start) === formatDate(s.listing.listing.date_end)) {
                    s.str_start = formatDate(s.listing.listing.date_start);
                    s.multiTime = false;
                }
                else {
                    s.str_start = formatDate(s.listing.listing.date_start);
                    s.str_end = formatDate(s.listing.listing.date_end);
                    s.multiTime = true;
                }
            }
        };
    })

    .directive('tierBenefit', function () {
        function parseVal(val) {
            if (typeof val == 'string') {
                return val;
            }
            if (typeof val == 'boolean') {
                return val ? 'YES' : '-';
            }
        };

        return {
            restrict: 'A',
            scope: {
                val: "=tierBenefit",
            },
            template: '{{benefit}}',
            link: function (s, e, a) {
                s.benefit = parseVal(s.val);
            }
        };
    })

    .directive('getPromoTime', function (moment) {
        function formatDate(time) {
            return moment(time).format("h:mma");

        };

        return {
            restrict: 'A',
            scope: {
                promo: "=getPromoTime",
            },
            template: '{{start_time}} - {{end_time}}',
            link: function (s, e, a) {
                console.log(s.promo.promo.date_start);
                console.log(s.promo.promo.date_end);
                s.start_time = formatDate(s.promo.promo.date_start);
                s.end_time = formatDate(s.promo.promo.date_end);
            }
        };
    })

    .directive('getStartTime', function (moment, $timeout) {
        function formatDate(time) {
            return moment(time).format("DD MMM YYYY");

        };

        return {
            restrict: 'A',
            scope: {
                listing: "=getStartTime",
            },
            template: '{{s.start_time}}',
            link: function (s, e, a) {
                $timeout(function () {
                    s.start_time = formatDate(s.listing.date_start);
                    console.log(s.start_time);
                }, 500);
            }
        };
    })

    .directive('getListingDate', function (moment) {
        console.log(moment);
        function formatDate(time, format) {
            // console.log(time);
            if (time != null) {
                return moment(time).format(format);
            } else {
                return '';
            }


        };

        function getTime(time) {
            return moment(time).format("h:mma");
        };

        function getDayTime(time) {
            return moment(time, 'HH:mm:ss').format('h:mm a');
        }

        return {
            restrict: 'A',
            scope: {
                listing: "=getListingDate",
                format: "=dateFormat",
                time: "=timeFormat"
            },
            template: '<span ng-if="!multiTime">{{str_start}}</span><div class="multi-time" ng-if="multiTime"><span class="week-day" ng-if="str_day">{{str_day}} </span>{{str_start}}</div>',
            link: function (s, e, a) {
                // console.log(s.format);
                if (angular.isDefined(s.listing.type) && s.listing.type.repetitive == 1 && angular.isDefined(s.listing.time_start) && angular.isDefined(s.listing.time_end)) {
                    s.str_start = angular.isDefined(s.listing.time_start) ? getDayTime(s.listing.time_start) : '';
                    s.str_end = angular.isDefined(s.listing.time_end) ? getDayTime(s.listing.time_end) : '';
                    s.str_start = s.str_start + " - " + s.str_end
                    s.multiTime = false;
                }
                else {
                    if (formatDate(s.listing.date_start, s.format) === formatDate(s.listing.date_end, s.format)) {
                        if (!s.time) {
                            s.str_start = formatDate(s.listing.date_start, s.format);
                        }
                        if (s.time) {
                            s.str_start = formatDate(s.listing.date_start, s.format) + " " + getTime(s.listing.date_start) + " - " + getTime(s.listing.date_end);
                        }
                        s.multiTime = false;
                    }
                    else {
                        s.str_day = formatDate(s.listing.date_start, 'dddd');
                        s.str_start = formatDate(s.listing.date_start, s.format);
                        s.str_end = formatDate(s.listing.date_end, s.format);
                        // s.str_start = s.str_start+""+s.str_end;
                        s.multiTime = true;
                    }
                }
            }
        };
    })

    .directive('bottomTabsBar', function ($ionicModal, $rootScope, $state) {

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            templateUrl: 'templates/bottomTabsBars.html',
            link: function (s, e, a) {
                // s.nacTo = function(state){
                //   console.log('here');
                //   $state.go(state);
                // };

                s.nacTo = function (state) {
                    console.log(state);
                    if (state.stateName == 'website') {
                        $rootScope.goSocialLink(state.url);
                    }
                    var data = {};
                    console.log(state);
                    if (state.stateName.indexOf('tabs') !== -1 && state.stateName != "menu.tabs.home") {
                        data = { id: state.stateName.charAt(state.stateName.length - 1) };
                    }
                    $state.go(state.stateName, data);
                };

                s.getTab = function (id) {
                    var tab = $rootScope.layout.tabs.filter(function (tab) {
                        return tab.id === id;
                    })[0];
                    console.log(tab);
                    return tab;
                };

                s.openCard = function () {
                    if (angular.isDefined($rootScope.member.member) && $rootScope.member.member.bepoz_account_card_number) {
                        $ionicModal.fromTemplateUrl('templates/card-modal.html', {
                            scope: s,
                            animation: 'fade-in',
                            backdropClickToClose: false,
                        }).then(function (modal) {
                            s.cardModal = modal;
                            s.cardModal.show();
                        });

                        s.closeModal = function () {
                            s.cardModal.hide();
                        }
                    }
                    else {
                        var options = {
                            title: "",
                            cssClass: 'thx-msg',
                            tpl: "Your membership barcode is being generated. You will be notified when it is ready.",
                            okText: 'OK',
                            okType: 'button-magenta',
                            callBack: function () {
                                $rootScope.$broadcast('UserInit', {});
                            }
                        }

                        $rootScope.createAlertPopup(options);
                    }

                }
            }
        }
    })

    .directive('productsList', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                products: "=products",
                book: "=book",
                heading: "=head",
            },
            templateUrl: 'templates/products-list.html',
        }
    })

    .directive('productsListWhite', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                products: "=products",
                order: "=order"
            },
            templateUrl: 'templates/products-list-white.html',
        }
    })

    // .directive('getListingDate', function(moment){
    //     function formatDate(time){
    //         return moment(time).format("ddd, DD MMM");
    //
    //     };
    //
    //     return{
    //         restrict: 'A',
    //         scope:{ listing: "=getListingDate",
    //         },
    //         template:'{{str_start}}<span ng-if="multiTime"> - {{str_end}}</span>',
    //         link: function(s, e, a){
    //             if(s.listing.type.repetitive){
    //
    //             }
    //             else{
    //               if(formatDate(s.listing.date_start) === formatDate(s.listing.date_end)){
    //                   s.str_start = formatDate(s.listing.date_start);
    //                   s.multiTime = false;
    //               }
    //               else{
    //                   s.str_start = formatDate(s.listing.date_start);
    //                   s.str_end = formatDate(s.listing.date_end);
    //                   s.multiTime = true;
    //               }
    //             }
    //         }
    //     };
    // })

    .directive('hasLikedTw', function ($q, $state, $rootScope, TwitterREST, SocialAuth, $timeout, $ionicPopup, moment) {
        //login to facebook
        function TweetLogin() {
            var d = $q.defer();
            SocialAuth.getTwAuth().then(function (s) {
                // $state.go('app.tab.home');
                // $timeout(function(){
                //     $state.go('app.socialtab.twitter');
                // }, 1000);
                $rootScope.$broadcast('twInit', {});
                d.resolve(s);
            }, function (e) {
                d.reject(e);
            });
            return d.promise;
        }

        return {
            restrict: 'A',
            scope: {
                tweet: "=hasLikedTw",
            },
            template: "<button ng-if='ready' class='button button-small like-button' ng-class=\"{'button-assertive':liked}\"><i class='icon ion-android-favorite'></i></button><ion-spinner ng-if='!ready' icon='lines'></ion-spinner>",
            link: function (s, e, a) {

                e.bind('click', function ($event) {
                    s.ready = false;
                    $event.preventDefault();
                    if (window.localStorage.getItem('TWITTER') === null) {
                        s.ready = true;
                        $ionicPopup.confirm({
                            title: 'Notice',
                            cssClass: 'thx-msg',
                            template: "<p class='text-center'>Please login your twitter account!<p>",
                            cancelText: 'Cancel',
                            cancelType: 'button-assertive',
                            okText: 'OK',
                            okType: 'button-balanced',
                        }).then(function (res) {
                            if (res) {
                                TweetLogin().then(function (s) { }, function (e) { });
                            }
                        });

                        return;
                    }
                    if (!s.liked) {
                        TwitterREST.addLike(s.tweet.id_str).then(function (success) {
                            s.ready = true;
                            s.liked = true;
                            var options = {
                                reward_type: 'twitter',
                                claimed_at: moment().unix(),
                                event: 'like'
                            };

                            SocialAuth.getRewards(options).then(function (s) {

                            }, function (e) {

                            });
                            // if(success){
                            //     s.liked = true;
                            //     // s.total += 1;
                            // }
                        }, function (e) {
                            console.log(e);
                            s.ready = true;
                            //popup
                            var template = "<p class='text-justify'>Session has expired, Please login your Twitter account again!</p>";
                            $ionicPopup.confirm({
                                title: 'Notice',
                                cssClass: 'thx-msg',
                                template: template,
                                cancelText: 'Cancel',
                                cancelType: 'button-assertive',
                                okText: 'OK',
                                okType: 'button-balanced',
                            }).then(function (res) {
                                if (res) {
                                    TweetLogin().then(function (s) { }, function (e) { });
                                }
                            });
                        });
                    }
                    if (s.liked) {
                        TwitterREST.destroyLike(s.tweet.id_str).then(function (success) {
                            s.ready = true;
                            s.liked = false;


                            // if(success){
                            //     s.liked = false;
                            //     // s.total = s.total > 0?s.total-1:0;
                            // }
                        }, function (e) {
                            console.log(e);
                            s.ready = true;
                            var template = "<p class='text-justify'>Session has expired, Please login your Twitter account again!</p>";
                            $ionicPopup.confirm({
                                title: 'Notice',
                                cssClass: 'thx-msg',
                                template: template,
                                cancelText: 'Cancel',
                                cancelType: 'button-assertive',
                                okText: 'OK',
                                okType: 'button-balanced',
                            }).then(function (res) {
                                if (res) {
                                    TweetLogin().then(function (s) { }, function (e) { });
                                }
                            });
                        });
                    }


                });
                // console.log(a);
                // console.log(s.tweet);
                if (window.localStorage.getItem('TWITTER') === null) {
                    s.ready = true;
                    s.liked = false;
                    return;
                }
                // alert(JSON.stringify(s.likedlistings));
                // alert(window.localStorage.getItem('TWITTER'));
                TwitterREST.destroyLike(s.tweet.id_str).then(function () {
                    //need to relike
                    $timeout(function () {
                        TwitterREST.addLike(s.tweet.id_str).then(function () {
                            s.ready = true;
                            s.liked = true;
                        }, function () {
                            s.ready = true;
                        });
                    }, 1500);
                    // s.total = summary.total_count;

                }, function (e) {
                    console.log(e);
                    s.ready = true;
                    s.liked = false;
                });
                // alert(JSON.stringify(s.tweet));
                // TwitterREST.getLikedList().then(function(s){
                //     alert('getLikedList');
                //     console.log(s);
                //     alert(JSON.stringify(s.tweet));
                //     angular.forEach(s, function(item){
                //         if(item.id_str === s.tweet.id_str){
                //             s.liked = true;
                //         }
                //         else{
                //             s.liked = false;
                //         }
                //         s.ready = true;
                //     });
                // }, function(e){
                //     alert(JSON.stringify(e));
                //     s.liked = false;
                //     s.ready = true;
                // });
            }
        }

    })
    .directive('menuCloseKeepHistory', ['$ionicHistory', function ($ionicHistory) {
        return {
            restrict: 'AC',
            link: function ($scope, $element) {
                $element.bind('click', function () {
                    var sideMenuCtrl = $element.inheritedData('$ionSideMenusController');
                    if (sideMenuCtrl) {
                        $ionicHistory.nextViewOptions({
                            historyRoot: false,
                            disableAnimate: true,
                            expire: 300
                        });
                        sideMenuCtrl.close();
                    }
                });
            }
        };
    }])

    .directive('msgNotify', function ($ionicPopup, $state, NotificationService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                messages: "=messages",
            },
            templateUrl: 'templates/msg-notify.html',
            link: function (s, e, a) {
                var removeItem = function (items, id) {
                    NotificationService.read(id).then(function () {
                        var item = items.filter(function (i) {
                            return i.id == id;
                        });
                        items.splice(items.indexOf(item[0]), 1);
                    });
                };

                var doAction = function (msg) {
                    console.log(msg);
                    if (msg.notification.action) {
                        if (msg.notification.action == 'redirect') {
                            if (JSON.parse(msg.notification.payload).id) {
                                $state.go('menu.listing', { id: JSON.parse(msg.notification.payload).id });
                            } else {
                                var page;
                                switch (JSON.parse(msg.notification.payload).page) {
                                    case 'whatson':
                                        page = "menu.tabs.whatson";
                                        break;
                                    case 'event':
                                        page = "menu.tabs.events";
                                        break;
                                    case 'legals':
                                        page = "menu.legals";
                                        break;
                                    case 'ticket':
                                        page = "menu.tabs.tickets";
                                        break;
                                    case 'promotion':
                                        page = "menu.promotions";
                                        break;
                                    case 'account':
                                        page = "menu.tabs.account";
                                        break;
                                    case 'voucher':
                                        page = "menu.vouchers";
                                        break;
                                    case 'about':
                                        page = "menu.about";
                                        break;
                                    case 'location':
                                        page = "menu.tabs.time-location";
                                        break;
                                    case 'refer':
                                        page = "menu.refer";
                                        break;
                                    case 'faq':
                                        page = "menu.faq";
                                        break;
                                    case 'survey':
                                        page = "menu.survey";
                                        break;
                                    case 'favorite':
                                        page = "menu.favor";
                                        break;
                                    case 'profile':
                                        page = "menu.profile";
                                        break;
                                    case 'history':
                                        page = "menu.history";
                                        break;
                                    default:
                                }

                                if (page) {
                                    $state.go(page);
                                }
                            }
                        }

                    }
                }

                s.remove = function (id) {
                    removeItem(s.messages, id)
                };

                s.open = function (msg) {
                    console.log(msg);
                    var icon = (msg.notification.type == 'success') ? 'ion-checkmark-circled balanced' : ((msg.notification.type == 'error') ? 'ion-information-circled assertive' : 'ion-help-circled energized')
                    $ionicPopup.alert({
                        title: "<i class=\"" + icon + "\"></i> " + msg.notification.title,
                        cssClass: 'thx-msg',
                        template: msg.notification.message,
                        okText: 'OK',
                        okType: 'button-color-dark',
                    }).then(function (res) {
                        doAction(msg);
                        removeItem(s.messages, msg.id);
                    });
                }


            }
        }
    })
    .directive('dynamicNavView', function ($compile) {
        return {
            restrict: 'ECA',
            // priority: -400,
            link: function (scope, $element, $attr, ctrl) {
                var dynamicName = scope.$eval($attr.name);
                $element.html('<ion-nav-view name="tab' + dynamicName.id + '"></ion-nav-view>');
                $compile($element.contents())(scope);
            }
        };
    })

    .directive('timeLocation', function ($timeout, $rootScope) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                venue: "=venue",
            },
            templateUrl: 'templates/timeLocationscomponent.html',
            link: function (scope, $element, $attr, ctrl) {
                console.log(scope.venue);

                function createMap(mapOptions) {
                    return new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                };

                function createMarker(map, latLng) {
                    if (angular.isDefined(scope.marker)) {
                        scope.marker.setMap(null);
                    }
                    return new google.maps.Marker({
                        map: map,
                        animation: google.maps.Animation.DROP,
                        position: latLng
                    });
                };

                scope.goToMapApp = function(){
                    console.log(ionic.Platform);
                    var lat = parseFloat(scope.venue.googleGeoCode.geometry.location.lat())
                    var long = parseFloat(scope.venue.googleGeoCode.geometry.location.lng())
                    var text =  encodeURIComponent(scope.venue.googleGeoCode.formatted_address)
                    if(ionic.Platform.isIOS()){
                      // console.log("http://maps.apple.com/?q=#"+text+"&ll=#{lat},#{long}&near=#{lat},#{long}");
                      // window.open("http://maps.apple.com/?q=#{text}&ll=#{lat},#{long}&near=#{lat},#{long}", '_system', 'location=no');
                      window.open("http://maps.apple.com/maps?q="+text, '_system', 'location=no');
                    }
                    else{
                      // console.log("geo:#{lat},#{long}?q=#{text}");
                      window.open("geo:?q="+text, '_system', 'location=yes');
                    }
                
                  };

                $timeout(function(){
                    if(scope.venue.googleGeoCode){
                        // $scope.selectedAdd = '';
                        // $scope.inputAddType = 'from address';
                        // $scope.pick.towards_venue = false;
                        // chooseAddType();
                  
                        var latLng = new google.maps.LatLng(scope.venue.googleGeoCode.geometry.location.lat(), scope.venue.googleGeoCode.geometry.location.lng());
                        var mapOptions = {
                          center: latLng,
                          zoom: 18,
                          mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        console.log(mapOptions);
                        scope.map = createMap (mapOptions);
                        google.maps.event.addListenerOnce(scope.map, 'idle', function(){
                          scope.marker = createMarker(scope.map, latLng);
                        });
                      }
                }, 1000);
            }
        };
    });
