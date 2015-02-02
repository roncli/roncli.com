var admin = require("../models/admin");

module.exports.get = function(req, callback) {
    "use strict";

    var userId = req.session.user ? req.session.user.id : 0;

    if (userId === 0) {
        req.res.status(401);
        callback({error: "You are not logged in."});
        return;
    }

    if (req.parsedPath.length > 0) {
        if (req.parsedPath[0] === "page") {
            // TODO: This is a workaround until we can get the querystring parameters from Rendr's server sync.  See https://github.com/rendrjs/rendr/pull/392 for the upcoming fix.
            admin.getPageByUrl(userId, req.parsedPath.slice(1).join("/"), function(err, data) {
                if (err) {
                    req.res.status(err.status);
                    callback(err);
                    return;
                }

                callback(data);
            });
            return;
        }
    }

    switch (req.parsedPath.length) {
        case 1:
            switch (req.parsedPath[0]) {
                case "pages":
                    admin.getPagesByParentUrl(userId, null, function(err, pages) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }

                        callback(pages);
                    });
                    return;
            }
            break;
        case 2:
            switch (req.parsedPath[0]) {
                case "blog":
                    switch (req.parsedPath[1]) {
                        case "comments":
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
        case 2:
            switch (req.parsedPath[0]) {
                case "blog":
                    switch (req.parsedPath[1]) {
                        case "clear-caches":
                            admin.clearBlogCaches(userId, function(err) {
                                if (err) {
                                    req.res.status(err.status);
                                    callback(err);
                                    return;
                                }

                                req.res.status(204);
                                callback();
                            });
                            return;
                        case "approve-comment":
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
                        case "reject-comment":
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
                case "pages":
                    switch (req.parsedPath[1]) {
                        case "add-page":
                            admin.addPage(userId, req.body.parentPageId, req.body.url, req.body.title, req.body.shortTitle, req.body.content, function(err) {
                                if (err) {
                                    req.res.status(err.status);
                                    callback(err);
                                    return;
                                }

                                req.res.status(204);
                                callback();
                            });
                            return;
                        case "update-page":
                            admin.updatePage(userId, req.body.pageId, req.body.url, req.body.title, req.body.shortTitle, req.body.content, function(err) {
                                if (err) {
                                    req.res.status(err.status);
                                    callback(err);
                                    return;
                                }

                                req.res.status(204);
                                callback();
                            });
                            return;
                        case "delete-page":
                            admin.deletePage(userId, req.body.pageId, function(err) {
                                if (err) {
                                    req.res.status(err.status);
                                    callback(err);
                                    return;
                                }

                                req.res.status(204);
                                callback();
                            });
                            return;
                        case "move-page":
                            admin.movePage(userId, req.body.pageId, req.body.parentPageId, function(err) {
                                if (err) {
                                    req.res.status(err.status);
                                    callback(err);
                                    return;
                                }

                                req.res.status(204);
                                callback();
                            });
                            return;
                        case "change-order":
                            admin.changeOrder(userId, req.body.pageId, req.body.order, function(err) {
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
            break;
    }

    req.res.status(404);
    callback({error: "API not found."});
};
