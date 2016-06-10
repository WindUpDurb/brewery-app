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
        BeerServices.beerSearch(queryString)
            .then(function (response) {
                $state.go("beerBrowse");
                $scope.categoryContents = response.data.data;
                $scope.beerSearchInput = "";
            })
            .catch(function (error) {
                console.log("Error: ", error);
            })
    };
    
});

app.controller("beerViewController", function ($scope, $stateParams, BeerServices, Upload) {
    console.log("Beer View");
    let beerId = $stateParams.beerId;

    (function () {
        let key = `/api/breweryAPI/beerMeSingle/${beerId}`;
        $scope.beerData = BeerServices.getFromLocalStorage(key);
        if (!$scope.beerData) {
            BeerServices.getSingleBeer(beerId)
                .then(function (response) {
                    $scope.beerData = response.data.data;
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


    $scope.getCategoryContents = function (category, pageNumber) {
        let key = `/api/breweryAPI/beerCategoryContents/${category}/${pageNumber}`;

        $scope.categoryContents = BeerServices.getFromLocalStorage(key);

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