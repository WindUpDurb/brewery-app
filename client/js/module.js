"use strict";

var app = angular.module("beerApp", ["ui.router", "ngAnimate", "ui.bootstrap", "ngFileUpload"]);

app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state("home", {
            url : "/",
            views: {
                "body": {
                    templateUrl: "/html/home.html"
                }
            }
        })
        .state("login", {
            url: "/login",
            views: {
                "body": {
                    templateUrl: "/html/login.html"
                }
            }
        })
        .state("register", {
            url: "/register",
            views: {
                "body": {
                    templateUrl: "/html/register.html"
                }
            }
        })
        .state("beerBrowse", {
            url: "/beerBrowser",
            views: {
                "body": {
                    templateUrl: "/html/beerBrowse.html",
                    controller: "beerBrowserController"
                }
            }
        })
        .state("beerLog", {
            url: "/beerLog",
            views: {
                "body": {
                    templateUrl: "/html/beerlog.html",
                    controller: "profileController"
                }
            },
            resolve: {
               activeUserProfile: function (AuthServices, $state) {
                   return AuthServices.isLoggedIn()
                       .catch(function () {
                           $state.go("home");
                       })
               }
            }
        })
        .state("beerView", {
            url: "/beer/:beerId",
            views: {
                "body": {
                    templateUrl: "/html/beerView.html",
                    controller: "beerViewController"
                }
            },
            resolve: {
                singleBeerData: function (BeerServices, $stateParams) {
                    let beerId = $stateParams.beerId;
                    return BeerServices.getSingleBeer({beerId: beerId})
                        .catch(function (error) {
                            console.log("Error: ",error);
                        });
                }
            }
        })
        .state("beerMeRandom", {
            url: "/beerMe",
            views: {
                "body": {
                    templateUrl: "/html/randomBeer.html",
                    controller: "beerController"
                }
            }
        })
        .state("drank-beersConsumed", {
            url: "/drank",
            views: {
                "body": {
                    templateUrl: "/html/drank.html",
                    controller: "profileController"
                }
            },
            resolve: {
                activeUserProfile: function (AuthServices, $state) {
                    return AuthServices.isLoggedIn()
                        .catch(function () {
                            $state.go("home");
                        })
                }
            }
        })
        .state("drunk-personalGallery", {
            url: "/drunk",
            views: {
                "body": {
                    templateUrl: "/html/drunk-gallery.html",
                    controller: "drankGalleryController"
                }
            }
        })

    $urlRouterProvider.otherwise("/");
});

