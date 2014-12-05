var blog = require("../models/blog");

module.exports.get = function(req, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 3:
            // TODO: This is a workaround until we can get the querystring parameters from Rendr's server sync.  See https://github.com/rendrjs/rendr/pull/392 for the upcoming fix.
            blog.getCommentsByUrl("/" + req.parsedPath[1] + "/" + req.parsedPath[2] + "/" + req.parsedPath[3], function(err, comments) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }
                callback(comments);
            });
            return;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
