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