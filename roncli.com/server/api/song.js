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

                    music.getLatestSongsByTag(req.parsedPath[1], +count, function(err, songs) {
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
    }

    req.res.status(404);
    callback({error: "API not found."});
};
