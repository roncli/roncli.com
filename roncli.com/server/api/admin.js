var admin = require("../models/admin");

module.exports.get = function(req, callback) {
    "use strict";

    var userId = req.session.user ? req.session.user.id : 0;

    if (userId === 0) {
        req.res.status(401);
        callback({error: "You are not logged in."});
        return;
    }

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "blog-comments":
                    admin.getBlogCommentsToModerate(userId, function(err, comments) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }

                        callback(comments);
                    });
                    return;
            }
            break;
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
        case 1:
            switch (req.parsedPath[0]) {
                case "approve-blog-comment":
                    admin.approveBlogComment(userId, req.body.commentId, function(err) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }

                        req.res.status(204);
                        callback();
                    });
                    return;
                case "reject-blog-comment":
                    admin.rejectBlogComment(userId, req.body.commentId, function(err) {
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
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
