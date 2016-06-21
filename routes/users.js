"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");

const User = require("../models/user");
const S3 = require("../models/s3-storage");

const upload = multer({storage: multer.memoryStorage()});


router.route("/")
    .get(function (request, response) {
        User.obtainUsers(function (error, registeredUserList) {
            if (error) response.status(400).send(error);
            response.send(registeredUserList);
        });
    })
    .post(function (request, response) {
        let newUserData = request.body;
        User.registerNewUser(newUserData, function (error, createdUser) {
            if (error) response.status(400).send(error);
            response.send(createdUser);
        });
    })
    .put(function (request, response) {
        let userToUpdate = request.body;
        User.updateUserAccount(userToUpdate, function (error, updatedUser) {
            if (error) response.status(400).send(error);
            response.send(updatedUser);
        });
    });

router.post("/addToSampled", function (request, response) {
    let userId = request.body._id;
    let beerToAdd = request.body.beerToAdd;
    User.addToSampledBeers(userId, beerToAdd, function (error, savedUser) {
        if (error) response.status(400).send(error);
        response.send(savedUser);
    });
});

router.delete("/deleteUser/:userId", function (request, response) {
    User.deleteUserAccount(request.params.userId, function (error) {
        if (error) response.status(400).send(error);
        response.send("The user has been deleted");
    })
});

router.post("/login", function (request, response) {
    var loginData = request.body;
    User.authenticate(loginData, function (error, token, userData) {
        if (error) {
            response.status(400).send(error)
        } else {
            response.cookie("accessToken", token).send(userData);
        }
    });
});

router.post("/addToToDrink", function (request, response) {
   User.addToToDrink(request.body, function (error, savedUser) {
       if (error) return response.status(400).send(error);
       response.send("To-Drink has been updated");
   });
});

router.post("/saveBeerRating", function (request, response) {
    User.saveBeerRating(request.body, function (error, updatedUser) {
        if (error) return response.status(400).send(error);
        response.send("Beer Rating has been updated");
    })
});

router.post("/uploadPhoto/:userId/:beerId", upload.single("newBeerPhoto"), function (request, response, next) {
    console.log("userId: ", request.params.userId);
    console.log("beerId: ", request.params.beerId);
    S3.upload(request.file, function (error, returnData) {
        if (error) response.status(400).send(error);
        let beerMemory = {
            _id: request.params.userId,
            beerId: request.params.beerId,
            imageUrl: returnData.imageUrl
        };
        User.addBeerMemory(beerMemory, function (error, updatedUser) {
            if (error) response.status(400).send(error);
            console.log("the update :", updatedUser);
            response.send()
        });
    });
});

router.get("/activeUser", User.authorization(), function (request, response) {
    let activeUser = request.user;
    response.send(activeUser);
});

router.delete("/logout", function (request, response) {
    response.clearCookie("accessToken").send();
});



module.exports = router;