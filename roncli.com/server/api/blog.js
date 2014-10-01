var blog = require("../models/blog");

module.exports.get = function(req, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "getLatest":
                    blog.getLatestPost(function(err, post) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }
                        callback(post);
                    });
                    return;
            }
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
