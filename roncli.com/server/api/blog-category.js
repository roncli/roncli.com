var blog = require("../models/blog");

module.exports.get = function(req, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            blog.getCategories(function(err, categories) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }
                callback(categories);
            });
            return;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
