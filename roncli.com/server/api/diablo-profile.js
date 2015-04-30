var gaming = require("../models/gaming");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            gaming.getDiabloHeroes(function(err, data) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }
                callback(data);
            });
            return;
        case 1:
            switch (req.parsedPath[0]) {
                case "get-main":
                    gaming.getDiabloMain(function(err, profile) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(profile);
                    });
                    return;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
