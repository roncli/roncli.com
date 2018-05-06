var User = require("./user"),
    fs = require("fs"),
    path = require("path"),
    config = require("../privateConfig").files,
    db = require("../database/database"),
    blog = require("../models/blog"),
    page = require("../models/page"),
    music = require("../models/music"),
    coding = require("../models/coding"),
    gaming = require("../models/gaming"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Gets the list of child pages for a URL.
     * @param {string} url The URL to get child pages for.
     * @param {function(null, object)|function(object)} callback The callback function.
     */
    getChildPagesByUrl = function(url, callback) {
        "use strict";

        var sql;

        if (url === null) {
            sql = "SELECT PageID, PageURL, Title FROM tblPage WHERE ParentPageID IS NULL ORDER BY [Order], Title";
        } else {
            sql = "SELECT PageID, PageURL, Title FROM tblPage WHERE ParentPageID IN (SELECT PageID FROM tblPage WHERE PageURL = @url) ORDER BY [Order], Title";
        }

        db.query(
            sql, {url: {type: db.VARCHAR(1024), value: url}}, function(err, data) {
                if (err) {
                    console.log("Database error in getChildPagesByUrl.");
                    console.log(err);
                    callback(err);
                    return;
                }

                if (!data || !data.recordsets || !data.recordsets[0] || data.recordsets[0].length === 0) {
                    callback(null, []);
                    return;
                }

                callback(null,
                    data.recordsets[0].map(function(page) {
                        return {
                            id: page.PageID,
                            url: page.PageURL,
                            title: page.Title
                        };
                    })
                );
            }
        );
    },

    /**
     * Checks to see if the page URL exists.
     * @param {number} pageId The page ID to exclude from the search.
     * @param {string} url The URL to check to see if it exists.
     * @param {function(null, object)|function(object)} callback The callback function.
     */
    pageExistsByUrl = function(pageId, url, callback) {
        "use strict";

        db.query(
            "SELECT COUNT(PageID) Pages FROM tblPage WHERE PageURL = @url AND PageID <> @pageId",
            {
                url: {type: db.VARCHAR(1024), value: url},
                pageId: {type: db.INT, value: pageId}
            },
            function(err, data) {
                if (err) {
                    console.log("Database error in pageExistsByUrl.");
                    console.log(err);
                    callback(err);
                    return;
                }

                callback(null, data && data.recordsets && data.recordsets[0] && data.recordsets[0][0] && data.recordsets[0][0].Pages && data.recordsets[0][0].Pages > 0);
            }
        );
    };

/**
 * Return list of blog comments to moderate.
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

                if (!data || !data.recordsets || !data.recordsets[0]) {
                    callback(null, {});
                    return;
                }

                callback(null, data.recordsets[0].map(function(comment) {
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
        var promises = [];

        if (err) {
            callback({
                error: "There was a database error while clearing blog caches.  Please reload the page and try again.",
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

        ["roncli.com:blogger:*", "roncli.com:tumblr:*", "roncli.com:blog:*", "roncli.com:rss:blog:*"].forEach(function(key) {
            var deferred = new Deferred();

            cache.keys(key, function(keys) {
                if (keys.length > 0) {
                    cache.del(keys, function() {
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }
            });

            promises.push(deferred.promise);
        });

        all(promises).then(function() {
            blog.forceCachePosts(callback);
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
                    console.log(err);
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
                    console.log(err);
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
 * Gets the available life features.
 * @param {number} userId The user ID of the moderator.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getLifeFeatures = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting life features.  Please reload the page and try again.",
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

                db.query(
                    "SELECT f.FeatureID, p.Title, p.PageURL FROM tblLifeFeature f INNER JOIN tblPage p ON f.PageID = p.PageID ORDER BY f.[Order]",
                    {},
                    function(err, data) {
                        if (err || !data || !data.recordsets || !data.recordsets[0]) {
                            console.log("Database error in admin.getLifeFeatures retrieving life features.");
                            console.log(err);
                            deferred.reject(err);
                            return;
                        }

                        deferred.resolve(data.recordsets[0].map(function(feature) {
                            return {
                                id: feature.FeatureID,
                                title: feature.Title,
                                url: feature.PageURL
                            };
                        }));
                    }
                );

                return deferred.promise;
            }()),
            (function() {
                var deferred = new Deferred();

                db.query(
                    "SELECT PageID, Title FROM tblPage WHERE PageID NOT IN (SELECT PageID FROM tblLifeFeature)",
                    {},
                    function(err, data) {
                        if (err || !data || !data.recordsets || !data.recordsets[0]) {
                            console.log("Database error in admin.getLifeFeatures retrieving available pages for life features.");
                            console.log(err);
                            deferred.reject(err);
                            return;
                        }

                        deferred.resolve(data.recordsets[0].map(function(page) {
                            return {
                                id: page.PageID,
                                title: page.Title
                            };
                        }));
                    }
                );

                return deferred.promise;
            }())
        ).then(
            function(results) {
                callback(null, {
                    features: results[0],
                    pageList: results[1]
                });
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                callback(err);
            }
        );
    });
};

/**
 * Add a life feature.
 * @param {number} userId The user ID of the moderator.
 * @param {number} pageId The page ID to add.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.addLifeFeature = function(userId, pageId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while adding a life feature.  Please reload the page and try again.",
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
            "INSERT INTO tblLifeFeature (PageID, [Order], CrDate) SELECT p.PageID, f.Features + 1, GETUTCDATE() FROM tblPage p CROSS JOIN (SELECT COUNT(FeatureID) Features FROM tblLifeFeature) f WHERE p.PageID = @pageId AND p.PageID NOT IN (SELECT PageID FROM tblLifeFeature)",
            {pageId: {type: db.INT, value: pageId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.addLifeFeature.");
                    console.log(err);
                    callback(err);
                    return;
                }

                callback();
            }
        );
    });
};

/**
 * Remove a life feature.
 * @param {number} userId The user ID of the moderator.
 * @param {number} featureId The feature ID to remove.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.removeLifeFeature = function(userId, featureId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while removing a life feature.  Please reload the page and try again.",
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

        // Ensure the feature is valid.
        db.query(
            "SELECT COUNT(FeatureID) Features FROM tblLifeFeature WHERE FeatureID = @featureId",
            {featureId: {type: db.INT, value: featureId}},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.removeLifeFeature checking for a valid feature.");
                    console.log(err);
                    callback(err);
                    return;
                }

                if (!(data && data.recordsets && data.recordsets[0] && data.recordsets[0][0] && data.recordsets[0][0].Features && data.recordsets[0][0].Features > 0)) {
                    callback({
                        error: "The feature ID does not exist.",
                        status: 400
                    });
                    return;
                }

                db.query(
                    "UPDATE tblLifeFeature SET [Order] = [Order] - 1 WHERE [Order] > (SELECT f.[Order] FROM tblLifeFeature f WHERE f.FeatureId = @featureId);DELETE FROM tblLifeFeature WHERE FeatureID = @featureId",
                    {featureId: {type: db.INT, value: featureId}},
                    function(err) {
                        if (err) {
                            console.log("Database error in admin.removeLifeFeature removing a feature.");
                            console.log(err);
                            callback(err);
                            return;
                        }

                        callback();
                    }
                );
            }
        );
    });
};

/**
 * Changes the order of the life features.
 * @param {number} userId The user ID of the moderator.
 * @param {int[]} order The order of featureIds.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.changeLifeFeatureOrder = function(userId, order, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        var variableNames = [],
            variables = {};

        if (err) {
            callback({
                error: "There was a database error while changing the life feature order.  Please reload the page and try again.",
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

        // Just bail if there are no features in the list.
        if (order.length === 0) {
            callback();
            return;
        }

        // Ensure the features are valid.
        order.forEach(function(featureId) {
            variableNames.push("@feature" + featureId);
            variables["feature" + featureId] = {type: db.INT, value: featureId};
        });

        db.query(
            "SELECT COUNT(FeatureID) Features FROM tblLifeFeature WHERE FeatureID IN (" + variableNames.join(",") + ")",
            variables,
            function(err, data) {
                var sql = [],
                    sqlVariables = {};

                if (err) {
                    console.log("Database error in admin.changeLifeFeatureOrder checking for valid features.");
                    console.log(err);
                    callback(err);
                    return;
                }

                if (!(data && data.recordsets && data.recordsets[0] && data.recordsets[0][0] && data.recordsets[0][0].Features && data.recordsets[0][0].Features === order.length)) {
                    callback({
                        error: "Invalid features to reorder.  Please reload the page and try again",
                        status: 400
                    });
                    return;
                }

                // Update order of features.
                order.forEach(function(featureId, index) {
                    sql.push("UPDATE tblLifeFeature SET [Order] = @order" + index + " WHERE FeatureID = @feature" + featureId);
                    sqlVariables["order" + index] = {type: db.INT, value: index + 1};
                    sqlVariables["feature" + featureId] = {type: db.INT, value: featureId};
                });

                db.query(
                    sql.join(";"), sqlVariables, function(err) {
                        if (err) {
                            console.log("Database error updating feature order in admin.changeLifeFeatureOrder.");
                            console.log(err);
                            callback({
                                error: "There was a database error while changing life feature order.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        callback();
                    }
                );
            }
        );
    });
};

/**
 * Gets the child pages of a parent by URL.
 * @param {number} userId The user ID of the moderator.
 * @param {string} url The URL of the pages to get.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getPagesByParentUrl = function(userId, url, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting pages by parent URL.  Please reload the page and try again.",
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

                getChildPagesByUrl(url, function(err, pages) {
                    if (err) {
                        deferred.reject({
                            error: "There was a database error getting pages by parent URL.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    deferred.resolve(pages);
                });

                return deferred.promise;
            }()),
            (function() {
                var deferred = new Deferred();

                db.query(
                    "SELECT PageID, Title FROM tblPage WHERE ParentPageID IS NOT NULL ORDER BY Title",
                    {},
                    function(err, data) {
                        if (err || !data || !data.recordsets || !data.recordsets[0]) {
                            console.log("Database error in admin.getPagesByParentUrl.");
                            console.log(err);
                            deferred.reject(err);
                            return;
                        }

                        deferred.resolve(data.recordsets[0].map(function(page) {
                            return {
                                id: page.PageID,
                                title: page.Title
                            };
                        }));
                    }
                );

                return deferred.promise;
            }())
        ).then(
            function(results) {
                callback(null, {
                    pages: results[0],
                    pageList: results[1]
                });
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                callback(err);
            }
        );
    });
};

/**
 * Gets page data for a URL.
 * @param {number} userId The user ID of the moderator.
 * @param {string} url The URL of the page to get.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getPageByUrl = function(userId, url, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error retrieving the page.  Please reload the page and try again.",
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
            // Get the children of the page.
            (function() {
                var deferred = new Deferred();

                getChildPagesByUrl(url, function(err, pages) {
                    if (err) {
                        deferred.reject({
                            error: "There was a database error retrieving the page.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    deferred.resolve(pages);
                });

                return deferred.promise;
            }()),

            // Get the page data.
            (function() {
                var deferred = new Deferred();

                db.query(
                    "SELECT PageID, ParentPageID, Title, ShortTitle, PageData FROM tblPage WHERE PageURL = @url",
                    {url: {type: db.VARCHAR(1024), value: url}},
                    function(err, data) {
                        if (err) {
                            console.log("Database error getting page in admin.getPageByUrl.");
                            console.log(err);
                            deferred.reject({
                                error: "There was a database error retrieving the page.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        if (!data || !data.recordsets || !data.recordsets[0] || data.recordsets[0].length === 0) {
                            deferred.resolve(null);
                            return;
                        }

                        deferred.resolve({
                            id: data.recordsets[0][0].PageID,
                            parentPageId: data.recordsets[0][0].ParentPageID,
                            title: data.recordsets[0][0].Title,
                            shortTitle: data.recordsets[0][0].ShortTitle,
                            content: data.recordsets[0][0].PageData
                        });
                    }
                );

                return deferred.promise;
            }())
        ).then(
            function(results) {
                var pageId;

                if (!results[1]) {
                    callback(null, {});
                    return;
                }

                pageId = results[1].id;
                results[1].pages = results[0];

                // Get the parents of the page.
                page.getParents(pageId, function(err, parents) {
                    var variableNames = [],
                        variables = {};

                    if (err) {
                        callback({
                            error: "There was a database error retrieving the page.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    results[1].parents = parents;

                    parents.forEach(function(parent) {
                        variableNames.push("@page" + parent.id);
                        variables["page" + parent.id] = {type: db.INT, value: parent.id};
                    });
                    variables.parentPageId = {type: db.INT, value: pageId};

                    // Get the pages that can be moved to have this page as the parent.
                    db.query(
                        "SELECT PageID, Title FROM tblPage WHERE PageID NOT IN (" + variableNames.join(", ") + ") AND (ParentPageID IS NULL OR ParentPageID <> @parentPageId) ORDER BY Title",
                        variables,
                        function(err, data) {
                            if (err) {
                                console.log("Database error getting list of pages to move in admin.getPageByUrl.");
                                console.log(err);
                                callback({
                                    error: "There was a database error retrieving the page.  Please reload the page and try again.",
                                    status: 500
                                });
                                return;
                            }

                            if (!data || !data.recordsets || !data.recordsets[0] || data.recordsets[0].length === 0) {
                                data = {recordsets: [[]]};
                            }

                            results[1].pageList = data.recordsets[0].map(function(page) {
                                return {
                                    id: page.PageID,
                                    title: page.Title
                                };
                            });

                            callback(null, results[1]);
                        }
                    );
                });
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                callback(err);
            }
        );
    });
};

/**
 * Adds a page.
 * @param {number} userId The user ID of the moderator.
 * @param {number} parentPageId The parent page ID.
 * @param {string} url The URL.
 * @param {string} title The page title.
 * @param {string} shortTitle The short title of the page.
 * @param {string} content The content of the page.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.addPage = function(userId, parentPageId, url, title, shortTitle, content, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while adding a page.  Please reload the page and try again.",
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

        // Check to make sure the page hasn't already been added.
        pageExistsByUrl(0, url, function(err, exists) {
            var data = {},
                sql;

            if (err) {
                callback({
                    error: "There was a database error while adding a page.  Please reload the page and try again.",
                    status: 500
                });
            }

            if (exists) {
                callback({
                    error: "The page already exists.",
                    status: 400
                });
                return;
            }

            data.url = {type: db.VARCHAR(1024), value: url};
            data.title = {type: db.VARCHAR(255), value: title};
            data.shortTitle = {type: db.VARCHAR(255), value: shortTitle};
            data.content = {type: db.TEXT, value: content};
            if (parentPageId) {
                sql = "INSERT INTO tblPage (PageURL, ParentPageID, [Order], Title, ShortTitle, PageData, CrDate, UpdDate) SELECT @url, @parentPageId, COUNT(PageID) + 1, @title, @shortTitle, @content, GETUTCDATE(), GETUTCDATE() FROM tblPage WHERE ParentPageID = @parentPageId";
                data.parentPageId = {type: db.INT, value: parentPageId};
            } else {
                sql = "INSERT INTO tblPage (PageURL, ParentPageID, [Order], Title, ShortTitle, PageData, CrDate, UpdDate) VALUES (@url, NULL, NULL, @title, @shortTitle, @content, GETUTCDATE(), GETUTCDATE())";
            }
            db.query(
                sql, data, function(err) {
                    if (err) {
                        console.log("Database error in admin.addPage.");
                        console.log(err);
                        callback({
                            error: "There was a database error while adding a page.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    callback();
                }
            );
        });
    });
};

/**
 * Updates a page.
 * @param {number} userId The user ID of the moderator.
 * @param {number} pageId The page ID.
 * @param {string} url The URL.
 * @param {string} title The page title.
 * @param {string} shortTitle The short title of the page.
 * @param {string} content The content of the page.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.updatePage = function(userId, pageId, url, title, shortTitle, content, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while updating a page.  Please reload the page and try again.",
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

        // Check to ensure the page being updated exists.
        db.query(
            "SELECT COUNT(PageID) Pages FROM tblPage WHERE PageID = @pageID",
            {pageId: {type: db.INT, value: pageId}},
            function(err, data) {
                if (err) {
                    console.log("Database error checking to ensure the page exists in admin.updatePage.");
                    console.log(err);
                    callback({
                        error: "There was a database error while updating a page.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data.recordsets[0] || !data.recordsets[0] || !data.recordsets[0][0] || !data.recordsets[0][0].Pages || data.recordsets[0][0].Pages === 0) {
                    callback({
                        error: "Page ID does not exist.",
                        status: 400
                    });
                    return;
                }

                // Check to make sure the page hasn't already been added.
                pageExistsByUrl(pageId, url, function(err, exists) {
                    if (err) {
                        callback({
                            error: "There was a database error while updating a page.  Please reload the page and try again.",
                            status: 500
                        });
                    }

                    if (exists) {
                        callback({
                            error: "A page with this URL already exists.",
                            status: 400
                        });
                        return;
                    }

                    db.query(
                        "UPDATE tblPage SET PageURL = @url, Title = @title, ShortTitle = @shortTitle, PageData = @content, UpdDate = GETUTCDATE() WHERE PageID = @pageId",
                        {
                            url: {type: db.VARCHAR(1024), value: url},
                            title: {type: db.VARCHAR(255), value: title},
                            shortTitle: {type: db.VARCHAR(255), value: shortTitle},
                            content: {type: db.TEXT, value: content},
                            pageId: {type: db.INT, value: pageId}
                        },
                        function(err) {
                            if (err) {
                                console.log("Database error updating a page in admin.updatePage.");
                                console.log(err);
                                callback({
                                    error: "There was a database error while updating a page.  Please reload the page and try again.",
                                    status: 500
                                });
                                return;
                            }

                            callback();
                        }
                    );
                });
            }
        );
    });
};

/**
 * Deletes a page.
 * @param {number} userId The user ID of the moderator.
 * @param {number} pageId The page ID.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.deletePage = function(userId, pageId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while deleting a page.  Please reload the page and try again.",
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
            "UPDATE tblPage SET ParentPageID = NULL, [Order] = NULL WHERE ParentPageID = @pageId; DELETE FROM tblPage WHERE PageId = @pageId",
            {pageId: {type: db.INT, value: pageId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.updatePage.");
                    console.log(err);
                    callback({
                        error: "There was a database error while deleting a page.  Please reload the page and try again.",
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
 * Moves a page.
 * @param {number} userId The user ID of the moderator.
 * @param {number} pageId The page ID to move.
 * @param {number} newParentPageId The parent page ID to move the page to.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.movePage = function(userId, pageId, newParentPageId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while moving a page.  Please reload the page and try again.",
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

        // Ensure both pages exist and are separate pages.
        db.query(
            "SELECT COUNT(PageID) Pages FROM tblPage WHERE pageId IN (@pageId, @parentPageId)",
            {
                pageId: {type: db.INT, value: pageId},
                parentPageId: {type: db.INT, value: newParentPageId}
            },
            function(err, data) {
                var deferred;

                if (err) {
                    console.log("Database error checking pages in admin.movePage.");
                    console.log(err);
                    callback({
                        error: "There was a database error while moving a page.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data.recordsets[0] || !data.recordsets[0] || !data.recordsets[0][0] || data.recordsets[0][0].Pages !== 1 + (newParentPageId ? 1 : 0)) {
                    callback({
                        error: "Invalid page to move.  Please reload the page and try again.",
                        status: 400
                    });
                    return;
                }

                // Ensure the parent page ID is valid.
                deferred = new Deferred();

                if (newParentPageId) {
                    page.getParents(newParentPageId, function(err, pages) {
                        if (err) {
                            deferred.reject({
                                error: "There was a database error while moving a page.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        pages = pages.map(function(page) {
                            return page.id;
                        });

                        if (pages.indexOf(pageId) !== -1) {
                            deferred.reject({
                                error: "Invalid page to move.  Please reload the page and try again.",
                                status: 400
                            });
                            return;
                        }

                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }

                deferred.promise.then(
                    function() {
                        // Reorder the page's sibilings.
                        db.query(
                            "UPDATE tblPage SET [Order] = [Order] - 1 WHERE ParentPageID IS NOT NULL AND ParentPageID = (SELECT p.ParentPageID FROM tblPage p WHERE p.PageID = @pageId) AND [Order] > (SELECT p.[Order] FROM tblPage p WHERE p.PageID = @pageId)",
                            {pageId: {type: db.INT, value: pageId}},
                            function(err) {
                                var sql, variables;

                                if (err) {
                                    console.log("Database error reordering sibling pages in admin.movePage.");
                                    console.log(err);
                                    callback({
                                        error: "There was a database error while moving a page.  Please reload the page and try again.",
                                        status: 500
                                    });
                                    return;
                                }

                                // Move the page to the end of the new parent page.
                                variables = {pageId: {type: db.INT, value: pageId}};
                                if (newParentPageId) {
                                    sql = "UPDATE tblPage SET ParentPageID = @parentPageId, [Order] = p.Pages + 1 FROM (SELECT COUNT(PageID) Pages FROM tblPage WHERE ParentPageID = @parentPageId) p WHERE PageID = @pageId";
                                    variables.parentPageId = {type: db.INT, value: newParentPageId};
                                } else {
                                    sql = "UPDATE tblPage SET ParentPageID = NULL, [Order] = NULL WHERE PageId = @pageId";
                                }

                                db.query(
                                    sql, variables, function(err) {
                                        if (err) {
                                            console.log("Database error reordering sibling pages in admin.movePage.");
                                            console.log(err);
                                            callback({
                                                error: "There was a database error while moving a page.  Please reload the page and try again.",
                                                status: 500
                                            });
                                            return;
                                        }

                                        callback();
                                    }
                                );
                            }
                        );
                    },

                    // If the function errors out, it will be handled here.
                    function(err) {
                        callback(err);
                    }
                );
            }
        );
    });
};

/**
 * Changes the order of a page's children.
 * @param {number} userId The user ID of the moderator.
 * @param {number} parentPageId The page ID to move.
 * @param {int[]} order The order of pageIDs.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.changePageOrder = function(userId, parentPageId, order, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        var variableNames = [],
            variables = {};

        if (err) {
            callback({
                error: "There was a database error while changing page order.  Please reload the page and try again.",
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

        // Just bail if there are no pages in the list.
        if (order.length === 0) {
            callback();
            return;
        }

        // Ensure all of the pages in the order list have a parent page of the same page ID.
        order.forEach(function(pageId) {
            variableNames.push("@page" + pageId);
            variables["page" + pageId] = {type: db.INT, value: pageId};
        });
        variables.parentPageId = {type: db.INT, value: parentPageId};

        db.query(
            "SELECT COUNT(PageID) Pages FROM tblPage WHERE PageID IN (" + variableNames.join(", ") + ") AND ParentPageID IS NOT NULL AND ParentPageID = @parentPageId",
            variables,
            function(err, data) {
                var sql = [],
                    sqlVariables = {};

                if (err) {
                    console.log("Database error checking pages in admin.changePageOrder.");
                    console.log(err);
                    callback({
                        error: "There was a database error while changing page order.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data.recordsets || !data.recordsets[0] || !data.recordsets[0][0] || data.recordsets[0][0].Pages !== order.length) {
                    callback({
                        error: "Invalid pages to reorder.  Please reload the page and try again.",
                        status: 400
                    });
                    return;
                }

                // Update order of pages.
                order.forEach(function(pageId, index) {
                    sql.push("UPDATE tblPage SET [Order] = @order" + index + " WHERE PageID = @page" + pageId);
                    sqlVariables["order" + index] = {type: db.INT, value: index + 1};
                    sqlVariables["page" + pageId] = {type: db.INT, value: pageId};
                });

                db.query(
                    sql.join(";"), sqlVariables, function(err) {
                        if (err) {
                            console.log("Database error updating page order in admin.changePageOrder.");
                            console.log(err);
                            callback({
                                error: "There was a database error while changing page order.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        callback();
                    }
                );
            }
        );
    });
};

/**
 * Return list of page comments to moderate.
 * @param {number} userId The user ID of the moderator.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getPageCommentsToModerate = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting page comments to moderate.  Please reload the page and try again.",
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
            "SELECT pc.CommentID, pc.Comment, pc.CrDate, u.Alias, p.PageURL FROM tblPageComment pc INNER JOIN tblPage p on pc.PageID = p.PageID INNER JOIN tblUser u ON pc.CrUserID = u.UserID WHERE pc.ModeratedDate IS NULL ORDER BY pc.CrDate",
            {},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.getPageCommentsToModerate");
                    console.log(err);
                    callback({
                        error: "There was a database error while getting page comments to moderate.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data.recordsets || !data.recordsets[0]) {
                    callback(null, {});
                    return;
                }

                callback(null, data.recordsets[0].map(function(comment) {
                    return {
                        id: comment.CommentID,
                        published: comment.CrDate.getTime(),
                        content: comment.Comment,
                        author: comment.Alias,
                        url: comment.PageURL
                    };
                }));
            }
        );
    });
};

/**
 * Approves a page comment.
 * @param {number} userId The user ID of the moderator.
 * @param {number} commentId The comment ID to approve.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.approvePageComment = function(userId, commentId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while approving a page comment.  Please reload the page and try again.",
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
            "UPDATE tblPageComment SET ModeratedDate = GETUTCDATE() WHERE CommentID = @id",
            {id: {type: db.INT, value: commentId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.approvePageComment.");
                    console.log(err);
                    callback({
                        error: "There was a database error while approving a page comment.  Please reload the page and try again.",
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
 * Rejects a page comment.
 * @param {number} userId The user ID of the moderator.
 * @param {number} commentId The comment ID to reject.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.rejectPageComment = function(userId, commentId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while rejecting a page comment.  Please reload the page and try again.",
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
            "DELETE FROM tblPageComment WHERE CommentID = @id",
            {id: {type: db.INT, value: commentId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.approvePageComment.");
                    console.log(err);
                    callback({
                        error: "There was a database error while rejecting a page comment.  Please reload the page and try again.",
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
 * Gets the files.
 * @param {number} userId The user ID of the moderator.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getFiles = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting the files.  Please reload the page and try again.",
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

        fs.readdir(config.path, function(err, files) {
            var ls = [], promises = [];

            if (err) {
                console.log("File system error while reading the directory in admin.getFiles.");
                console.log(err);
                callback({
                    error: "There was a server error while getting the files.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            if (files.length === 0) {
                callback(null, []);
                return;
            }

            files.forEach(function(file) {
                promises.push(
                    (function() {
                        var deferred = new Deferred();

                        fs.stat(path.join(config.path, file), function(err, stats) {
                            if (err) {
                                console.log("File system error while reading a file in admin.getFiles.");
                                console.log(err);
                                deferred.reject({
                                    error: "There was a server error while getting the files.  Please reload the page and try again.",
                                    status: 500
                                });
                                return;
                            }

                            if (stats.isFile()) {
                                ls.push({
                                    file: file,
                                    size: stats.size,
                                    created: stats.ctime.getTime(),
                                    modified: stats.mtime.getTime()
                                });
                            }

                            deferred.resolve(true);
                        });

                        return deferred.promise;
                    }())
                );
            });

            all(promises).then(
                function() {
                    callback(null, ls.sort(function(a, b) {
                        return a.file.toLowerCase().localeCompare(b.file.toLowerCase());
                    }));
                },

                function(err) {
                    callback(err);
                }
            );
        });
    });
};

/**
 * Deletes a file.
 * @param {number} userId The user ID of the moderator.
 * @param {string} filename The name of the file to delete.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.deleteFile = function(userId, filename, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting the files.  Please reload the page and try again.",
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

        fs.unlink(path.join(config.path, filename), function(err) {
            if (err) {
                console.log("File system error while deleting a file in admin.deleteFile.");
                console.log(err);
                callback({
                    error: "There was a server error while delete a file.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            callback();
        });
    });
};

/**
 * Clears the music's caches.
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.clearMusicCaches = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        var promises = [];

        if (err) {
            callback({
                error: "There was a database error while clearing music caches.  Please reload the page and try again.",
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

        ["roncli.com:soundcloud:*", "roncli.com:song:*", "roncli.com:rss:music:*"].forEach(function(key) {
            var deferred = new Deferred();

            cache.keys(key, function(keys) {
                if (keys.length > 0) {
                    cache.del(keys, function() {
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }
            });

            promises.push(deferred.promise);
        });

        all(promises).then(function() {
            music.forceCacheSongs(callback);
        });
    });
};

/**
 * Return list of song comments to moderate.
 * @param {number} userId The user ID of the moderator.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getSongCommentsToModerate = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting song comments to moderate.  Please reload the page and try again.",
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
            "SELECT sc.CommentID, sc.Comment, sc.CrDate, u.Alias, sc.SongURL FROM tblSongComment sc INNER JOIN tblUser u ON sc.CrUserID = u.UserID WHERE sc.ModeratedDate IS NULL ORDER BY sc.CrDate",
            {},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.getSongCommentsToModerate");
                    console.log(err);
                    callback({
                        error: "There was a database error while getting song comments to moderate.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data.recordsets || !data.recordsets[0]) {
                    callback(null, {});
                    return;
                }

                callback(null, data.recordsets[0].map(function(comment) {
                    return {
                        id: comment.CommentID,
                        published: comment.CrDate.getTime(),
                        content: comment.Comment,
                        author: comment.Alias,
                        url: comment.SongURL
                    };
                }));
            }
        );
    });
};

/**
 * Approves a song comment.
 * @param {number} userId The user ID of the moderator.
 * @param {number} commentId The comment ID to approve.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.approveSongComment = function(userId, commentId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while approving a song comment.  Please reload the page and try again.",
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
            "UPDATE tblSongComment SET ModeratedDate = GETUTCDATE() WHERE CommentID = @id",
            {id: {type: db.INT, value: commentId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.approveSongComment.");
                    console.log(err);
                    callback({
                        error: "There was a database error while approving a song comment.  Please reload the page and try again.",
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
 * Rejects a song comment.
 * @param {number} userId The user ID of the moderator.
 * @param {number} commentId The comment ID to reject.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.rejectSongComment = function(userId, commentId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while rejecting a song comment.  Please reload the page and try again.",
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
            "DELETE FROM tblSongComment WHERE CommentID = @id",
            {id: {type: db.INT, value: commentId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.approveSongComment.");
                    console.log(err);
                    callback({
                        error: "There was a database error while rejecting a song comment.  Please reload the page and try again.",
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
 * Clears the coding caches.
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.clearCodingCaches = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        var promises = [];

        if (err) {
            callback({
                error: "There was a database error while clearing coding caches.  Please reload the page and try again.",
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

        ["roncli.com:projects", "roncli.com:projects:*", "roncli.com:github:*", "roncli.com:rss:coding:*"].forEach(function(key) {
            var deferred = new Deferred();

            cache.keys(key, function(keys) {
                if (keys.length > 0) {
                    cache.del(keys, function() {
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }
            });

            promises.push(deferred.promise);
        });

        all(promises).then(function() {
            music.forceCacheSongs(callback);
        });
    });
};

/**
 * Gets the projects.
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.getProjects = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting projects.  Please reload the page and try again.",
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

        coding.getProjectList(function(err, projects) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, projects);
        });
    });
};

/**
 * Adds a project.
 * @param {number} userId The user ID of the moderator.
 * @param {string} url The URL of the project on the site.
 * @param {string} title The title of the project.
 * @param {string} projectUrl The URL of the project's official project page.
 * @param {string} user The GitHub username.
 * @param {string} repository The GitHub repository.
 * @param {string} description The description of the project.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.addProject = function(userId, url, title, projectUrl, user, repository, description, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while adding a project.  Please reload the page and try again.",
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

        // Ensure the project doesn't already exist.
        db.query(
            "SELECT COUNT(ProjectID) Projects FROM tblProject WHERE URL = @url",
            {url: {type: db.VARCHAR(1024), value: url}},
            function(err, data) {
                if (err) {
                    console.log("Database error checking if project exists in admin.addProject.");
                    console.log(err);
                    callback({
                        error: "There was a database error while adding a project.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (data && data.recordsets && data.recordsets[0] && data.recordsets[0][0] && data.recordsets[0][0].Projects > 0) {
                    callback({
                        error: "Project URL already exists.",
                        status: 400
                    });
                    return;
                }

                // Add the project.
                db.query(
                    "INSERT INTO tblProject (URL, Title, ProjectURL, [User], Repository, Description) VALUES (@url, @title, @projectUrl, @user, @repository, @description)",
                    {
                        url: {type: db.VARCHAR(1024), value: url},
                        title: {type: db.VARCHAR(255), value: title},
                        projectUrl: {type: db.VARCHAR(1024), value: projectUrl},
                        user: {type: db.VARCHAR(50), value: user},
                        repository: {type: db.VARCHAR(50), value: repository},
                        description: {type: db.TEXT, value: description}
                    },
                    function(err) {
                        if (err) {
                            console.log("Database error adding a project in admin.addProject.");
                            console.log(err);
                            callback({
                                error: "There was a database error while adding a project.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        callback();
                    }
                );
            }
        );
    });
};

/**
 * Deletes a project.
 * @param {number} userId The user ID of the moderator.
 * @param {number} projectId The project ID.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.deleteProject = function(userId, projectId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while deleting a project.  Please reload the page and try again.",
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
            "UPDATE tblProjectFeature SET [Order] = [Order] - 1 WHERE EXISTS(SELECT [Order] FROM tblProjectFeature WHERE ProjectID = @projectId) AND [Order] > (SELECT [Order] FROM tblProjectFeature WHERE ProjectID = @projectId); DELETE FROM tblProjectFeature WHERE ProjectID = @projectId; DELETE FROM tblProject WHERE ProjectID = @projectId",
            {projectId: {type: db.INT, value: projectId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.deleteProject.");
                    console.log(err);
                    callback({
                        error: "There was a database error while deleting a project.  Please reload the page and try again.",
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
 * Gets project data for a URL.
 * @param {number} userId The user ID of the moderator.
 * @param {string} url The URL of the project to get.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getProjectByUrl = function(userId, url, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error retrieving the project.  Please reload the page and try again.",
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
            "SELECT ProjectID, URL, Title, ProjectURL, [User], Repository, Description FROM tblProject WHERE URL = @url",
            {url: {type: db.VARCHAR(1024), value: url}},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.getPageByUrl.");
                    console.log(err);
                    callback({
                        error: "There was a database error retrieving the project.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data.recordsets || !data.recordsets[0] || data.recordsets[0].length === 0) {
                    callback({
                        error: "Project not found.",
                        status: 404
                    });
                    return;
                }

                callback(null, {
                    id: data.recordsets[0][0].ProjectID,
                    url: data.recordsets[0][0].URL,
                    title: data.recordsets[0][0].Title,
                    projectUrl: data.recordsets[0][0].ProjectURL,
                    user: data.recordsets[0][0].User,
                    repository: data.recordsets[0][0].Repository,
                    description: data.recordsets[0][0].Description
                });
            }
        );
    });
};

/**
 * Updates a project.
 * @param {number} userId The user ID of the moderator.
 * @param {number} projectId The project ID to update.
 * @param {string} url The URL of the project on the site.
 * @param {string} title The title of the project.
 * @param {string} projectUrl The URL of the project's official project page.
 * @param {string} user The GitHub username.
 * @param {string} repository The GitHub repository.
 * @param {string} description The description of the project.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.updateProject = function(userId, projectId, url, title, projectUrl, user, repository, description, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while updating a project.  Please reload the page and try again.",
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

        if (projectUrl.length === 0) {
            projectUrl = null;
        }

        if (user.length === 0) {
            user = null;
        }

        if (repository.length === 0) {
            repository = null;
        }

        // Ensure the project doesn't already exist.
        db.query(
            "SELECT COUNT(ProjectID) Projects FROM tblProject WHERE URL = @url AND ProjectID <> @projectId",
            {
                url: {type: db.VARCHAR(1024), value: url},
                projectId: {type: db.INT, value: projectId}
            },
            function(err, data) {
                if (err) {
                    console.log("Database error checking if project exists in admin.updateProject.");
                    console.log(err);
                    callback({
                        error: "There was a database error while updating a project.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (data && data.recordsets && data.recordsets[0] && data.recordsets[0][0] && data.recordsets[0][0].Projects > 0) {
                    callback({
                        error: "Project URL already exists.",
                        status: 400
                    });
                    return;
                }

                // Update the project.
                db.query(
                    "UPDATE tblProject SET URL = @url, Title = @title, ProjectURL = @projectUrl, [User] = @user, Repository = @repository, Description = @description WHERE ProjectID = @projectId",
                    {
                        url: {type: db.VARCHAR(1024), value: url},
                        title: {type: db.VARCHAR(255), value: title},
                        projectUrl: {type: db.VARCHAR(1024), value: projectUrl},
                        user: {type: db.VARCHAR(50), value: user},
                        repository: {type: db.VARCHAR(50), value: repository},
                        description: {type: db.TEXT, value: description},
                        projectId: {type: db.INT, value: projectId}
                    },
                    function(err) {
                        if (err) {
                            console.log("Database error updating a project in admin.updateProject.");
                            console.log(err);
                            callback({
                                error: "There was a database error while updating a project.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        callback();
                    }
                );
            }
        );
    });
};

/**
 * Gets the featured projects.
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.getFeaturedProjects = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting featured projects.  Please reload the page and try again.",
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

        coding.getFeaturedProjectList(function(err, projects) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, projects);
        });
    });
};

/**
 * Gets the unfeatured projects.
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.getUnfeaturedProjects = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while retrieving unfeatured projects.  Please reload the page and try again.",
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
            "SELECT ProjectID, Title FROM tblProject WHERE ProjectID NOT IN (SELECT ProjectID FROM tblProjectFeature) ORDER BY Title",
            {},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.getUnfeaturedProjects.");
                    console.log(err);
                    callback({
                        error: "There was a database error while retrieving unfeatured projects.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data.recordsets || !data.recordsets[0]) {
                    callback(null, []);
                }

                callback(null, data.recordsets[0].map(function(project) {
                    return {
                        id: project.ProjectID,
                        title: project.Title
                    };
                }));
            }
        );
    });
};

/**
 * Features a project.
 * @param {number} userId The user ID of the moderator.
 * @param {number} projectId The project ID to feature.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.featureProject = function(userId, projectId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while featuring a project.  Please reload the page and try again.",
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

        // Ensure the project is not already featured.
        db.query(
            "SELECT COUNT(FeatureID) Projects FROM tblProjectFeature WHERE ProjectID = @projectId",
            {projectId: {type: db.INT, value: projectId}},
            function(err, data) {
                if (err) {
                    console.log("Database error checking if project is featured in admin.featureProject.");
                    console.log(err);
                    callback({
                        error: "There was a database error while featuring a project.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (data && data.recordsets && data.recordsets[0] && data.recordsets[0][0] && data.recordsets[0][0].Projects > 0) {
                    callback({
                        error: "Project already featured.",
                        status: 400
                    });
                    return;
                }

                // Feature the project.
                db.query(
                    "INSERT INTO tblProjectFeature (ProjectID, [Order]) SELECT @projectId, (SELECT COUNT(FeatureID) + 1 FROM tblProjectFeature)",
                    {projectId: {type: db.INT, value: projectId}},
                    function(err) {
                        if (err) {
                            console.log("Database error featuring a project in admin.featureProject.");
                            console.log(err);
                            callback({
                                error: "There was a database error while featuring a project.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        callback();
                    }
                );
            }
        );
    });
};

/**
 * Unfeatures a project.
 * @param {number} userId The user ID of the moderator.
 * @param {number} projectId The project ID to unfeature.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.unfeatureProject = function(userId, projectId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while unfeaturing a project.  Please reload the page and try again.",
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
            "UPDATE tblProjectFeature SET [Order] = [Order] - 1 WHERE [Order] > (SELECT [Order] FROM tblProjectFeature WHERE ProjectID = @projectId); DELETE FROM tblProjectFeature WHERE ProjectID = @projectId",
            {projectId: {type: db.INT, value: projectId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.unfeatureProject.");
                    console.log(err);
                    callback({
                        error: "There was a database error while unfeaturing a project.  Please reload the page and try again.",
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
 * Changes the order of featured projects.
 * @param {number} userId The user ID of the moderator.
 * @param {int[]} order The order of projectIDs.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.changeFeatureProjectOrder = function(userId, order, callback) {
    "use strict";

    var sql = [],
        sqlVariables = {};

    order.forEach(function(projectId, index) {
        sql.push("UPDATE tblProjectFeature SET [Order] = @order" + index + " WHERE ProjectID = @project" + projectId);
        sqlVariables["order" + index] = {type: db.INT, value: index + 1};
        sqlVariables["project" + projectId] = {type: db.INT, value: projectId};
    });

    db.query(
        sql.join(";"), sqlVariables, function(err) {
            if (err) {
                console.log("Database error in admin.changeFeatureProjectOrder.");
                console.log(err);
                callback({
                    error: "There was a database error while changing featured projects order.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            callback();
        }
    );
};

/**
 * Clears the gaming caches.
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.clearGamingCaches = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        var promises = [];

        if (err) {
            callback({
                error: "There was a database error while clearing gaming caches.  Please reload the page and try again.",
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

        ["roncli.com:battlenet:*", "roncli.com:steam:*", "roncli.com:dcl:*"].forEach(function(key) {
            var deferred = new Deferred();

            cache.keys(key, function(keys) {
                if (keys.length > 0) {
                    cache.del(keys, function() {
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }
            });

            promises.push(deferred.promise);
        });

        all(promises).then(function() {
            all(
                (function() {
                    var deferred = new Deferred();

                    gaming.forceCacheCharacter(function() {
                        deferred.resolve(true);
                    });

                    return deferred.promise;
                }()),
                (function() {
                    var deferred = new Deferred();

                    gaming.forceCacheProfile(function() {
                        deferred.resolve(true);
                    });

                    return deferred.promise;
                }()),
                (function() {
                    var deferred = new Deferred();

                    gaming.forceCacheDcl(function() {
                        deferred.resolve(true);
                    });

                    return deferred.promise;
                }())
            ).then(function() {
                callback();
            });
        });
    });
};

/**
 * Clears the YouTube caches.
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.clearYoutubeCaches = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        var promises = [];

        if (err) {
            callback({
                error: "There was a database error while clearing YouTube caches.  Please reload the page and try again.",
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

        ["roncli.com:youtube:*"].forEach(function(key) {
            var deferred = new Deferred();

            cache.keys(key, function(keys) {
                if (keys.length > 0) {
                    cache.del(keys, function() {
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }
            });

            promises.push(deferred.promise);
        });

        all(promises).then(function() {
            callback();
        });
    });
};

/**
 * Retrieves the allowed playlists
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.getPlaylists = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting allowed playlists.  Please reload the page and try again.",
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
            "SELECT PlaylistID FROM tblAllowedPlaylist",
            {},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.getPlaylists");
                    console.log(err);
                    callback({
                        error: "There was a database error while getting allowed playlists.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (data && data.recordsets && data.recordsets[0]) {
                    callback(null, data.recordsets[0].map(function(playlist) {
                        return {playlistId: playlist.PlaylistID};
                    }));
                } else {
                    callback(null, []);
                }
            }
        );
    });
};

/**
 * Adds an item to the allowed playlists.
 * @param {number} userId The user ID of the moderator.
 * @param {string} playlistId The playlist ID to add.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.addPlaylist = function(userId, playlistId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while adding an allowed playlist.  Please reload the page and try again.",
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
            "INSERT INTO tblAllowedPlaylist VALUES (@playlistId)",
            {playlistId: {type: db.VARCHAR(64), value: playlistId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.addPlaylist");
                    console.log(err);
                    callback({
                        error: "There was a database error while adding an allowed playlist.  Please reload the page and try again.",
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
 * Removes an item from the allowed playlists.
 * @param {number} userId The user ID of the moderator.
 * @param {string} playlistId The playlist ID to remove.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.removePlaylist = function(userId, playlistId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while removing an allowed playlist.  Please reload the page and try again.",
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
            "DELETE FROM tblAllowedPlaylist WHERE PlaylistID = @playlistId",
            {playlistId: {type: db.VARCHAR(64), value: playlistId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.removePlaylist");
                    console.log(err);
                    callback({
                        error: "There was a database error while removing an allowed playlist.  Please reload the page and try again.",
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
 * Return list of YouTube comments to moderate.
 * @param {number} userId The user ID of the moderator.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.getYoutubeCommentsToModerate = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while getting YouTube comments to moderate.  Please reload the page and try again.",
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
            "SELECT pc.CommentID, pc.Comment, pc.CrDate, u.Alias, pc.PlaylistID FROM tblPlaylistComment pc INNER JOIN tblUser u ON pc.CrUserID = u.UserID WHERE pc.ModeratedDate IS NULL ORDER BY pc.CrDate",
            {},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.getYoutubeCommentsToModerate");
                    console.log(err);
                    callback({
                        error: "There was a database error while getting YouTube comments to moderate.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data.recordsets || !data.recordsets[0]) {
                    callback(null, {});
                    return;
                }

                callback(null, data.recordsets[0].map(function(comment) {
                    return {
                        id: comment.CommentID,
                        published: comment.CrDate.getTime(),
                        content: comment.Comment,
                        author: comment.Alias,
                        playlistId: comment.PlaylistID
                    };
                }));
            }
        );
    });
};

/**
 * Approves a YouTube comment.
 * @param {number} userId The user ID of the moderator.
 * @param {number} commentId The comment ID to approve.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.approveYoutubeComment = function(userId, commentId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while approving a YouTube comment.  Please reload the page and try again.",
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
            "UPDATE tblPlaylistComment SET ModeratedDate = GETUTCDATE() WHERE CommentID = @id",
            {id: {type: db.INT, value: commentId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.approveYoutubeComment.");
                    console.log(err);
                    callback({
                        error: "There was a database error while approving a YouTube comment.  Please reload the page and try again.",
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
 * Rejects a YouTube comment.
 * @param {number} userId The user ID of the moderator.
 * @param {number} commentId The comment ID to reject.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.rejectYoutubeComment = function(userId, commentId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while rejecting a YouTube comment.  Please reload the page and try again.",
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
            "DELETE FROM tblPlaylistComment WHERE CommentID = @id",
            {id: {type: db.INT, value: commentId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.approveYoutubeComment.");
                    console.log(err);
                    callback({
                        error: "There was a database error while rejecting a YouTube comment.  Please reload the page and try again.",
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
 * Gets the list of redirects.
 * @param {number} userId The user ID of the moderator.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.getRedirects = function(userId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while retrieving redirects.  Please reload the page and try again.",
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
            "SELECT RedirectID, FromPath, ToURL FROM tblRedirect ORDER BY FromPath",
            {},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.getRedirects.");
                    console.log(err);
                    callback({
                        error: "There was a database error while retrieving redirects.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (data && data.recordsets && data.recordsets[0]) {
                    callback(null, data.recordsets[0].map(function(row) {
                        return {
                            id: row.RedirectID,
                            fromPath: row.FromPath,
                            toUrl: row.ToURL
                        };
                    }));
                } else {
                    callback(null, []);
                }
            }
        );
    });
};

/**
 * Add a redirects.
 * @param {number} userId The user ID of the moderator.
 * @param {string} fromPath The path to redirect from.
 * @param {string} toUrl The URL to redirect to.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.addRedirect = function(userId, fromPath, toUrl, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while retrieving redirects.  Please reload the page and try again.",
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

        fromPath = fromPath.toLowerCase();

        // Check if the From Path already exists.
        db.query(
            "SELECT COUNT(RedirectID) Redirects FROM tblRedirect WHERE FromPath = @fromPath",
            {fromPath: {type: db.VARCHAR(256), value: fromPath}},
            function(err, data) {
                if (err) {
                    console.log("Database error in admin.addRedirect while checking a from path.");
                    console.log(err);
                    callback({
                        error: "There was a database error while adding a redirect.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (data && data.recordsets && data.recordsets[0] && data.recordsets[0][0] && data.recordsets[0][0].Redirects > 0) {
                    callback({
                        error: "The from path for this redirect already exists.",
                        status: 400
                    });
                    return;
                }

                // Add the redirect.
                db.query(
                    "INSERT INTO tblRedirect (FromPath, ToURL, CrDate) VALUES (@fromPath, @toUrl, GETUTCDATE())",
                    {
                        fromPath: {type: db.VARCHAR(256), value: fromPath},
                        toUrl: {type: db.VARCHAR(1024), value: toUrl}
                    }, function(err) {
                        if (err) {
                            console.log("Database error in admin.addRedirect while adding the redirect.");
                            console.log(err);
                            callback({
                                error: "There was a database error while adding a redirect.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        callback();
                    }
                );
            }
        );
    });
};

/**
 * Removes a redirect.
 * @param {number} userId The user ID of the moderator.
 * @param {number} redirectId The redirect ID to remove.
 * @param {function()|function(object)} callback The callback function.
 */
module.exports.removeRedirect = function(userId, redirectId, callback) {
    "use strict";

    User.getUserRoles(userId, function(err, roles) {
        if (err) {
            callback({
                error: "There was a database error while removing a redirect.  Please reload the page and try again.",
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
            "DELETE FROM tblRedirectHit WHERE RedirectID = @redirectId;DELETE FROM tblRedirect WHERE RedirectID = @redirectId",
            {redirectId: {type: db.INT, value: redirectId}},
            function(err) {
                if (err) {
                    console.log("Database error in admin.removeRedirect.");
                    console.log(err);
                    callback({
                        error: "There was a database error while removing a redirect.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                callback();
            }
        );
    });
};
