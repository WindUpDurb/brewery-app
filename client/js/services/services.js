"use strict";

var app = angular.module("beerApp");

app.service("AuthServices", function ($http) {
    //var activeUser;

    this.registerNewUser = function (newUserData) {
        return $http.post("/api/users", newUserData);
    };
    
    this.login = function (loginData) {
        return $http.post("/api/users/login", loginData);
    };

    this.logout = function () {
        return $http.delete("/api/users/logout");
    };

    this.retrieveActiveUser = function () {
        return activeUser;
    };
    
    this.isLoggedIn = function () {
        return $http.get("/api/users/activeUser");
    };

/*    this.isLoggedIn = function () {
        $http.get("/api/users/activeUser")
            .then(function (response) {
                console.log("response: ", response);
                activeUser = response.data;
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
    }();*/

});

app.service("BeerServices", function ($http) {
    
    this.beerMe = function () {
       return $http.get("/api/breweryAPI/beerMe");
    };

    this.beerMeUser = function (userId) {
        return $http.put("/api/breweryAPI/beerMeUser", userId);
    };

    this.getSingleBeer = function (beerId) {
        return $http.put("/api/breweryAPI/beerMeSingle", beerId);
    };

    this.getBeerBrowseMenu = function () {
        return $http.get("/api/breweryAPI/beerBrowseMenu");
    };

    this.checkIfConsumed = function (beerId, activeUser) {
        for (var i = 0; i < activeUser.beerSeen.length; i++) {
            if (activeUser.beerSeen[i].beerId === beerId && activeUser.beerSeen[i].consumed) {
                return true;
            }
        }
        return false;
    };

    this.changeIfConsumed = function (consumed, beerId, activeUser) {
        let beerSeen = activeUser.beerSeen;
        let index;
        (function () {
            for (let i = 0; i < beerSeen.length; i++) {
                if (beerSeen[i].beerId === beerId) {
                    index = i;
                }
            }
        }());
        activeUser.beerSeen[index].consumed = consumed;
        activeUser.beerModifying = activeUser.beerSeen[index];
        return $http.put("/api/breweryAPI/updateHasConsumed", activeUser)
    };

    this.getCategoryContents = function (searchParameters) {
        return $http.put("/api/breweryAPI/beerCategoryContents", searchParameters)
    };
    
});



