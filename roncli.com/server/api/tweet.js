var tweet = require("../models/tweet");

module.exports.get = function(req, query, callback) {
    "use strict";

    tweet.getTweets(function(err, data) {
        if (err) {
            req.res.status(err.status);
            callback(err);
            return;
        }

        callback(data);
    });
};
