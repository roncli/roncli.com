var gaming = require("../models/gaming");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            gaming.getSteamGames(function(err, games) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }
                callback(games);
            });
            return;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
