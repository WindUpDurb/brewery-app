"use strict";

var app = angular.module("beerApp", ["ui.router", "ngAnimate", "ui.bootstrap", "ngFileUpload", "slickCarousel"]);

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
"use strict";

var app = angular.module("beerApp");

app.controller("mainController", function ($scope, $state, AuthServices) {
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
    
});

app.controller("beerViewController", function ($scope, $stateParams, singleBeerData, BeerServices, Upload) {
    console.log("Beer View");
    let beerId = $stateParams.beerId;
    $scope.beerData = singleBeerData.data.data;
    for (let i = 0; i < $scope.activeUser.sampledBeers.length; i++) {
        if ($scope.activeUser.sampledBeers[i].beerId === beerId) {
            $scope.beerMemories = $scope.activeUser.sampledBeers[i].beerMemories;
            console.log("Memories: ", $scope.beerMemories)
        }
    }


    $scope.hasConsumed = BeerServices.checkIfConsumed(beerId, $scope.activeUser);
    
    $scope.changeIfConsumed = function (consumed) {
        BeerServices.changeIfConsumed(consumed, beerId, $scope.beerData.name, $scope.activeUser)
            .then(function (response) {
                $scope.hasConsumed = BeerServices.checkIfConsumed(beerId, response.data);
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
    };

    console.log("In beerView: ", $scope.hasConsumed);


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


});

app.controller("beerController", function (BeerServices, AuthServices, $state, $scope) {
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

});

app.controller("beerBrowserController", function ($scope, BeerServices) {
    console.log("Beer Browser Controller");



    BeerServices.getBeerBrowseMenu()
        .then(function (response) {
            $scope.beerBrowseMenu = response.data.data;
            console.log($scope.beerBrowseMenu);
        })
        .catch(function (error) {
            console.log("Error: ", error);
        });

    $scope.getCategoryContents = function (category, pageNumber) {
        let searchParameters = {};
        searchParameters.categoryName = category;
        searchParameters.pageNumber = pageNumber;
        BeerServices.getCategoryContents(searchParameters)
            .then(function (response) {
                $scope.categoryContents = response.data.data;
                console.log("Response: ", response.data.data)
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
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

app.service("BeerServices", function ($http) {
    
    this.beerMe = function () {
       return $http.get("/api/breweryAPI/beerMe");
    };

    this.beerMeUser = function (userId) {
        return $http.put("/api/breweryAPI/beerMeUser", userId);
    };

    this.getSingleBeer = function (beerId) {
        return $http({
            url: "/api/breweryAPI/beerMeSingle",
            method: "PUT",
            cache: true,
            data: beerId
        });
    };

    this.getBeerBrowseMenu = function () {
        return $http({
            url: "/api/breweryAPI/beerBrowseMenu",
            method: "GET",
            cache: true
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

    this.getCategoryContents = function (searchParameters) {
        return $http({
            url: "/api/breweryAPI/beerCategoryContents",
            method: "PUT",
            data: searchParameters,
            cache: true
        });
    };
    
});



