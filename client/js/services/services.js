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

app.service("BeerServices", function ($http, localStorageService) {


    this.getFromLocalStorage = function (key) {
        return localStorageService.get(key);
    };

    this.submitToLocalStorage = function (key, value) {
        return localStorageService.set(key, value);
    };
    
    this.beerMe = function () {
       return $http.get("/api/breweryAPI/beerMe");
    };

    this.beerSearch = function (queryString) {
        return $http.get(`/api/breweryAPI/beerSearch/${queryString}`);
    };

    this.beerMeUser = function (userId) {
        return $http.put("/api/breweryAPI/beerMeUser", userId);
    };

    this.getSingleBeer = function (beerId) {
        return $http({
            url: `/api/breweryAPI/beerMeSingle/${beerId}`,
            method: "GET"
        });
    };

    this.getBeerBrowseMenu = function () {
        return $http({
            url: "/api/breweryAPI/beerBrowseMenu",
            method: "GET"
           // cache: true
        });
    };

    this.checkIfConsumed = function (beerId, activeUser) {
        for (let i = 0; i < activeUser.beerSeen.length; i++) {
            if (activeUser.beerSeen[i].beerId === beerId && activeUser.beerSeen[i].consumed) {
                return true;
            }
        }
        for (let i = 0; i < activeUser.sampledBeers.length; i++) {
            if (activeUser.sampledBeers[i].beerId === beerId) {
                return true;
            }
        }
        return false;
    };

    this.changeIfConsumed = function (consumed, beerId, beerName, activeUser) {
        let beerSeen = activeUser.beerSeen;
        let index;
        (function () {
            for (let i = 0; i < beerSeen.length; i++) {
                if (beerSeen[i].beerId === beerId) {
                    return index = i;
                }
            }
            index = -1;
        }());

        if (index === -1) {
            activeUser.nonBeerMeBeer = {
                beerId: beerId,
                beerName: beerName,
                consumed: consumed
            }
        } else {
            activeUser.beerSeen[index].consumed = consumed;
            activeUser.beerModifying = activeUser.beerSeen[index];
        }
        console.log("modifying: ", activeUser)
        return $http.put("/api/breweryAPI/updateHasConsumed", activeUser)
    };

    this.getCategoryContents = function (categoryName, pageNumber) {
        return $http({
            url: `/api/breweryAPI/beerCategoryContents/${categoryName}/${pageNumber}`,
            method: "GET",
            cache: true
        });
    };

    this.craftNextPageURL = function (category, currentPage) {
        let pageNumber = (parseInt(currentPage) + 1).toString();
        return `/#/beerBrowser/contents/${category}/${pageNumber}`
    };

    this.craftPreviousPageURL = function (category, currentPage) {
        let pageNumber = (parseInt(currentPage) - 1).toString();
        return `/#/beerBrowser/contents/${category}/${pageNumber}`
    };

});



