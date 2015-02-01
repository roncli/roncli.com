var db = require("../database/database");

/**
 * Gets the page from the database.
 * @param {string} url The URL of the page to get.
 * @param {function} callback The callback function.
 */
module.exports.getPage = function(url, callback) {
    "use strict";

    db.query(
        "SELECT PageID, PageURL, ParentPageID, Title, ShortTitle, PageData FROM tblPage WHERE PageURL = @url",
        {url: {type: db.VARCHAR(1024), value: url}},
        function(err, data) {
            if (err) {
                console.log("Database error in page.getPage.");
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

            callback(null, {
                page: {
                    id: data[0][0].PageID,
                    title: data[0][0].Title,
                    shortTitle: data[0][0].ShortTitle,
                    content: data[0][0].PageData
                }
            });
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
