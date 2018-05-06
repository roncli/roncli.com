var db = require("../database/database"),
    Moment = require("moment"),
    sanitizeHtml = require("sanitize-html"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all;

/**
 * Gets the page from the database.
 * @param {string} url The URL of the page to get.
 * @param {function} callback The callback function.
 */
module.exports.getPage = function(url, callback) {
    "use strict";

    var page = this;

    db.query(
        "SELECT PageID, PageURL, ParentPageID, Title, ShortTitle, PageData FROM tblPage WHERE PageURL = @url",
        {url: {type: db.VARCHAR(1024), value: url}},
        function(err, data) {
            var pageId, parentPageId;

            if (err) {
                console.log("Database error getting the page in page.getPage.");
                console.log(err);
                callback({
                    error: "There was a database error retrieving the page.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            if (!data || !data.recordsets || !data.recordsets[0] || data.recordsets[0].length === 0) {
                callback({
                    error: "The page does not exist.",
                    status: 404
                });
                return;
            }

            pageId = data.recordsets[0][0].PageID;
            parentPageId = data.recordsets[0][0].ParentPageID;

            all(
                // Get the parents.
                (function() {
                    var deferred = new Deferred();

                    page.getParents(pageId, function(err, parents) {
                        if (err) {
                            deferred.reject(err);
                            return;
                        }

                        deferred.resolve(parents);
                    });

                    return deferred.promise;
                }()),

                // Get the siblings.
                (function() {
                    var deferred = new Deferred();

                    if (!parentPageId) {
                        deferred.resolve(null);
                        return;
                    }

                    db.query(
                        "SELECT PageID, PageURL, Title, ShortTitle FROM tblPage WHERE ParentPageID = @parentPageId ORDER BY [Order]",
                        {parentPageId: {type: db.INT, value: parentPageId}},
                        function(err, data) {
                            if (err) {
                                console.log("Database error getting the siblings in page.getPage.");
                                console.log(err);
                                callback({
                                    error: "There was a database error retrieving the page.  Please reload the page and try again.",
                                    status: 500
                                });
                                return;
                            }

                            if (!data || !data.recordsets || !data.recordsets[0] || data.recordsets[0].length <= 1) {
                                deferred.resolve(null);
                                return;
                            }

                            deferred.resolve(data.recordsets[0].map(function(page) {
                                return {
                                    id: page.PageID,
                                    url: page.PageURL,
                                    shortTitle: page.ShortTitle || page.Title
                                };
                            }));
                        }
                    );

                    return deferred.promise;
                }()),

                // Get the children.
                (function() {
                    var deferred = new Deferred();

                    db.query(
                        "SELECT PageID, PageURL, Title, ShortTitle FROM tblPage WHERE ParentPageID = @pageId ORDER BY [ORDER]",
                        {pageId: {type: db.INT, value: pageId}},
                        function(err, data) {
                            if (err) {
                                console.log("Database error getting the children in page.getPage.");
                                console.log(err);
                                callback({
                                    error: "There was a database error retrieving the page.  Please reload the page and try again.",
                                    status: 500
                                });
                                return;
                            }

                            if (!data || !data.recordsets || !data.recordsets[0] || data.recordsets[0].length === 0) {
                                deferred.resolve(null);
                                return;
                            }

                            deferred.resolve(data.recordsets[0].map(function(page) {
                                return {
                                    id: page.PageID,
                                    url: page.PageURL,
                                    shortTitle: page.ShortTitle || page.Title
                                };
                            }));
                        }
                    );

                    return deferred.promise;
                }())
            ).then(
                function(results) {
                    var result = {
                        id: pageId,
                        page: {
                            id: pageId,
                            title: data.recordsets[0][0].Title,
                            shortTitle: data.recordsets[0][0].ShortTitle,
                            content: data.recordsets[0][0].PageData
                        },
                        parents: results[0],
                        siblings: results[1],
                        children: results[2]
                    };

                    if (result.parents.length > 1) {
                        result.parentTitle = result.parents[result.parents.length - 2].shortTitle;
                    }

                    callback(null, result);
                },

                // If any of the functions error out, it will be handled here.
                function(err) {
                    callback(err);
                }
            );
        }
    );
};

/**
 * Gets the parents for a page.
 * @param {number} pageId The Page ID to get the parents for.
 * @param {function} callback The callback function.
 */
module.exports.getParents = function(pageId, callback) {
    "use strict";

    var parents = [],
        getParent = function(currentPageId) {
            db.query(
                "SELECT PageID, PageURL, ParentPageID, Title, ShortTitle FROM tblPage WHERE PageID = @pageId",
                {pageId: {type: db.INT, value: currentPageId}},
                function(err, data) {
                    var parentPageId;

                    if (err) {
                        console.log("Database error in page.getParents.");
                        console.log(err);
                        callback({
                            error: "There was a database error retrieving the page's parents.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    if (!data || !data.recordsets || !data.recordsets[0] || data.recordsets[0].length === 0) {
                        callback(null, parents);
                        return;
                    }

                    parentPageId = data.recordsets[0][0].ParentPageID;

                    parents.unshift({
                        id: data.recordsets[0][0].PageID,
                        url: data.recordsets[0][0].PageURL,
                        shortTitle: data.recordsets[0][0].ShortTitle || data.recordsets[0][0].Title
                    });

                    if (parentPageId) {
                        getParent(parentPageId);
                        return;
                    }

                    callback(null, parents);
                }
            );
        };

    getParent(pageId);
};

/**
 * Gets comments for a post via the Page ID.
 * @param {number} pageId The Page ID of the post.
 * @param {function} callback The callback function.
 */
module.exports.getCommentsByPageId = function(pageId, callback) {
    "use strict";

    var comments = [];

    // Ensure the page exists.
    db.query(
        "SELECT COUNT(PageID) Pages FROM tblPage WHERE PageID = @pageId",
        {pageId: {type: db.INT, value: pageId}},
        function(err, data) {
            if (err) {
                console.log("Database error checking page in page.getCommentsByPageId.");
                console.log(err);
                callback({
                    error: "There was a database error retrieving page post comments.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            if (!data || !data.recordsets || !data.recordsets[0] || !data.recordsets[0][0] || data.recordsets[0][0] === 0) {
                callback({
                    error: "Page not found.",
                    status: 404
                });
                return;
            }

            // Get the comments.
            db.query(
                "SELECT pc.CommentID, pc.Comment, pc.CrDate, u.Alias FROM tblPageComment pc INNER JOIN tblUser u ON pc.CrUserID = u.UserID WHERE pc.PageID = @pageId AND pc.ModeratedDate IS NOT NULL ORDER BY pc.CrDate",
                {pageId: {type: db.INT, value: pageId}},
                function(err, data) {
                    if (err || !data || !data.recordsets || !data.recordsets[0]) {
                        console.log("Database error getting comments in page.getCommentsByPageId.");
                        console.log(err);
                        callback({
                            error: "There was a database error retrieving page post comments.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    if (data.recordsets[0]) {
                        comments = comments.concat(data.recordsets[0].map(function(comment) {
                            return {
                                id: comment.CommentID,
                                published: comment.CrDate.getTime(),
                                content: comment.Comment,
                                author: comment.Alias
                            };
                        }));
                    }

                    callback(null, comments.sort(function(a, b) {
                        return a.published - b.published;
                    }));
                }
            );
        }
    );
};

/**
 * Posts a comment to a page.
 * @param {int} userId The User ID posting the comment.
 * @param {string} pageId The Page ID.
 * @param {string} content The content of the post.
 * @param {function} callback The callback function.
 */
module.exports.postComment = function(userId, pageId, content, callback) {
    "use strict";

    all(
        /**
         * Check to see if the user has posted a comment within the last 60 seconds to prevent spam.
         */
        (function() {
            var deferred = new Deferred();

            db.query(
                "SELECT MAX(CrDate) LastComment FROM tblPageComment WHERE CrUserID = @userId",
                {userId: {type: db.INT, value: userId}},
                function(err, data) {
                    if (err || !data || !data.recordsets || !data.recordsets[0]) {
                        console.log("Database error in page.postComment while checking the user's last comment time.");
                        console.log(err);
                        deferred.reject({
                            error: "There was a database error posting a page comment.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    if (data.recordsets[0] && data.recordsets[0][0] && data.recordsets[0][0].LastComment > new Moment().add(-1, "minute")) {
                        deferred.reject({
                            error: "You must wait a minute after posting a comment to post a new comment.",
                            status: 400
                        });
                        return;
                    }

                    deferred.resolve();
                }
            );

            return deferred.promise;
        }()),

        /**
         * Ensure the page the user is posting to exists.
         */
        (function() {
            var deferred = new Deferred();

            db.query(
                "SELECT COUNT(PageID) Pages FROM tblPage WHERE PageID = @pageId",
                {pageId: {type: db.INT, value: pageId}},
                function(err, data) {
                    if (err) {
                        console.log("Database error checking page in page.getCommentsByPageId.");
                        console.log(err);
                        deferred.reject({
                            error: "There was a database error retrieving page post comments.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    if (!data || !data.recordsets || !data.recordsets[0] || !data.recordsets[0][0] || data.recordsets[0][0] === 0) {
                        deferred.reject({
                            error: "Page not found.",
                            status: 404
                        });
                        return;
                    }

                    deferred.resolve();
                }
            );

            return deferred.promise;
        }())
    ).then(
        /**
         * Add the post to the database.
         */
        function() {
            var attributes = sanitizeHtml.defaults.allowedAttributes;
            attributes.p = ["style"];
            attributes.span = ["style"];

            content = sanitizeHtml(content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "u", "sup", "sub", "strike", "address", "span"]),
                allowedAttributes: attributes
            });

            db.query(
                "INSERT INTO tblPageComment (PageID, Comment, CrDate, CrUserID) VALUES (@pageId, @content, GETUTCDATE(), @userId)",
                {
                    pageId: {type: db.INT, value: pageId},
                    content: {type: db.TEXT, value: content},
                    userId: {type: db.INT, value: userId}
                },
                function(err) {
                    if (err) {
                        console.log("Database error in page.postComment while posting a comment.");
                        console.log(err);
                        callback({
                            error: "There was a database error posting a page comment.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    callback();
                }
            );
        },

        // If any of the functions error out, it will be handled here.
        function(err) {
            callback(err);
        }
    );
};

/**
 * Gets the life features.
 * @param {function} callback The callback function.
 */
module.exports.getLifeFeatures = function(callback) {
    "use strict";

    db.query(
        "SELECT p.Title, p.PageURL FROM tblLifeFeature f INNER JOIN tblPage p ON f.PageID = p.PageID ORDER BY f.[Order]",
        {},
        function(err, data) {
            if (err) {
                console.log("Database error in page.getLifeFeatures.");
                console.log(err);
                callback({
                    error: "There was a database error retrieving the life features.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            if (data && data.recordsets && data.recordsets[0]) {
                callback(null, data.recordsets[0].map(function(feature) {
                    return {
                        title: feature.Title,
                        url: feature.PageURL
                    };
                }));
            }
        }
    );
};
