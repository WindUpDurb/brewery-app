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

    this.updateUser = function (toUpdateWith) {
        return $http({
            method: "PUT",
            data: toUpdateWith,
            url: "/api/users"
        });
    };

    this.isLoggedIn = function () {
        return $http.get("/api/users/activeUser");
    };


});

app.service("BeerServices", function ($http, localStorageService, toaster) {
    var _this = this;
    var nextBeerStyle;
    
    this.saveStyleDescription = function (style) {
        nextBeerStyle = style;  
    };
    
    this.getSavedStyleDescription = function () {
        return nextBeerStyle;  
    };

    this.getBeerDirectories = function () {
        return $http.get("/api/breweryAPI/beerDirectories");
    };

    this.generateBeerViewHeading = function (beerName) {
        let headingList = [`Here's a single serving of ${beerName}.`, `Let's see. Here's a ${beerName}.`, `Drink up. Here's a ${beerName}.`, `You looked parched. How about a ${beerName}.`, `Catch this ${beerName}.`, `Quick. Shotgun this ${beerName}. Now.`, `No, this? It's just a ${beerName}.`];
        return headingList[Math.floor(Math.random() * headingList.length)];
    };

    this.saveBeerRating = function (beerId, activeUser, newBeerRating) {
        let toSend = {
            beerId: beerId,
            newBeerRating: newBeerRating,
            _id: activeUser._id
        };
        return $http.post("/api/users/saveBeerRating", toSend);
    };
    
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

   /* this.beerMeUser = function (userId) {
        return $http.put("/api/breweryAPI/beerMeUser", userId);
    };*/

    this.getSingleBeer = function (beerId) {
        return $http({
            url: `/api/breweryAPI/beerMeSingle/${beerId}`,
            method: "GET"
        });
    };
    
    this.checkIfConsumed = function (beerId, activeUser) {
       /* for (let i = 0; i < activeUser.beerSeen.length; i++) {
            if (activeUser.beerSeen[i].beerId === beerId && activeUser.beerSeen[i].consumed) {
                return true;
            }
        }*/
        for (let i = 0; i < activeUser.sampledBeers.length; i++) {
            if (activeUser.sampledBeers[i].beerId === beerId) {
                return true;
            }
        }
        return false;
    };
    
    this.inToDrink = function (beerId, activeUser) {
        for (let i = 0; i < activeUser.toDrink.length; i++) {
            if (activeUser.toDrink[i].beerId === beerId) {
                return true;
            }
        }
        return false;
    };

    this.addToToDrink = function (activeUser, beerData, breweryData) {
        let beerImage = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
        if (beerData.labels) {
            beerImage = beerData.labels.medium || beerData.labels.large || beerData.labels.icon;
        }
        let toSend = {
            _id: activeUser._id,
            newToDrink: {
                breweryName: breweryData.name,
                beerName: beerData.name,
                beerId: beerData.id,
                image: beerImage
            }
        };
        return $http.post("/api/users/addToToDrink", toSend);
    };

    this.changeIfConsumed = function (consumed, beerData, breweryData, activeUser) {
        //I was getting an error if I had beerData.labels.medium || `the link`
        //as the value in the object property below
        //look into why
        if (beerData.labels && beerData.labels.medium) {
            var beerLabel = beerData.labels.medium;
        }
        activeUser.nonBeerMeBeer = {
            beerId: beerData.id,
            breweryName: breweryData.name,
            beerImage: beerLabel || `https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg`,
            beerName: beerData.name,
            consumed: consumed
        };
        console.log("modifying: ", activeUser);
        return $http.put("/api/breweryAPI/updateHasConsumed", activeUser)
    };

    this.getCategoryContents = function (categoryName, pageNumber) {
        return $http({
            url: `/api/breweryAPI/beerCategoryContents/${categoryName}/${pageNumber}`,
            method: "GET",
            cache: true
        });
    };

    this.countDrankInToDrink = function (toDrinkArray) {
        let toReturn = {
            drank: 0,
            haveNotDrank: 0,
            totalInToDrink: 0
        };
        for (let i = 0; i < toDrinkArray.length; i++) {
            if (toDrinkArray[i].finallyDrank) {
                toReturn.drank++;
                toReturn.totalInToDrink++;
            } else {
                toReturn.haveNotDrank++;
                toReturn.totalInToDrink++;
            }
        }
        return toReturn;
    };

    this.ratingMessage = function (rating, beer) {
        console.log("Rating: ", rating)
        if (rating <= 3 ) {
            toaster.pop("info", "Meh.", `And they call this ${beer} a beer, right? A ${rating} is barely a beer in our book.`);
        } else if (rating <= 6) {
            toaster.pop("info", "A beer is a beer.", `And we'll take this ${beer} to drink. Most of the time.`);
        } else if (rating <= 8 ) {
            toaster.pop("info", `Give us some of that ${beer}`, `It's deserving of these ${rating} golden beers.`);
        } else if (rating == 9) {
            toaster.pop("info", `Oh, snaps.`, `This here ${beer} is a damn ${rating}.`);
        } else if (rating == 10) {
            toaster.pop("info", `F***ing S**t. We got ourselves a ${rating}`, `This--this here ${beer}--is thee beer.`);
        }
    };

    this.generateDrankStatistics = function (drinkData) {
        // Look into saving more data, such as the type of Beer drank
        // so that we can offer statistics on the commonly consumed beer,
        // most and least favorite by type and so on
        let drankStatistics = {
            beersDrank: drinkData.length,
            highestRatedBeer: 0,
            lowestRatedBeer: 10,
            averageRatedBeer: 0
        };
        let sumOfAllBeers = 0;
        for (let i = 0; i < drinkData.length; i++) {
            if (drinkData[i].beerRating < drankStatistics.lowestRatedBeer) {
                drankStatistics.lowestRatedBeer = drinkData[i].beerRating;
            }
            if (drinkData[i].beerRating > drankStatistics.highestRatedBeer) {
                drankStatistics.highestRatedBeer = drinkData[i].beerRating;
            }
            sumOfAllBeers += drinkData[i].beerRating;
        }
        drankStatistics.averageRatedBeer = Math.floor(sumOfAllBeers /= drinkData.length);
        return drankStatistics;
    };

    this.craftNextPageURL = function (category, currentPage) {
        let pageNumber = (parseInt(currentPage) + 1).toString();
        return `/#/beerBrowser/${category}/${pageNumber}`
    };

    this.craftPreviousPageURL = function (category, currentPage) {
        let pageNumber = (parseInt(currentPage) - 1).toString();
        return `/#/beerBrowser/${category}/${pageNumber}`
    };
/*
    this.checkIfBeerCached = function (beerId) {
        let key = `/api/breweryAPI/beerMeSingle/${beerId}`;
        let toReturn = {};
        toReturn.beerData = _this.getFromLocalStorage(key);
        if (toReturn.beerData) {
            toReturn.breweryData = toReturn.beerData.breweries[0];
            return toReturn;
        } else {
            return false;
        }
    };
    
    this.getCurrentBeerData = function (beerId) {
        let key = `/api/breweryAPI/beerMeSingle/${beerId}`;
        let toReturn = {};
        /!* toReturn.beerData = _this.getFromLocalStorage(key);
         if (toReturn.beerData) {
             toReturn.breweryData = toReturn.beerData.breweries[0];
             return toReturn;
         }*!/
        _this.getSingleBeer(beerId)
            .then(function (response) {
                toReturn.beerData = response.data.data;
                toReturn.breweryData = response.data.data.breweries[0];
                _this.submitToLocalStorage(key, response.data.data);
                console.log("To Retrun: ", toReturn);
                return toReturn;
            })
            .catch(function (error) {
                console.log("Error: ", error);
            })
    };*/

});



