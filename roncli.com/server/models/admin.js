var User = require("./user"),
    db = require("../database/database"),
    blog = require("../models/blog"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    getPagesByUrl = function(url, callback) {
        "use strict";

        var sql;

        if (url === null) {
            sql = "SELECT PageID, PageURL, Title FROM tblPage WHERE ParentPageID IS NULL";
        } else {
            sql = "SELECT PageID, PageURL, Title FROM tblPage WHERE ParentPageID IN (SELECT PageID FROM tblPage WHERE PageURL = @url)";
        }

        db.query(
            sql, {url: {type: db.VARCHAR(1024), value: url}}, function(err, data) {
                if (err) {
                    console.log("Database error in getPagesByUrl.");
                    console.log(err);
                    callback({
                        error: "There was a database error retrieving the pages.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data[0] || data[0].length === 0) {
                    callback(null, []);
                    return;
                }

                callback(null,
                    data[0].map(function(page) {
                        return {
                            id: page.PageID,
                            url: page.PageURL,
                            title: page.Title
                        };
                    })
                );
            }
        );
    };

/**
 * Reeturn list of blog comments to moderate.
 * @param {number} userId The user ID of the moderator.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getBlogCommentsToModerate = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting blog comments to moderate.  Please reload the page and try again.",
                status: 500
            });
            return;
        }

        if (roles.indexOf("SiteAdmin") === -1) {
            callback({
                error: "You do not have access to this resource.",
                status: 403
            });
            return;
        }

        db.query(
            "SELECT bc.CommentID, bc.Comment, bc.CrDate, u.Alias, bc.BlogURL FROM tblBlogComment bc INNER JOIN tblUser u ON bc.CrUserID = u.UserID WHERE bc.ModeratedDate IS NULL ORDER BY bc.CrDate",
            {},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.getBlogCommentsToModerate");
                    console.log(err);
                    callback({
                        error: "There was a database error while getting blog comments to moderate.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data[0]) {
                    callback(null, {});
                    return;
                }

                callback(null, data[0].map(function(comment) {
                    return {
                        id: comment.CommentID,
                        published: comment.CrDate.getTime(),
                        content: comment.Comment,
                        author: comment.Alias,
                        url: comment.BlogURL
                    };
                }));
            }
        );
    });
};

/**
 * Clears the blog's caches.
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.clearBlogCaches = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while approving a blog comment.  Please reload the page and try again.",
                status: 500
            });
            return;
        }

        if (roles.indexOf("SiteAdmin") === -1) {
            callback({
                error: "You do not have access to this resource.",
                status: 403
            });
            return;
        }

        cache.keys("roncli.com:[bt][lu][om][gb][:gl]*", function(keys) {
            var cachePosts = function() {
                blog.forceCachePosts(callback);
            };

            if (keys.length > 0) {
                cache.del(keys, cachePosts);
            } else {
                cachePosts();
            }
        });
    });
};

/**
 * Approves a blog comment.
 * @param {number} userId The user ID of the moderator.
 * @param {number} commentId The comment ID to approve.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.approveBlogComment = function(userId, commentId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while approving a blog comment.  Please reload the page and try again.",
                status: 500
            });
            return;
        }

        if (roles.indexOf("SiteAdmin") === -1) {
            callback({
                error: "You do not have access to this resource.",
                status: 403
            });
            return;
        }

        db.query(
            "UPDATE tblBlogComment SET ModeratedDate = GETUTCDATE() WHERE CommentID = @id",
            {id: {type: db.INT, value: commentId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.approveBlogComment.");
                    callback({
                        error: "There was a database error while approving a blog comment.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                callback();
            }
        );
    });
};

/**
 * Rejects a blog comment.
 * @param {number} userId The user ID of the moderator.
 * @param {number} commentId The comment ID to reject.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.rejectBlogComment = function(userId, commentId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while rejecting a blog comment.  Please reload the page and try again.",
                status: 500
            });
            return;
        }

        if (roles.indexOf("SiteAdmin") === -1) {
            callback({
                error: "You do not have access to this resource.",
                status: 403
            });
            return;
        }

        db.query(
            "DELETE FROM tblBlogComment WHERE CommentID = @id",
            {id: {type: db.INT, value: commentId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.approveBlogComment.");
                    callback({
                        error: "There was a database error while rejecting a blog comment.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                callback();
            }
        );
    });
};

/**
 * Gets the child pages of a parent by URL.
 * @param {number} userId The user ID of the moderator.
 * @param {string} url The URL of the pages to get.
 * @param {function} callback The callback function.
 */
module.exports.getPagesByParentUrl = function(userId, url, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while approving a blog comment.  Please reload the page and try again.",
                status: 500
            });
            return;
        }

        if (roles.indexOf("SiteAdmin") === -1) {
            callback({
                error: "You do not have access to this resource.",
                status: 403
            });
            return;
        }

        getPagesByUrl(url, callback);
    });
};

/**
 * Gets page data for a URL.
 * @param {number} userId The user ID of the moderator.
 * @param {string} url The URL of the page to get.
 * @param {function} callback The callback function.
 */
module.exports.getPageByUrl = function(userId, url, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while approving a blog comment.  Please reload the page and try again.",
                status: 500
            });
            return;
        }

        if (roles.indexOf("SiteAdmin") === -1) {
            callback({
                error: "You do not have access to this resource.",
                status: 403
            });
            return;
        }

        all(
            (function() {
                var deferred = new Deferred();

                getPagesByUrl(url, function(err, pages) {
                    if (err) {
                        deferred.reject(err);
                        return;
                    }

                    console.log("RESOLVED 1");
                    deferred.resolve(pages);
                });

                return deferred.promise;
            }()),
            (function() {
                var deferred = new Deferred();

                db.query(
                    "SELECT PageID, Title, ShortTitle, PageData FROM tblPage WHERE PageURL = @url",
                    {url: {type: db.VARCHAR(1024), value: url}},
                    function(err, data) {
                        if (err) {
                            console.log("Database error in getPagesByUrl.");
                            console.log(err);
                            deferred.reject({
                                error: "There was a database error retrieving the pages.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        if (!data || !data[0] || data[0].length === 0) {
                            deferred.resolve(null);
                            return;
                        }

                        console.log("RESOLVED 2");
                        deferred.resolve({
                            id: data[0][0].PageID,
                            title: data[0][0].Title,
                            shortTitle: data[0][0].ShortTitle,
                            content: data[0][0].PageData
                        });
                    }
                );

                return deferred.promise;
            }())
        ).then(
            function(results) {
                console.log(results);
                results[1].pages = results[0];
                callback(null, results[1]);
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                callback(err);
            }
        );
    });
};
