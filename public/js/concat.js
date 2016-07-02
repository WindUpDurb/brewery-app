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
                    controller: "beerMeController"
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


"use strict";

angular
    .module("beerApp")
    .controller("beerBrowserController", beerBrowserController);

function beerBrowserController($scope, $state, BeerServices) {
    console.log("Beer Browser Controller");

    if ($state.current.name === "beerDirectory") {
        (function() {
            let key = "beerDirectories";
           $scope.beerDirectories = BeerServices.getFromLocalStorage(key);
            console.log("Beer directories: ", $scope.beerDirectories)
            if (!$scope.beerDirectories) {
                BeerServices.getBeerDirectories()
                    .then(function (response) {
                        console.log("Response: ", response.data.data);
                        $scope.beerDirectories = {};
                        for (let i = 0; i < response.data.data.length; i++) {
                            if (response.data.data[i].categoryId <= 9) {
                                if (!$scope.beerDirectories.hasOwnProperty(response.data.data[i].categoryId)) {
                                    $scope.beerDirectories[response.data.data[i].categoryId] = [response.data.data[i]];
                                } else {
                                    $scope.beerDirectories[response.data.data[i].categoryId].push(response.data.data[i]);
                                }
                            }
                        }
                        console.log("Beer Directories: ", $scope.beerDirectories);
                        BeerServices.submitToLocalStorage(key, $scope.beerDirectories);
                    })
                    .catch(function (error) {
                        console.log("Error: ", error);
                    })
            }
        }());
    }

    $scope.takeMeToStyle = function (beer) {
        BeerServices.saveStyleDescription({currentDirectory: beer});
        $state.go("beerBrowseContents", {category: beer.name, pageNumber: 1});
    };

    if ($state.params.category && $state.params.pageNumber) {
        $scope.category = $state.params.category;
        $scope.pageNumber = $state.params.pageNumber;
        (function () {
            let key = `/api/breweryAPI/beerCategoryContents/${$scope.category}/${$scope.pageNumber}`;
            $scope.currentStyle = BeerServices.getFromLocalStorage($scope.category);
            if (!$scope.currentStyle) {
                BeerServices.submitToLocalStorage($scope.category, BeerServices.getSavedStyleDescription());
                $scope.currentStyle = BeerServices.getSavedStyleDescription();
            }
            console.log("This it: ", $scope.currentStyle);
            $scope.nextPage = BeerServices.craftNextPageURL($scope.category, $scope.pageNumber);
            $scope.previousPage = BeerServices.craftPreviousPageURL($scope.category, $scope.pageNumber);
            $scope.categoryContents = BeerServices.getFromLocalStorage(key);
            console.log("category contents: ", $scope.categoryContents)
            BeerServices.craftNextPageURL($scope.category, $scope.pageNumber)
            if (!$scope.categoryContents) {
                BeerServices.getCategoryContents($scope.category, $scope.pageNumber)
                    .then(function (response) {
                        $scope.categoryContents = response.data.data;
                        BeerServices.submitToLocalStorage(key, response.data.data);
                        console.log("Response: ", response.data.data)
                    })
                    .catch(function (error) {
                        console.log("Error: ", error);
                    });
            }
        }());
    }
}
"use strict";

angular
    .module("beerApp")
    .controller("beerController", beerController);

