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
                $state.go("home");
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

app.controller("profileController", function ($scope, $state, AuthServices, activeUserProfile, BeerServices) {
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
    $scope.beersDrank = $scope.activeUser.sampledBeers;
    $scope.beersDrankStatistics = BeerServices.generateDrankStatistics($scope.beersDrank);
    $scope.toDrinkBeers = $scope.activeUser.toDrink;
    $scope.toDrinkStatistics = BeerServices.countDrankInToDrink($scope.toDrinkBeers);
    $scope.goToPage = function (page) {
        $state.go("beerLogPage", {page: page});
        $scope.currentPage = page;
    };
    $scope.drankStatistics = BeerServices.generateDrankStatistics($scope.activeUser.sampledBeers);
    $scope.createRatingStars = function (rating) {
        return new Array(rating);
    };
});

//needed for dropdown
app.controller("dropdownController", function () {
});