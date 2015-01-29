var User = require("./user"),
    db = require("../database/database"),
    blog = require("../models/blog"),
    cache = require("../cache/cache");

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
