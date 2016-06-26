"use strict";

angular
    .module("beerApp")
    .controller("beerBrowserController", beerBrowserController);

function beerBrowserController($scope, $state, BeerServices) {
    console.log("Beer Browser Controller");
    console.log("Params: ", $state.params);
    if ($state.params.category && $state.params.pageNumber) {
         $scope.category = $state.params.category;
        $scope.pageNumber = $state.params.pageNumber;
        (function () {
            let key = `/api/breweryAPI/beerCategoryContents/${$scope.category}/${$scope.pageNumber}`;
            $scope.nextPage = BeerServices.craftNextPageURL($scope.category, $scope.pageNumber);
            $scope.previousPage = BeerServices.craftPreviousPageURL($scope.category, $scope.pageNumber);
            $scope.categoryContents = BeerServices.getFromLocalStorage(key);
            console.log("category contents: ", $scope.categoryContents)
            BeerServices.craftNextPageURL($scope.category, $scope.pageNumber)
            if (!$scope.categoryContents) {
                BeerServices.getCategoryContents($scope.category, $scope.pageNumber)
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