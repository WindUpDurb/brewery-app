"use strict";

let requestNPM = require("request");
let User = require("./user");

let BeerAPI = {
    beerMe: function (callback) {
        requestNPM("http://api.brewerydb.com/v2/beer/random?key=852f05c67350a731492d69cf272223e2", function (error, response, body) {
            if (error) return callback(error);
            callback(null, body);
        })
    },

    beerMeUser: function (userId, callback) {
        User.findById(userId, function (error, databaseUser) {
            if (error || !databaseUser) return callback(error || { error: "There is no such user." });
            requestNPM("http://api.brewerydb.com/v2/beer/random?key=852f05c67350a731492d69cf272223e2", function (error, response, body) {
                if (error) return callback(error);
                let randomBeer = body.data.id;
                if (databaseUser.beerSeen.indexOf(randomBeer) !== -1) {
                    requestNPM("http://api.brewerydb.com/v2/beer/random?key=852f05c67350a731492d69cf272223e2", function (error, response, body) {
                       randomBeer = body.data.id;
                    });
                } else {
                    databaseUser.beerSeen.push(randomBeer);
                    databaseUser.save(function (error) {
                        callback(error, body);
                    })
                }
            })
        })
    }
};


module.exports = BeerAPI;