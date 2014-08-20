var nodemailer = require("nodemailer"),
    config = require("../privateConfig").smtp;

var transport = nodemailer.createTransport(config);

module.exports.send = function(options, callback) {
    "use strict";

    if (options.subject) {
        options.subject = "[roncli.com] " + options.subject;
    } else {
        options.subject = "[roncli.com]";
    }

    if (!options.from) {
        options.from = "Ronald M. Clifford <roncli@roncli.com>";
    }

    transport.sendMail(options, callback);
};
