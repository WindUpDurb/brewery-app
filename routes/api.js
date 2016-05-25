"use strict";

var express = require("express");
var router = express.Router();

router.use("/users", require("./users"));
router.use("/breweryAPI", require("./breweryAPI"));

module.exports = router;