var coding = require("../models/coding");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "get-latest":
                    if (!/^[1-9][0-9]*$/.test(query.count)) {
                        req.res.status(400);
                        callback({error: "Count must be a positive integer."});
                        return;
                    }

                    coding.getLatestEvents(+query.count, function(err, events) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(events);
                    });
                    return;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
