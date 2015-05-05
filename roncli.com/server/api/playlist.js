var youtube = require("../models/youtube");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            youtube.getPlaylist(query.playlistId, function(err, feed) {
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
                    youtube.getLatestPlaylist(query.playlistId, function(err, feed) {
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
