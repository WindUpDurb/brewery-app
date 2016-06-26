"use strict";

angular
    .module("beerApp")
    .controller("beerViewController", beerViewController);

function beerViewController($scope, $stateParams, BeerServices, Upload) {
    console.log("Beer View");
    let beerId = $stateParams.beerId;
    (function () {
        let key = `/api/breweryAPI/beerMeSingle/${beerId}`;
        $scope.beerData = BeerServices.getFromLocalStorage(key);
        if ($scope.beerData) {
            $scope.breweryData = $scope.beerData.breweries[0];
            $scope.beerViewHeading = BeerServices.generateBeerViewHeading($scope.beerData.name);
        }
        console.log("Beer Data: ", $scope.beerData);
        console.log("Brewery Data: ", $scope.breweryData);
        if (!$scope.beerData) {
            BeerServices.getSingleBeer(beerId)
                .then(function (response) {
                    $scope.beerData = response.data.data;
                    $scope.breweryData = response.data.data.breweries[0];
                    $scope.beerViewHeading = BeerServices.generateBeerViewHeading($scope.beerData.name);
                    BeerServices.submitToLocalStorage(key, response.data.data);
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                })
        }
    }());
    /*let currentBeerData = BeerServices.checkIfBeerCached(beerId);
    if (currentBeerData) {
        $scope.beerData = currentBeerData.beerData;
        $scope.breweryData = currentBeerData.breweryData;
    }
    if (!currentBeerData) {
        currentBeerData = BeerServices.getCurrentBeerData(beerId)
        $scope.beerData = currentBeerData.beerData;
        $scope.breweryData = currentBeerData.breweryData;
    }
   /!* if (!currentBeerData) {
        let key = `/api/breweryAPI/beerMeSingle/${beerId}`;
        BeerServices.getCurrentBeerData(beerId)
            .then(function (response) {
                $scope.beerData = response.data.data;
                $scope.breweryData = response.data.data.breweries[0];
                BeerServices.submitToLocalStorage(key, response.data.data);
                console.log("To return: ", toReturn)
            })
            .catch(function (error) {
                console.log("Error: ", error);
            })*!/*/
        



    if ($scope.activeUser) {
        $scope.hasConsumed = BeerServices.checkIfConsumed(beerId, $scope.activeUser);
        $scope.inToDrink = BeerServices.inToDrink(beerId, $scope.activeUser);

        for (let i = 0; i < $scope.activeUser.sampledBeers.length; i++) {
            if ($scope.activeUser.sampledBeers[i].beerId === beerId) {
                $scope.currentBeer = $scope.activeUser.sampledBeers[i];
                $scope.beerMemories = $scope.activeUser.sampledBeers[i].beerMemories;
                console.log("Memories: ", $scope.beerMemories)
            }
        }

        $scope.beerRating = function (rating) {
            $scope.currentRating = rating;
            $scope.ratingArray = [];
            for (let i = 1; i <= rating; i++) {
                $scope.ratingArray.push(i);
            }
            BeerServices.saveBeerRating(beerId, $scope.activeUser, $scope.currentRating)
                .then(function (response) {
                    console.log("Response: ", response);
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                })
        };

        $scope.addToToDrink = function () {
            BeerServices.addToToDrink($scope.activeUser, $scope.beerData, $scope.breweryData)
                .then(function (response) {
                    console.log("Response: ", response);
                    $scope.inToDrink = true;
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                })
        };

        if ($scope.hasConsumed) {
            $scope.beerRating($scope.currentBeer.beerRating);
        }


        $scope.changeIfConsumed = function (consumed) {
            BeerServices.changeIfConsumed(consumed, $scope.beerData, $scope.breweryData, $scope.activeUser)
                .then(function (response) {
                    $scope.hasConsumed = BeerServices.checkIfConsumed(beerId, response.data);
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                });
        };

        $scope.submitBeerMemory = function (newBeerPhoto) {
            Upload.upload({
                    url: `/api/users/uploadPhoto/${$scope.activeUser._id}/${beerId}/`,
                    data: { newBeerPhoto: newBeerPhoto }
                })
                .then(function (response) {
                    console.log("Response: ", response);
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                })
        };


        $scope.currentIndex = 0;

        $scope.setCurrentSlideIndex = function (index) {
            $scope.currentIndex = index;
        };

        $scope.isCurrentSlideIndex = function (index) {
            return $scope.currentIndex === index;
        };

        $scope.previousSlide = function () {
            $scope.currentIndex = ($scope.currentIndex < $scope.beerMemories.length - 1) ? ++$scope.currentIndex : 0;
        };

        $scope.nextSlide  = function () {
            $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.beerMemories.length - 1;
        };
        //Check out http://onehungrymind.com/build-sweet-photo-slider-angularjs-animate/ for animation effects on the gallery

    }
}