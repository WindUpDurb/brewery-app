"use strict";

var app = angular.module("beerApp", ["ui.router"]);

app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state("home", {
            url : "/"
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


    $urlRouterProvider.otherwise("/");
});