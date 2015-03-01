var music = require("../models/music");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "getFromUrl":
                    music.getSongByUrl(query.url, function(err, song) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(song);
                    });
                    return;
                case "get-latest":
                    if (!/^[1-9][0-9]*$/.test(query.count)) {
                        req.res.status(400);
                        callback({error: "Count must be a positive integer."});
                        return;
                    }

                    music.getLatestSongs(+query.count, function(err, songs) {
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
        case 2:
            switch (req.parsedPath[0]) {
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
                case "get-latest":
                    if (!/^[1-9][0-9]*$/.test(query.count)) {
                        req.res.status(400);
                        callback({error: "Count must be a positive integer."});
                        return;
                    }

                    music.getLatestSongsByTag(decodeURIComponent(req.parsedPath[1]), +query.count, function(err, songs) {
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
