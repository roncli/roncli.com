var music = require("../models/music");

module.exports.get = function(req, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 2:
            switch (req.parsedPath[0]) {
                case "get-latest":
                    music.getLatestSongs(+req.parsedPath[1], function(err, songs) {
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
