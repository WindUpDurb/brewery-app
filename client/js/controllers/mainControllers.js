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
            })
            .catch(function (error) {
                console.log("Error: ", error);
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