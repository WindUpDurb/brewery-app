"use strict";

let express = require("express");
let router = express.Router();

let BeerAPI = require("../models/beerAPI");
let User = require("../models/user");


router.get("/beerMe", function (request, response) {
    BeerAPI.beerMe(function (error, body) {
        if (error) response.status(400).send(error);
        response.send(body);
    })
});

router.put("/beerMeUser", function (request, response) {
    let userId = request.body._id;
    BeerAPI.beerMe(function (error, data) {
        if (error) response.status(400).send(error);
        let beerData = JSON.parse(data);
        User.checkIfSeenBeer(userId, beerData, function (error, hasSeen) {
            if (!hasSeen) {
                BeerAPI.beerMe(function (error, data) {
                    if (error) response.status(400).send(error);
                    beerData = JSON.parse(data);
                })
            } else {
                response.send(beerData);
            }
        })
    })
});

router.put("/beerMeSingle", function (request, response) {
    let beerId = request.body.beerId;
    BeerAPI.singleBeer(beerId, function (error, beerData) {
        if (error) response.status(400).send(error);
        response.send(beerData);
    });
});


module.exports = router;
