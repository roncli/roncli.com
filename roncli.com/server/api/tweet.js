var tweet = require("../models/tweet"),
    handleError = require("../handleError");

module.exports.get = function(req, callback) {
    "use strict";

    tweet.getTweets(function(err, data) {
        if (err) {
            handleError(err, req);
            callback(err);
            return;
        }

        req.res.status(204);
        callback(data);
    });
};
