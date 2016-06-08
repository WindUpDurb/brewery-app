"use strict";

let mongoose = require("mongoose");
let bcrypt = require("bcrypt");
let jwt = require("json-web-token");
let moment = require("moment");

let JWT_SECRET = process.env.JWT_SECRET;

let userSchema = new mongoose.Schema({

    email: { type: String, required: true },
    firstName: { type: String },
    lastName: {type: String },
    password: { type: String, required: true },
    sampledBeers: [{
        beerName: String,
        beerId: String,
        comments: [{ type: String }],
        //personal rating can be:
        //1) Would Buy
        //2) Would Consider if available
        //3) Would Drink Only if Someone Bought if for Me
        //4) Would Drink if Drunk
        //5) Fuck this beer
        personalRatings: [{ type: String }],
        beerMemories: [{
            beerPhotoCaption: { type: String },
            beerPhotoUrl: { type: String }
        }]
    }],
    //will contain a collection of beer IDs
    beerSeen: [{
        beerName: { type: String},
        beerId: { type: String},
        image: {type: String},
        consumed: {type: Boolean, default: false }
    }]

});


userSchema.statics.checkIfSeenBeer = function (userId, beerData, callback) {
    User.findById(userId, function (error, databaseUser) {
        if (error || !databaseUser) return callback(error || { error: "There is no user." });
        console.log("beerData: ", beerData)
        let beerId = beerData.data.id;
        if (databaseUser.beerSeen.indexOf(beerId) === -1 ) {
            let beerToAdd = {
                beerName: beerData.data.name,
                beerId: beerData.data.id,
                image: beerData.labels || "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
            };
            databaseUser.beerSeen.push(beerToAdd);
            databaseUser.save(function (error) {
                return callback(error, true);
            })
        } else {
            return callback(null, false);
        }
    })
};

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

userSchema.statics.updateConsumedBeer = function (toUpdateWith, callback) {
    User.findById(toUpdateWith._id, function (error, databaseUser) {
        if (error || !databaseUser) return callback(error || { error: "There is no such user." });
        //If the beer to modify is not in the BeerLogs
        if (toUpdateWith.nonBeerMeBeer) {
            if (toUpdateWith.nonBeerMeBeer.consumed) {
                databaseUser.sampledBeers.push(toUpdateWith.nonBeerMeBeer);
            } else {
                for (let i = 0; i < databaseUser.sampledBeers.length; i++) {
                    if (databaseUser.sampledBeers[i].beerId === toUpdateWith.nonBeerMeBeer.beerId) {
                        databaseUser.sampledBeers.splice(i, 1);
                    }
                }
            }
        } else {
        //If the beer to modify is from the BeerLogs
            databaseUser.beerSeen = toUpdateWith.beerSeen;
            //adding to beersConsumed
            if (toUpdateWith.beerModifying.consumed) {
                databaseUser.sampledBeers.push(toUpdateWith.beerModifying);
            } else {
                for (let i = 0; i < databaseUser.sampledBeers.length; i++) {
                    if (databaseUser.sampledBeers[i].beerId === toUpdateWith.beerModifying.beerId) {
                        databaseUser.sampledBeers.splice(i, 1);
                    }
                }
            }
        }
        databaseUser.save(function (error, savedUser) {
            savedUser.password = null;
            callback(error, savedUser);
        });
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
        console.log("Error: ", error);
        console.log("Token: ", token)
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
        console.log("token: ", token)
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