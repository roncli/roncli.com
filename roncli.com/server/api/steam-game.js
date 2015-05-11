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
        case 1:
            switch (req.parsedPath[0]) {
                case "get-game":
                    gaming.getSteamGame(query.gameId, function(err, feed) {
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
