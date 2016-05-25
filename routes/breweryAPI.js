"use strict";

let express = require("express");
let router = express.Router();

let BeerAPI = require("../models/beerAPI");

router.get("/beerMe", function (request, response) {
    BeerAPI.beerMe(function (error, body) {
        if (error) response.status(400).send(error);
        response.send(body);
    })
});



module.exports = router;
