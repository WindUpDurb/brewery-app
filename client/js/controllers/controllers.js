"use strict";

var app = angular.module("beerApp");

app.controller("mainController", function ($scope, $state, AuthServices) {
    console.log("Main Controller");

    AuthServices.isLoggedIn()
        .then(function (response) {
            console.log("respones: ", response)
            $scope.activeUser = response.data;
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

app.controller("beerController", function (BeerServices, $state, $scope) {
    console.log("Beer Controller")

    if($state.current.name === "beerMeRandom") {
        BeerServices.beerMe()
            .then(function (response) {
                $scope.beerData = response.data.data;
                console.log($scope.beerData)
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
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
})

//needed for dropdown
app.controller("dropdownController", function () {
});