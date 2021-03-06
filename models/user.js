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
    toDrink: [{
        beerName: { type: String },
        beerId: { type: String },
        image: { type: String },
        breweryName: { type: String },
        //maybe include later a notes section that the user
        //can fill with notes on where to get the beer, who introduced it to him, etc.
        //it'll be an array of objects
        finallyDrank: { type: Boolean, default: false }
    }],
    sampledBeers: [{
        beerName: { type: String },
        beerId: { type: String },
        beerImage: { type: String },
        breweryName: { type: String },
        comments: [{ type: String }],
        beerRating: { type: Number, default: 0 },
        beerMemories: [{
            beerPhotoCaption: { type: String },
            beerPhotoUrl: { type: String }
        }]
    }]
 /*   ,
    beerSeen: [{
        beerName: { type: String},
        beerId: { type: String},
        image: {type: String},
        breweryName: {type: String },
        consumed: {type: Boolean, default: false }
    }]*/

});


userSchema.statics.addToToDrink = function (toUpdateWith, callback) {
    User.findById(toUpdateWith._id, function (error, databaseUser) {
        if (error || !databaseUser) return callback(error || { error: "There is no user" });
        databaseUser.toDrink.push(toUpdateWith.newToDrink);
        databaseUser.save(function (error, savedUser) {
            callback(error, savedUser);
        });
    });
};

userSchema.statics.saveBeerRating = function (dataToSave, callback) {
    User.findById(dataToSave._id, function (error, databaseUser) {
        if (error || !databaseUser) return callback(error || { error: "There is no user" }); 
        for (let i = 0; i < databaseUser.sampledBeers.length; i++) {
            if (dataToSave.beerId === databaseUser.sampledBeers[i].beerId) {
                databaseUser.sampledBeers[i].beerRating = dataToSave.newBeerRating;
            }
        }
        databaseUser.save(function (error, savedUser) {
            callback(error, savedUser);
        });
    });  
};

userSchema.statics.addBeerMemory = function (beerMemory, callback) {
    User.findById(beerMemory._id, function (error, databaseUser) {
        if (error || !databaseUser) return callback(error || { error: "There is no user." });
        console.log("Before Push: ", databaseUser);
        console.log("Image url: ", typeof beerMemory.imageUrl)
        let beerMemoryObject = {
            beerPhotoUrl: beerMemory.imageUrl
        };
        for (let i = 0; i < databaseUser.sampledBeers.length; i++) {
            if (databaseUser.sampledBeers[i].beerId === beerMemory.beerId) {
                databaseUser.sampledBeers[i].beerMemories.push(beerMemoryObject);
                console.log("after push: ", databaseUser)
                databaseUser.save(function (error, savedUser) {

                    console.log("SavedUser: ", savedUser)
                    return callback(error, savedUser);
                });
            }
        }
    });
};


/*userSchema.statics.checkIfSeenBeer = function (userId, beerData, callback) {
    User.findById(userId, function (error, databaseUser) {
        if (error || !databaseUser) return callback(error || { error: "There is no user." });
        console.log("beerData: ", beerData);
        let beerId = beerData.data.id;
        if (databaseUser.beerSeen.indexOf(beerId) === -1 ) {
            let beerToAdd = {
                beerName: beerData.data.name,
                beerId: beerData.data.id,
                breweryName: beerData.data.breweries[0].name,
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
};*/

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


userSchema.statics.updateToDrink = function (beerId, consumed, additionalDataToSave, callback) {
    if (additionalDataToSave) {
        // let currentBeer = additionalDataToSave.nonBeerMeBeer || additionalDataToSave.beerModifying;
        for (let i = 0; i < additionalDataToSave.toDrink.length; i++) {
            if (additionalDataToSave.toDrink[i].beerId === beerId) {
                additionalDataToSave.toDrink[i].finallyDrank = consumed;
                return additionalDataToSave;
            }
        }
        return additionalDataToSave;
    } else if (!additionalDataToSave) {
        User.findById(beerId, function (error, databaseUser) {
            if (error || !databaseUser) return callback(error || {error: "There is no user"});
            for (let i = 0; i < databaseUser.toDrink.length; i++) {
                if (databaseUser.toDrink[i].beerId === beerId) {
                    databaseUser.toDrink[i].finallyDrank = consumed;
                    return callback(null, databaseUser);
                }
            }
        })
    }
};

userSchema.statics.updateConsumedBeer = function (toUpdateWith, callback) {
    User.findById(toUpdateWith._id, function (error, databaseUser) {
        if (error || !databaseUser) return callback(error || { error: "There is no such user." });
        var currentBeerId;
        var currentBeerConsumed;
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
            currentBeerId = toUpdateWith.nonBeerMeBeer.beerId;
            currentBeerConsumed = toUpdateWith.nonBeerMeBeer.consumed;
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
            currentBeerId = toUpdateWith.beerModifying.beerId;
            currentBeerConsumed = toUpdateWith.beerModifying.consumed;
        }
        databaseUser = User.updateToDrink(currentBeerId, currentBeerConsumed, databaseUser, null);
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
                user.password = null;
                request.user = user;
                next();
            });
        });
    };
};



let User = mongoose.model("User", userSchema);


module.exports = User;