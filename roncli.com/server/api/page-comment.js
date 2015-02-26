var page = require("../models/page");

module.exports.get = function(req, query, callback) {
    "use strict";

    switch (req.parsedPath.length) {
        case 0:
            page.getCommentsByPageId(+query.pageId, function(err, comments) {
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

module.exports.post = function(req, query, callback) {
    "use strict";

    var userId = req.session.user ? req.session.user.id : 0;

    if (userId === 0) {
        req.res.status(401);
        callback({error: "You are not logged in."});
        return;
    }

    switch (req.parsedPath.length) {
        case 0:
            page.postComment(userId, req.body.pageId, req.body.content, function(err) {
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
