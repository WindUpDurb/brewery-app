"use strict";

var app = angular.module("beerApp", ["ui.router", "ngAnimate", "ui.bootstrap", "ngFileUpload", "LocalStorageModule"]);

app.config(function ($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

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

            /*,
            resolve: {
                currentBeerData: function ($stateParams, BeerServices) {
                    let beerId = $stateParams.beerId;
                    if (BeerServices.checkIfBeerCached(beerId)) {
                        console.log("HEre")
                        return BeerServices.checkIfBeerCached(beerId);
                    } else {
                        BeerServices.getCurrentBeerData(beerId)
                            .then(function (response) {
                                let toReturn = {};
                                toReturn.beerData = response.data.data;
                                toReturn.breweryData = response.data.data.breweries[0];
                                console.log("To return: ", toReturn)
                                BeerServices.submitToLocalStorage(key, response.data.data);
                                return toReturn;
                            })
                            .catch(function (error) {
                                console.log("Error: ", error);
                            })

                    }

                }
            }*/
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


"use strict";

angular
    .module("beerApp")
    .controller("beerBrowserController", beerBrowserController);

function beerBrowserController($scope, $state, BeerServices) {
    console.log("Beer Browser Controller");
    console.log("Params: ", $state.params);
    if ($state.params.category && $state.params.pageNumber) {
        let category = $state.params.category;
        let pageNumber = $state.params.pageNumber;
        (function () {
            let key = `/api/breweryAPI/beerCategoryContents/${category}/${pageNumber}`;
            $scope.nextPage = BeerServices.craftNextPageURL(category, pageNumber);
            $scope.previousPage = BeerServices.craftPreviousPageURL(category, pageNumber);
            $scope.categoryContents = BeerServices.getFromLocalStorage(key);
            console.log("category contents: ", $scope.categoryContents)
            BeerServices.craftNextPageURL(category, pageNumber)
            if (!$scope.categoryContents) {
                BeerServices.getCategoryContents(category, pageNumber)
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

function beerController(BeerServices, AuthServices, $state, $scope) {
    console.log("Beer Controller");
    let activeUser = AuthServices.activeUser;
    if ($state.current.name === "beerMeRandom") {
        if ($scope.activeUser) {
            BeerServices.beerMeUser({ _id: activeUser._id})
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
    .controller("beerSearchController", beerSearchController);

function beerSearchController($scope, $state, BeerServices) {
    let query = $state.params.query;
    let queryString = query.replace(/\s/gi, "%20");
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

function beerViewController($scope, $stateParams, BeerServices, Upload) {
    console.log("Beer View");
    let beerId = $stateParams.beerId;
    (function () {
        let key = `/api/breweryAPI/beerMeSingle/${beerId}`;
        $scope.beerData = BeerServices.getFromLocalStorage(key);
        if ($scope.beerData) {
            $scope.breweryData = $scope.beerData.breweries[0];
        }
        console.log("Beer Data: ", $scope.beerData);
        console.log("Brewery Data: ", $scope.breweryData);
        if (!$scope.beerData) {
            BeerServices.getSingleBeer(beerId)
                .then(function (response) {
                    $scope.beerData = response.data.data;
                    $scope.breweryData = response.data.data.breweries[0];
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

        $scope.beerRating = function (rating) {
            $scope.currentRating = rating;
            $scope.ratingArray = [];
            for (let i = 1; i <= rating; i++) {
                $scope.ratingArray.push(i);
            }
            BeerServices.saveBeerRating(beerId, $scope.activeUser, $scope.currentRating)
                .then(function (response) {
                    console.log("Response: ", response);
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
            $scope.beerRating($scope.currentBeer.beerRating);
        }


        $scope.changeIfConsumed = function (consumed) {
            BeerServices.changeIfConsumed(consumed, beerId, $scope.beerData.name, $scope.activeUser)
                .then(function (response) {
                    $scope.hasConsumed = BeerServices.checkIfConsumed(beerId, response.data);
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
                })
                .catch(function (error) {
                    console.log("Error: ", error);
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

app.controller("mainController", function ($scope, $state, AuthServices, BeerServices) {
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
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                });
        } else {
            alert("Passwords must match.");
        }
    };

    $scope.login = function (loginData) {
        AuthServices.login(loginData)
            .then(function (response) {
                $scope.activeUser = response.data;
                $state.go("home");
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
    };
    
    $scope.logout = function () {
        AuthServices.logout()
            .then(function (response) {
                $scope.activeUser = null;
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

app.controller("profileController", function ($scope, AuthServices, activeUserProfile) {
    console.log("Profile Controller");
    $scope.activeUser = activeUserProfile.data;
    $scope.beerLog = $scope.activeUser.beerSeen;
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
    
    this.isLoggedIn = function () {
        return $http.get("/api/users/activeUser");
    };


});

app.service("BeerServices", function ($http, localStorageService) {
    var _this = this;

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

    this.craftNextPageURL = function (category, currentPage) {
        let pageNumber = (parseInt(currentPage) + 1).toString();
        return `/#/beerBrowser/contents/${category}/${pageNumber}`
    };

    this.craftPreviousPageURL = function (category, currentPage) {
        let pageNumber = (parseInt(currentPage) - 1).toString();
        return `/#/beerBrowser/contents/${category}/${pageNumber}`
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



