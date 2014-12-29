var blog = require("../models/blog");

module.exports.get = function(req, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 3:
            // TODO: This is a workaround until we can get the querystring parameters from Rendr's server sync.  See https://github.com/rendrjs/rendr/pull/392 for the upcoming fix.
            blog.getCommentsByUrl("/" + req.parsedPath[0] + "/" + req.parsedPath[1] + "/" + req.parsedPath[2], function(err, comments) {
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

module.exports.post = function(req, callback) {
    "use strict";

    var userId = req.session.user ? req.session.user.id : 0;

    if (userId === 0) {
        req.res.status(401);
        callback({error: "You are not logged in."});
        return;
    }

    switch (req.parsedPath.length) {
        case 0:
            blog.postComment(userId, req.body.url, req.body.content, function(err) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }
                req.res.status(204);
                callback();
            });
            return;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
