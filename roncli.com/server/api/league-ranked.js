var gaming = require("../models/gaming.js");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            gaming.getLolRanked(function(err, ranked) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }
                callback(ranked);
            });
            return;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