function beerController(BeerServices, $scope, activeUserProfile) {
    console.log("Beer Controller");
    $scope.activeUser = activeUserProfile.data;

    $scope.toDrinkStatistics = BeerServices.countDrankInToDrink($scope.activeUser.toDrink);
    
    $scope.beerMe = function () {
        BeerServices.beerMe()
            .then(function (response) {
                $scope.beerData = response.data;
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
    };
}
"use strict";

angular
    .module("beerApp")
    .controller("beerMeController", beerMeController);

function beerMeController ($scope, BeerServices) {
    console.log("Beer Me Controller");
    console.log("Active User: ", $scope.activeUser);
    if ($scope.activeUser) {
        BeerServices.beerMeUser({ _id: $scope.activeUser._id})
            .then(function (response) {
                $scope.beerData = response.data.data;
                if ($scope.beerData && $scope.beerData.breweries) {
                    $scope.breweryData = $scope.beerData.breweries[0];
                }
                console.log("Response: ", response.data.data)
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });

    } else {
        BeerServices.beerMe()
            .then(function (response) {
                $scope.beerData = response.data.data;
                console.log($scope.beerData)
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
    }
}

"use strict";

angular
    .module("beerApp")
    .controller("beerSearchController", beerSearchController);

function beerSearchController($scope, $state, BeerServices) {
    $scope.query = $state.params.query;
    let queryString = $scope.query.replace(/\s/gi, "%20");
    BeerServices.beerSearch(queryString)
        .then(function (response) {
            $scope.categoryContents = response.data.data;
            console.log("search: ", $scope.categoryContents);
            $scope.beerSearchInput = "";
        })
        .catch(function (error) {
            console.log("Error: ", error);
        });
}
"use strict";

angular
    .module("beerApp")
    .controller("beerViewController", beerViewController);

function beerViewController($scope, $stateParams, BeerServices, Upload, toaster) {
    console.log("Beer View");
    let beerId = $stateParams.beerId;
    (function () {
        let key = `/api/breweryAPI/beerMeSingle/${beerId}`;
        $scope.beerData = BeerServices.getFromLocalStorage(key);
        if ($scope.beerData) {
            $scope.breweryData = $scope.beerData.breweries[0];
            $scope.beerViewHeading = BeerServices.generateBeerViewHeading($scope.beerData.name);
        }
        console.log("Beer Data: ", $scope.beerData);
        console.log("Brewery Data: ", $scope.breweryData);
        if (!$scope.beerData) {
            BeerServices.getSingleBeer(beerId)
                .then(function (response) {
                    $scope.beerData = response.data.data;
                    $scope.breweryData = response.data.data.breweries[0];
                    $scope.beerViewHeading = BeerServices.generateBeerViewHeading($scope.beerData.name);
                    BeerServices.submitToLocalStorage(key, response.data.data);
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                })
        }
    }());
    /*let currentBeerData = BeerServices.checkIfBeerCached(beerId);
    if (currentBeerData) {
        $scope.beerData = currentBeerData.beerData;
        $scope.breweryData = currentBeerData.breweryData;
    }
    if (!currentBeerData) {
        currentBeerData = BeerServices.getCurrentBeerData(beerId)
        $scope.beerData = currentBeerData.beerData;
        $scope.breweryData = currentBeerData.breweryData;
    }
   /!* if (!currentBeerData) {
        let key = `/api/breweryAPI/beerMeSingle/${beerId}`;
        BeerServices.getCurrentBeerData(beerId)
            .then(function (response) {
                $scope.beerData = response.data.data;
                $scope.breweryData = response.data.data.breweries[0];
                BeerServices.submitToLocalStorage(key, response.data.data);
                console.log("To return: ", toReturn)
            })
            .catch(function (error) {
                console.log("Error: ", error);
            })*!/*/
        



    if ($scope.activeUser) {
        $scope.hasConsumed = BeerServices.checkIfConsumed(beerId, $scope.activeUser);
        $scope.inToDrink = BeerServices.inToDrink(beerId, $scope.activeUser);

        for (let i = 0; i < $scope.activeUser.sampledBeers.length; i++) {
            if ($scope.activeUser.sampledBeers[i].beerId === beerId) {
                $scope.currentBeer = $scope.activeUser.sampledBeers[i];
                $scope.beerMemories = $scope.activeUser.sampledBeers[i].beerMemories;
                console.log("Memories: ", $scope.beerMemories)
            }
        }

        $scope.beerRating = function (rating, settingData) {
            $scope.currentRating = rating;
            $scope.ratingArray = [];
            for (let i = 1; i <= rating; i++) {
                $scope.ratingArray.push(i);
            }
            BeerServices.saveBeerRating(beerId, $scope.activeUser, $scope.currentRating)
                .then(function (response) {
                    console.log("Response: ", response);
                    if (!settingData) {
                        BeerServices.ratingMessage($scope.currentRating, $scope.currentBeer.beerName);
                    }
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                })
        };

        $scope.addToToDrink = function () {
            BeerServices.addToToDrink($scope.activeUser, $scope.beerData, $scope.breweryData)
                .then(function (response) {
                    console.log("Response: ", response);
                    $scope.inToDrink = true;
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                })
        };

        if ($scope.hasConsumed) {
            $scope.beerRating($scope.currentBeer.beerRating, true);
        }


        $scope.changeIfConsumed = function (consumed) {
            BeerServices.changeIfConsumed(consumed, $scope.beerData, $scope.breweryData, $scope.activeUser)
                .then(function (response) {
                    $scope.hasConsumed = BeerServices.checkIfConsumed(beerId, response.data);
                    if (consumed) {
                        toaster.pop("info", "One beer down.", "Now rate it at the top of the page, or scroll down to add photos.");
                    } else {
                        toaster.pop("info", "I See.", "Looks like you never drank that beer.");
                    }
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                });
        };

        $scope.submitBeerMemory = function (newBeerPhoto) {
            Upload.upload({
                    url: `/api/users/uploadPhoto/${$scope.activeUser._id}/${beerId}/`,
                    data: { newBeerPhoto: newBeerPhoto }
                })
                .then(function (response) {
                    console.log("Response: ", response);
                    toaster.pop("success", "Upload successful.", "Your beer memory has been stored.");

                })
                .catch(function (error) {
                    console.log("Error: ", error);
                    toaster.pop("error", "Uh-oh.", "Your beer memory was unable to be saved.");
                })
        };


        $scope.currentIndex = 0;

        $scope.setCurrentSlideIndex = function (index) {
            $scope.currentIndex = index;
        };

        $scope.isCurrentSlideIndex = function (index) {
            return $scope.currentIndex === index;
        };

        $scope.previousSlide = function () {
            $scope.currentIndex = ($scope.currentIndex < $scope.beerMemories.length - 1) ? ++$scope.currentIndex : 0;
        };

        $scope.nextSlide  = function () {
            $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.beerMemories.length - 1;
        };
        //Check out http://onehungrymind.com/build-sweet-photo-slider-angularjs-animate/ for animation effects on the gallery

    }
}
"use strict";

var app = angular.module("beerApp");

app.controller("mainController", function ($scope, $state, AuthServices, BeerServices, toaster) {
    console.log("Main Controller");

    AuthServices.isLoggedIn()
        .then(function (response) {
            $scope.activeUser = response.data;
            AuthServices.activeUser = $scope.activeUser;
            console.log("activeUser: ", $scope.activeUser)
        })
        .catch(function (error) {
            console.log("Error: ", error);
        });
    
    $scope.submitRegistration = function (newUserData) {
        if (newUserData.password === newUserData.passwordConfirm) {
            AuthServices.registerNewUser(newUserData)
                .then(function (response) {
                    $state.go("home");
                    toaster.pop("success", "Sweet! Registration was successful.", "Login, and onward to beer.");
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                    toaster.pop("error", "Registration Failed", error.data.error);
                });
        } else {
            toaster.pop("error", "Passwords must match.", "Please confirm your password.");

        }
    };

    $scope.login = function (loginData) {
        AuthServices.login(loginData)
            .then(function (response) {
                $scope.activeUser = response.data;
                $state.go("home");
                toaster.pop("success", "Welcome.", "Now, onward to beer.");
            })
            .catch(function (error) {
                console.log("Error: ", error);
                toaster.pop("error", "Login Failed", "Username and or Password is Incorrect.");
            });
    };
    
    $scope.logout = function () {
        AuthServices.logout()
            .then(function (response) {
                $scope.activeUser = null;
                toaster.pop("success", "Until next time.", "Drink up.");
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
    };

    $scope.beerSearch = function (query) {
        let queryString = query.replace(/\s/gi, "%20");
        $state.go("beerSearchResults", { query: queryString });
        $scope.beerSearchInput = null;
    };
    
});

app.controller("drankGalleryController", function ($scope, Upload) {
    $scope.submit = function () {
        console.log("Submit");
        console.log("$scope.file: ", $scope.beerPhoto);
/*
        Upload.upload({
                url: "/api/images/upload",
                data: { newFile: $scope.file }
            })
            .then(function (response) {
                console.log("Response: ", response);
            })
            .catch(function (error) {
                console.log("Error: ", error);
            })*/
    };

});

app.controller("profileController", function ($scope, AuthServices, activeUserProfile, BeerServices) {
    console.log("Profile Controller");
    $scope.activeUser = activeUserProfile.data;
    $scope.accountDetails = angular.copy($scope.activeUser);
    $scope.updateUser = function () {
        AuthServices.updateUser($scope.accountDetails)
            .then(function (response) {
                console.log("Response: ", response);
                toaster.pop("success", "Update Successful.", "Now, onward to beer.");
            })
            .catch(function (error) {
                console.log("Error: ", error);
                toaster.pop("error", "There was an issue with the update.", "Your password may be incorrect.");
            });
    };
    $scope.beerLog = $scope.activeUser.beerSeen;
    $scope.beersDrank = $scope.activeUser.sampledBeers;
    $scope.drankStatistics = BeerServices.generateDrankStatistics($scope.activeUser.sampledBeers);
    $scope.createRatingStars = function (rating) {
        return new Array(rating);
    };
});

//needed for dropdown
app.controller("dropdownController", function () {
});
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

    this.beerMeUser = function (userId) {
        return $http.put("/api/breweryAPI/beerMeUser", userId);
    };

    this.getSingleBeer = function (beerId) {
        return $http({
            url: `/api/breweryAPI/beerMeSingle/${beerId}`,
            method: "GET"
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
        let beerSeen = activeUser.beerSeen;
        let beerId = beerData.id;
        console.log("beerData: ", beerData)
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
                beerId: beerData.id,
                breweryName: breweryData.name,
                beerImage: beerData.labels.medium || `https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg`,
                beerName: beerData.name,
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



