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
        .state("beerBrowseContents", {
            parent: "beerBrowse",
            url: "/contents/:category/:pageNumber",
            views: {
                "contents": {
                    templateUrl: "/html/beerBrowseContents.html",
                    controller: "beerBrowserController"
                }
            }
        })
        .state("beerSearchResults", {
            parent: "beerBrowse",
            url: "/search/:query",
            views: {
                "contents": {
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
    $scope.beerBrowseMenu = BeerServices.getFromLocalStorage("/api/breweryAPI/beerBrowseMenu");
    if (!$scope.beerBrowseMenu) {
        BeerServices.getBeerBrowseMenu()
            .then(function (response) {
                $scope.beerBrowseMenu = response.data.data;
                BeerServices.submitToLocalStorage("/api/breweryAPI/beerBrowseMenu", response.data.data);
                console.log($scope.beerBrowseMenu);
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
    }
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

    if ($scope.activeUser) {

        $scope.hasConsumed = BeerServices.checkIfConsumed(beerId, $scope.activeUser);

        for (let i = 0; i < $scope.activeUser.sampledBeers.length; i++) {
            if ($scope.activeUser.sampledBeers[i].beerId === beerId) {
                $scope.beerMemories = $scope.activeUser.sampledBeers[i].beerMemories;
                console.log("Memories: ", $scope.beerMemories)
            }
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



