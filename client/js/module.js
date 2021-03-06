"use strict";

var app = angular.module("beerApp", ["ui.router", "toaster", "angular-loading-bar", "ngAnimate", "ui.bootstrap", "ngFileUpload", "LocalStorageModule"]);


app.config(function ($stateProvider, $urlRouterProvider, localStorageServiceProvider, $uiViewScrollProvider) {
    //for returning to the top of the page when changing states
    $uiViewScrollProvider.useAnchorScroll();
    localStorageServiceProvider
        .setPrefix("drink-drink");
    $stateProvider
        .state("home", {
            url : "/",
            views: {
                "body": {
                    templateUrl: "/html/home.html",
                    controller: "beerBrowserController"
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
        .state("accountManagement", {
            url: "/accountManagement",
            views: {
                "body": {
                    templateUrl: "/html/register.html",
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
        .state("beerDirectory", {
            url: "/beerBrowser",
            views: {
                "body": {
                    templateUrl: "/html/beerDirectory.html",
                    controller: "beerBrowserController"
                }
            }
        })
        .state("beerBrowseContents", {
            url: "/beerBrowser/:category/:pageNumber",
            views: {
                "body": {
                    templateUrl: "/html/beerBrowseContents.html",
                    controller: "beerBrowserController"
                }
            }
        })
        .state("toDrink", {
            url: "/toDrink",
            views: {
                "body": {
                    templateUrl: "/html/toDrink.html",
                    controller: "beerController"
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
        .state("beerSearchResults", {
            url: "/search/:query",
            views: {
                "body": {
                    templateUrl: "/html/beerSearchResults.html",
                    controller: "beerSearchController"
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
        .state("beerLogPage", {
            parent: "beerLog",
            url: "/:page",
            views: {
                "beerLogPage": {
                    templateUrl: "/html/beerLogPage.html"
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
            }
        })
        .state("beerMeRandom", {
            url: "/beerMe",
            views: {
                "body": {
                    templateUrl: "/html/randomBeer.html",
                    controller: "beerViewController"
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
        });

    $urlRouterProvider.otherwise("/");
});

