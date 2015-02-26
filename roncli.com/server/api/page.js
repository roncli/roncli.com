var page = require("../models/page");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            if (!query.url || query.url.length === 0) {
                req.res.status(400);
                callback({error: "No URL specified."});
                return;
            }
            page.getPage(query.url, function(err, page) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }

                callback(page);
            });
            return;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
