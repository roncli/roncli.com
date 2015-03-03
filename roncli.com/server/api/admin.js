var admin = require("../models/admin");

module.exports.get = function(req, query, callback) {
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
                case "page":
                    admin.getPageByUrl(userId, query.url, function(err, data) {
                        if (err) {
                            req.res.status(err.status);
                            callback(err);
                            return;
                        }

                        callback(data);
                    });
                    return;
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
                case "pages":
                    switch (req.parsedPath[1]) {
                        case "comments":
                            admin.getPageCommentsToModerate(userId, function(err, comments) {
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
                case "music":
                    switch (req.parsedPath[1]) {
                        case "comments":
                            admin.getSongCommentsToModerate(userId, function(err, comments) {
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
                case "coding":
                    switch (req.parsedPath[1]) {
                        case "projects":
                            admin.getProjects(userId, function(err, projects) {
                                if (err) {
                                    req.res.status(err.status);
                                    callback(err);
                                    return;
                                }

                                callback(projects);
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

module.exports.post = function(req, query, callback) {
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
                        case "approve-comment":
                            admin.approvePageComment(userId, req.body.commentId, function(err) {
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
                            admin.rejectPageComment(userId, req.body.commentId, function(err) {
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
                case "music":
                    switch (req.parsedPath[1]) {
                        case "clear-caches":
                            admin.clearMusicCaches(userId, function(err) {
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
                            admin.approveSongComment(userId, req.body.commentId, function(err) {
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
                            admin.rejectSongComment(userId, req.body.commentId, function(err) {
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
                case "coding":
                    switch (req.parsedPath[1]) {
                        case "clear-caches":
                            admin.clearCodingCaches(userId, function(err) {
                                if (err) {
                                    req.res.status(err.status);
                                    callback(err);
                                    return;
                                }

                                req.res.status(204);
                                callback();
                            });
                            return;
                        case "add-project":
                            admin.addProject(userId, req.body.url, req.body.title, req.body.projectUrl, req.body.user, req.body.repository, req.body.description, function(err) {
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
