angular.module('app.filters', [])


    .filter('hrefToJS', function ($sce, $sanitize) {
        return function (text) {
            var regex = /href="([\S]+)"/g;
            var newString = $sanitize(text).replace(regex, "onClick=\"window.open('$1', '_blank', 'location=yes')\"");
            return $sce.trustAsHtml(newString);
        }
    })

    // .filter('range', function() {
    //   return function(input, min, max) {
    //     min = parseInt(min); //Make string into int
    //     max = parseInt(max);
    //     for (var i=min; i<max; i++)
    //       input.push(i);
    //     return input;
    //   }
    // })

    .filter('month', function () {
        return function (input, min, max) {
            for (var i = min; i <= max; i++)
                input.push(i);
            return input;
        }
    })

    .filter('year', function () {
        return function (input, add) {
            cYear = new Date().getFullYear();
            for (var i = cYear; i <= cYear + 10; i++) {
                var y = i.toString().substr(2, 2);
                input.push(y);
            }
            return input;
        }
    })

    //Twitter filters
    .filter('formatTwitterDate', function () {
        /*
         Calculates time ago
         */
        return function (input) {
            var rightNow = new Date();
            var then = new Date(input);

            var diff = rightNow - then;
            var second = 1000,
                minute = second * 60,
                hour = minute * 60,
                day = hour * 24,
                week = day * 7;
            if (isNaN(diff) || diff < 0) {
                return ""; // return blank string if unknown
            }
            if (diff < second * 2) {
                // within 2 seconds
                return "right now";
            }
            if (diff < minute) {
                return Math.floor(diff / second) + " seconds ago";
            }
            if (diff < minute * 2) {
                return "about 1 minute ago";
            }
            if (diff < hour) {
                return Math.floor(diff / minute) + " minutes ago";
            }
            if (diff < hour * 2) {
                return "about 1 hour ago";
            }
            if (diff < day) {
                return Math.floor(diff / hour) + " hours ago";
            }
            if (diff > day && diff < day * 2) {
                return "yesterday";
            }
            if (diff < day * 365) {
                return Math.floor(diff / day) + " days ago";
            }
            else {
                return "over a year ago";
            }
        };
    })

    .filter('formatTwitterText', function () {
        /*
         Parses tweet text for links, hashes etc.
         */
        return function (tweet) {
            TweetFunc = {
                link: function (tweet) {
                    return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function (link, m1, m2, m3, m4) {
                        var http = m2.match(/w/) ? 'http://' : '';
                        return '<a class="twtr-hyperlink" ng-click="innapBrowser(\'' + http + m1 + '\')">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
                        // return '<a class="twtr-hyperlink" ng-click="innapBrowser(\'' + http + m1 + '\')">' + m1 + '</a>' + m4;

                    });
                },
                at: function (tweet) {
                    return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g, function (m, username) {
                        return '<a class="twtr-atreply" ng-click="innapBrowser(\'http://twitter.com/intent/user?screen_name=' + username + '\')">@' + username + '</a>';
                    });
                },
                list: function (tweet) {
                    return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, function (m, userlist) {
                        return '<a class="twtr-atreply" ng-click="innapBrowser(\'http://twitter.com/' + userlist + '\')">@' + userlist + '</a>';
                    });
                },
                hash: function (tweet) {
                    return tweet.replace(/(^|\s+)#(\w+)/gi, function (m, before, hash) {
                        return before + '<a target="_blank" class="twtr-hashtag" ng-click="innapBrowser(\'http://twitter.com/search?q=%23' + hash + '\')">#' + hash + '</a>';
                    });
                }
            }

            return TweetFunc.hash(TweetFunc.at(TweetFunc.list(TweetFunc.link(tweet))));
        }
    })

    .filter('PinToTop', function () {
        function CustomOrder(listing) {
            var index = 1;
            // console.log(listing.tags);
            if (angular.isDefined(listing.tags) && listing.tags.length > 0) {
                angular.forEach(listing.tags, function (tag) {
                    if (tag.tag.name == 'Pin to Top') {
                        index = 0;
                    }
                });
            }

            return index;
        }

        return function (listings) {
            // var list = JSON.parse(JSON.stringify(listings));
            // console.log(list);
            var filtered = [];
            var unfiltered = [];
            angular.forEach(listings, function (listing) {
                var isPinToTop = false;
                if (angular.isDefined(listing.tags) && listing.tags.length > 0) {
                    angular.forEach(listing.tags, function (tag) {
                        // console.log(tag);
                        if (tag.tag != null && tag.tag.name == 'Pin to Top') {
                            isPinToTop = true;
                        }
                    });
                }
                if (isPinToTop) {
                    filtered.push(listing);
                }
            });
            angular.forEach(listings, function (listing) {
                if (filtered.indexOf(listing) < 0) {
                    unfiltered.push(listing);
                }
            })
            // console.log(filtered);

            filtered = filtered.concat(unfiltered);

            return filtered;
        };
    })

    .filter('range', function () {
        return function (input, total) {
            total = parseInt(total);
            for (var i = 0; i < total; i++) {
                input.push(i);
            }
            return input;
        };

    })

    .filter('bookingFilter', function () {
        return function (bookings) {
            var res = bookings.filter(function (booking) {
                return booking.status == 'confirmed' || booking.status == 'pending';
            });
            return res;
        };
    })

    .filter('dateRange', function () {
        return function (orders, filter) {
            if (angular.isDefined(filter.from) && filter.from != null) {
                orders = orders.filter(function (order) {
                    return moment(order.created_at) >= moment(filter.from);
                });
            }
            if (angular.isDefined(filter.to) && filter.to != null) {
                orders = orders.filter(function (order) {
                    return moment(order.created_at) <= moment(filter.to).add(1, 'days');
                });
            }
            return orders;
        };
    })

    .filter('OrderByVenue', function () {
        return function (listings, venues, filter) {

            // console.log(listings, venues, filter);
            var selectedVenue = angular.copy(venues);
            var newListings = [];

            if (filter) {
                selectedVenue = venues.filter(function (v) {
                    return v.id == filter;
                });
            }




            selectedVenue.forEach(function (venue) {
                var lisingsOfVenue = listings.filter(function (listing) {
                    return newListings.indexOf(listing) < 0 && listing.listing.venue.id == venue.id;
                });
                newListings = newListings.concat(lisingsOfVenue);
            });


            // console.log(newListings);
            // return newListings;
            return newListings;
        };
    });
