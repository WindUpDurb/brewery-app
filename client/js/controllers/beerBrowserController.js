"use strict";

angular
    .module("beerApp")
    .controller("beerBrowserController", beerBrowserController);

function beerBrowserController($scope, $state, BeerServices) {
    console.log("Beer Browser Controller");

    if ($state.current.name === "beerDirectory") {
        (function() {
            let key = "beerDirectories";
           $scope.beerDirectories = BeerServices.getFromLocalStorage(key);
            console.log("Beer directories: ", $scope.beerDirectories)
            if (!$scope.beerDirectories) {
                BeerServices.getBeerDirectories()
                    .then(function (response) {
                        console.log("Response: ", response.data.data);
                        $scope.beerDirectories = {};
                        for (let i = 0; i < response.data.data.length; i++) {
                            if (response.data.data[i].categoryId <= 9) {
                                if (!$scope.beerDirectories.hasOwnProperty(response.data.data[i].categoryId)) {
                                    $scope.beerDirectories[response.data.data[i].categoryId] = [response.data.data[i]];
                                } else {
                                    $scope.beerDirectories[response.data.data[i].categoryId].push(response.data.data[i]);
                                }
                            }
                        }
                        console.log("Beer Directories: ", $scope.beerDirectories);
                        BeerServices.submitToLocalStorage(key, $scope.beerDirectories);
                    })
                    .catch(function (error) {
                        console.log("Error: ", error);
                    })
            }
        }());
    }

    $scope.takeMeToStyle = function (beer) {
        BeerServices.saveStyleDescription({currentDirectory: beer});
        $state.go("beerBrowseContents", {category: beer.name, pageNumber: 1});
    };

    if ($state.params.category && $state.params.pageNumber) {
        $scope.category = $state.params.category;
        $scope.pageNumber = $state.params.pageNumber;
        (function () {
            let key = `/api/breweryAPI/beerCategoryContents/${$scope.category}/${$scope.pageNumber}`;
            $scope.currentStyle = BeerServices.getFromLocalStorage($scope.category);
            if (!$scope.currentStyle) {
                BeerServices.submitToLocalStorage($scope.category, BeerServices.getSavedStyleDescription());
                $scope.currentStyle = BeerServices.getSavedStyleDescription();
            }
            console.log("This it: ", $scope.currentStyle);
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