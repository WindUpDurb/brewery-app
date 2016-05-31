"use strict";

let requestNPM = require("request");
let User = require("./user");

let BeerAPI = {
    beerMe: function (callback) {
        requestNPM("http://api.brewerydb.com/v2/beer/random?key=852f05c67350a731492d69cf272223e2", function (error, response, body) {
            callback(error, body);
        })
    },

    singleBeer: function (beerId, callback) {
        requestNPM(`http://api.brewerydb.com/v2/beer/${beerId}/?key=852f05c67350a731492d69cf272223e2`, function (error, response, body) {
            callback(error, body);
        });
    },

    beerBrowseMenu: function (callback) {
        requestNPM("http://api.brewerydb.com/v2/menu/categories/?key=852f05c67350a731492d69cf272223e2", function (error, response, body) {
            callback(error, body);
        });
    },

    getCategoryContents: function (categoryName, pageNumber, callback) {
        requestNPM(`http://api.brewerydb.com/v2/search?q=${categoryName}&p=${pageNumber}&key=852f05c67350a731492d69cf272223e2`, function (error, response, body) {
            callback(error, body);
        });
    }
    /*beerMeUser: function (userId, callback) {
        console.log("beer me user")
        User.findById(userId, function (error, databaseUser) {
            if (error || !databaseUser) return callback(error || { error: "There is no such user." });
            requestNPM("http://api.brewerydb.com/v2/beer/random?key=852f05c67350a731492d69cf272223e2", function (error, response, body) {
                if (error) return callback(error);
                let randomBeer = JSON.parse(body).data.id;
                console.log("random beer: ", randomBeer)
                while (databaseUser.beerSeen.indexOf(randomBeer) !== -1) {
                    requestNPM("http://api.brewerydb.com/v2/beer/random?key=852f05c67350a731492d69cf272223e2", function (error, response, body) {
                        randomBeer = JSON.parse(body).data.id;
                        console.log("randomBeer: ", randomBeer)
                    });
                }
                databaseUser.beerSeen.push(randomBeer);
                databaseUser.save(function (error) {
                    callback(error, randomBeer);
                });
            });
        });
    }*/
};


module.exports = BeerAPI;