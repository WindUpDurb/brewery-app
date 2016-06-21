"use strict";

angular
    .module("beerApp")
    .controller("beerBrowserController", beerBrowserController);

function beerBrowserController($scope, $state, BeerServices) {
    console.log("Beer Browser Controller");
    console.log("Params: ", $state.params);
    if ($state.params.category && $state.params.pageNumber) {
        let category = $state.params.category;
        let pageNumber = $state.params.pageNumber;
        (function () {
            let key = `/api/breweryAPI/beerCategoryContents/${category}/${pageNumber}`;
            $scope.nextPage = BeerServices.craftNextPageURL(category, pageNumber);
            $scope.previousPage = BeerServices.craftPreviousPageURL(category, pageNumber);
            $scope.categoryContents = BeerServices.getFromLocalStorage(key);
            console.log("category contents: ", $scope.categoryContents)
            BeerServices.craftNextPageURL(category, pageNumber)
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
        }());
    }
}