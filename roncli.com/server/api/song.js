var music = require("../models/music");

module.exports.get = function(req, callback) {
    "use strict";

    var count;

    switch (req.parsedPath.length) {
        case 2:
            switch (req.parsedPath[0]) {
                case "get-latest":
                    count = req.parsedPath[1];

                    if (!/^[1-9][0-9]*$/.test(count)) {
                        req.res.status(400);
                        callback({error: "Count must be a positive integer."});
                        return;
                    }

                    music.getLatestSongs(+count, function(err, songs) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(songs);
                    });
                    return;
                case "tag":
                    music.getSongsByTag(decodeURIComponent(req.parsedPath[1]), function(err, songs) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(songs);
                    });
                    return;
            }
            break;
        case 3:
            switch (req.parsedPath[0]) {
                case "get-latest":
                    count = req.parsedPath[2];

                    if (!/^[1-9][0-9]*$/.test(count)) {
                        req.res.status(400);
                        callback({error: "Count must be a positive integer."});
                        return;
                    }

                    music.getLatestSongsByTag(decodeURIComponent(req.parsedPath[1]), +count, function(err, songs) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(songs);
                    });
                    return;
            }
            break;
        case 4:
            switch (req.parsedPath[0]) {
                case "getFromUrl":
                    // TODO: This is a workaround until we can get the querystring parameters from Rendr's server sync.  See https://github.com/rendrjs/rendr/pull/392 for the upcoming fix.
                    music.getSongByUrl("/" + req.parsedPath[1] + "/" + req.parsedPath[2] + "/" + req.parsedPath[3], function(err, song) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(song);
                    });
                    return;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
