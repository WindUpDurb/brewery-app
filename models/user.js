"use strict";

let mongoose = require("mongoose");
let bcrypt = require("bcrypt");
let jwt = require("json-web-token");
let moment = require("moment");

let userSchema = new mongoose.Schema({

    email: { type: String, required: true },
    firstName: { type: String },
    lastName: {type: String },
    password: { type: String, required: true },
    sampledBeers: [{
        beerName: String,
        beerId: String,
        comments: [{ type: String }],
        personalRating: Number

    }],
    //will contain a collection of beer IDs
    beerSeen: [{ type: String }]

});

userSchema.statics.obtainUsers = function (callback) {
    User.find({}, function (error, userList) {
        if (error || !userList) return callback(error || { error: "There are no users" });
        return callback(null, userList);
    });
};


userSchema.statics.registerNewUser = function (newUserData, callback) {
    User.findOne({ email: newUserData.email }, function (error, databaseUser) {
        if (error || databaseUser) return callback(error || {error: "The email is already registered to a user."});
        bcrypt.hash(newUserData.password, 12, function (error, hash) {
            if (error) return callback(error);
            newUserData.password = hash;
            User.create(newUserData, function (error, savedUser) {
                if (savedUser) savedUser.password = null;
                return callback(error, savedUser);
            })
        });
    });
};


userSchema.statics.deleteUserAccount = function (userId, callback) {
    User.findByIdAndRemove(userId, function (error) {
        callback(error);
    });
};


userSchema.statics.updateUserAccount = function (updatedUserData, callback) {
    User.findById(updatedUserData._id, function (error, databaseUser) {
        if (error || !databaseUser) return callback(error || { error : "There is no user with that information." });
        bcrypt.compare(updatedUserData.password, databaseUser.password, function (error, isGood) {
            if (error || !isGood) return callback(error || { error: "Authentication failed." });
            databaseUser = updatedUserData;
            databaseUser.save(function (error, savedUser) {
                callback(error, savedUser);
            });
        })
    });
};


userSchema.methods.generateToken = function () {
    let payload = {
        _id: this._id,
        exp: moment().add(7, "day").unix()
    };
    return jwt.encode(JWT_SECRET, payload, function (error, token) {
        return error || token;
    });
};

userSchema.statics.authenticate = function (loginData, callback) {
    User.findOne({ email : loginData.email }, function (error, databaseUser) {
        if (error || !databaseUser) return callback(error || { error: "Authentication failed."});
        bcrypt.compare(loginData.password, databaseUser.password, function (error, isGood) {
            if (error || !isGood) return callback(error || { error: "Authentication Failed." });
            let token = databaseUser.generateToken();
            databaseUser.password = null;
            callback(null, token, databaseUser);
        });
    });
};


userSchema.statics.authorization = function () {
    return function (request, response, next) {
        let token = request.cookies.accessToken;
        jwt.decode(JWT_SECRET, token, function (error, payload) {
            if (error) return response.status(401).send({ error: "Authentication failed." });
            User.findById(payload._id, function (error, user) {
                if (error) return response.status(401).send({ error : "User not found." });
                request.user = user;
                next();
            });
        });
    };
};



let User = mongoose.model("User", userSchema);


module.exports = User;