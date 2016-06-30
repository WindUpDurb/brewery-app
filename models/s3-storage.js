"use strict";

const AWS = require("aws-sdk");
const uuid = require("uuid");

const s3 = new AWS.S3();

const bucketName = "drink-drank-drunk";
const urlBase = "https://s3-us-west-1.amazonaws.com";

const S3Tasks = {
    upload: function (photoObject, callback) {
        let extension = photoObject.originalname.split(".").pop();
        let key = uuid() + `.${extension}`;
        let params = {
            Bucket: bucketName,
            Key: key,
            ACL: "public-read",
            Body: photoObject.buffer
        };

        console.log("Params: ", params);

        s3.putObject(params, function (error, result) {
            if (error) return callback(error);
            let imageUrl = `${urlBase}/${bucketName}/${key}`;
            let toReturn = result;
            toReturn.imageUrl = imageUrl;
            callback(error, toReturn)
        });
    }

};

module.exports = S3Tasks;