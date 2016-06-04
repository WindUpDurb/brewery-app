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

app.controller("beerViewController", function ($scope, $stateParams, singleBeerData, BeerServices) {
    console.log("Beer View");

    $scope.beerData = singleBeerData.data.data;

    let beerId = $stateParams.beerId;

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
    }
});

app.controller("beerBrowserController", function ($scope, BeerServices) {
    console.log("Beer Browser Controller")

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
    }

});

app.controller("profileController", function ($scope, AuthServices, activeUserProfile) {
    console.log("Profile Controller");
    $scope.activeUser = activeUserProfile.data;
    $scope.beerLog = $scope.activeUser.beerSeen;
});

//needed for dropdown
app.controller("dropdownController", function () {
});