"use strict";

var app = angular.module("beerApp");

app.controller("mainController", function ($scope, $state, AuthServices) {
    console.log("Main Controller");

    AuthServices.isLoggedIn()
        .then(function (response) {
            console.log("respones: ", response)
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

app.controller("beerController", function (BeerServices, AuthServices, $state, $scope) {
    console.log("Beer Controller");

    let activeUser = AuthServices.activeUser;

    if($state.current.name === "beerMeRandom") {
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

app.controller("beerLogController", function ($scope, AuthServices) {
    console.log("Beer Log Controller");

    $scope.activeUser = AuthServices.activeUser;
    $scope.beerLog = $scope.activeUser.beerSeen;
    console.log("Beer Log: ", $scope.beerLog)

});

app.controller("beerViewController", function ($stateParams, $scope, BeerServices) {
    console.log("Beer View");
    
    let beerId = $stateParams.beerId;

    BeerServices.getSingleBeer({beerId: beerId})
        .then(function (response) {
            $scope.beerData = response.data.data;
            console.log("current: ", $scope.beerData)
        })
        .catch(function (error) {
            console.log("Error: ",error);
        });

})

//needed for dropdown
app.controller("dropdownController", function () {
});