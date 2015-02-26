var music = require("../models/music");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            music.getTags(function(err, tags) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }
                callback(tags);
            });
            return;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
