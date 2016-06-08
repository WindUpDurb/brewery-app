"use strict";

const AWS = require("aws-sdk");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");

const s3 = new AWS.S3();

const bucketName = "drink-drank-drunk";
const urlBase = "https://s3-us-west-1.amazonaws.com";

const S3Tasks = {
    upload: function (file, callback) {
        fs.readFile(path.join(__dirname, file), function (error, data) {
            if (error) return callback(error);
            let extension = file.split(".").pop();
            let key = uuid() + `.${extension}`;
            let params = {
                Bucket: bucketName,
                Key: key,
                ACL: "public-read",
                Body: data
            };
            s3.putObject(params, function (error, result) {
                if (error) return callback(error);
                let imageUrl = `${urlBase}${bucketName}/${key}`;
                let toReturn = result;
                toReturn.imageUrl = imageUrl;
                console.log("Image url: ", imageUrl);
                console.log("Results: ", result);
                callback(error, toReturn)
            });
        });
    }

};


S3Tasks.upload("king-cobra-2.jpg");
