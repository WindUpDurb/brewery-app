"use strict";

let express = require("express");
let router = express.Router();

let User = require("../models/user");

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

router.get("/activeUser", User.authorization(), function (request, response) {
    let activeUser = request.user;
    response.send(activeUser);
});

router.delete("/logout", function (request, response) {
    response.clearCookie("accessToken").send();
});


module.exports = router;