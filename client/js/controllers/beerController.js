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