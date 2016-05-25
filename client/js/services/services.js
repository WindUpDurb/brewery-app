"use strict";

var app = angular.module("beerApp");

app.service("AuthServices", function ($http) {

    this.registerNewUser = function (newUserData) {
        return $http.post("/api/users", newUserData);
    };
    
    this.login = function (loginData) {
        return $http.post("/api/users/login", loginData);
    };

    this.logout = function () {
        return $http.delete("/api/users/logout");
    };
    
    this.isLoggedIn = function () {
        return $http.get("/api/users/activeUser");
    };

});

app.service("BeerServices", function ($http) {
    
    this.beerMe = function () {
       return $http.get("/api/breweryAPI/beerMe");
    }
    
})



