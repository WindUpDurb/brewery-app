"use strict";

let requestNPM = require("request");

let BeerAPI = {
    beerMe: function (callback) {
        requestNPM("http://api.brewerydb.com/v2/beer/random?key=852f05c67350a731492d69cf272223e2", function (error, response, body) {
            if (error) return callback(error);
            callback(null, body);
        })
    }
};


module.exports = BeerAPI;