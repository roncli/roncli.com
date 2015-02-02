var db = require("../database/database"),
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

            if (!data || !data[0] || data[0].length === 0) {
                callback({
                    error: "The page does not exist.",
                    status: 404
                });
                return;
            }

            pageId = data[0][0].PageID;
            parentPageId = data[0][0].ParentPageID;

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

                            if (!data || !data[0] || data[0].length <= 1) {
                                deferred.resolve(null);
                                return;
                            }

                            deferred.resolve(data[0].map(function(page) {
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

                            if (!data || !data[0] || data[0].length === 0) {
                                deferred.resolve(null);
                                return;
                            }

                            deferred.resolve(data[0].map(function(page) {
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
                            title: data[0][0].Title,
                            shortTitle: data[0][0].ShortTitle,
                            content: data[0][0].PageData
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

                    if (!data || !data[0] || data[0].length === 0) {
                        callback(null, parents);
                        return;
                    }

                    parentPageId = data[0][0].ParentPageID;

                    parents.unshift({
                        id: data[0][0].PageID,
                        url: data[0][0].PageURL,
                        shortTitle: data[0][0].ShortTitle || data[0][0].Title
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
