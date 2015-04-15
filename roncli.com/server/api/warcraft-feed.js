var gaming = require("../models/gaming.js");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            gaming.getWowFeed(function(err, feed) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }
                callback(feed);
            });
            return;
        case 1:
            switch (req.parsedPath[0]) {
                case "get-latest":
                    gaming.getLatestWowFeed(function(err, feed) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(feed);
                    });
                    return;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
