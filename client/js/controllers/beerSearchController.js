"use strict";

angular
    .module("beerApp")
    .controller("beerSearchController", beerSearchController);

function beerSearchController($scope, $state, BeerServices) {
    let query = $state.params.query;
    let queryString = query.replace(/\s/gi, "%20");
    BeerServices.beerSearch(queryString)
        .then(function (response) {
            $scope.categoryContents = response.data.data;
            console.log("search: ", $scope.categoryContents);
            $scope.beerSearchInput = "";
        })
        .catch(function (error) {
            console.log("Error: ", error);
        });
}