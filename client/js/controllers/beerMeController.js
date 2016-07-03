"use strict";

angular
    .module("beerApp")
    .controller("beerMeController", beerMeController);

function beerMeController ($scope, BeerServices) {
    console.log("Beer Me Controller");
    console.log("Active User: ", $scope.activeUser);
 /*   if ($scope.activeUser) {
        BeerServices.beerMeUser({ _id: $scope.activeUser._id})
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

    } else {*/
        BeerServices.beerMe()
            .then(function (response) {
                $scope.beerData = response.data.data;
                console.log($scope.beerData)
            })
            .catch(function (error) {
                console.log("Error: ", error);
            });
    
}
