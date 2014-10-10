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
        case 4:
            switch (req.parsedPath[0]) {
                case "getFromUrl":
                    // TODO: This is a workaround until we can get the querystring parameters from Rendr's server sync.  See https://github.com/rendrjs/rendr/pull/392 for the upcoming fix.
                    blog.getPostByUrl("/" + req.parsedPath[1] + "/" + req.parsedPath[2] + "/" + req.parsedPath[3], function(err, post) {
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
