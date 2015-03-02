var github = require("../github/github"),
    cache = require("../cache/cache"),
    db = require("../database/database");

/**
 * Forces the site to cache the events, even if they are already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheEvents = function(callback) {
    "use strict";

    github.cacheEvents(true, callback);
};

/**
 * Gets the latest events.
 * @param {number} count The number of events to return.
 * @param {function} callback The callback function.
 */
module.exports.getLatestEvents = function(count, callback) {
    "use strict";

    /**
     * Retrieves events from the cache.
     * @param {function} failureCallback The failure callback when there are no events.
     */
    var getEvents = function(failureCallback) {
        cache.zrevrange("roncli.com:github:events", 0, count - 1, function(events) {
            if (events && events.length > 0) {
                callback(null, events);
                return;
            }

            failureCallback();
        });
    };

    getEvents(function() {
        github.cacheEvents(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getEvents(function() {
                callback({
                    error: "Events do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets the featured projects.
 * @param {number} count The number of projects to return.
 * @param {function} callback The callback function.
 */
module.exports.getFeaturedProjects = function(count, callback) {
    "use strict";

    cache.get("roncli.com:projects:featured", function(cachedProjects) {
        if (cachedProjects) {
            callback(null, cachedProjects.slice(0, count));
            return;
        }

        db.query(
            "SELECT p.ProjectID, p.Title, p.URL FROM tblProject p INNER JOIN tblProjectFeature pf ON p.ProjectID = pf.ProjectID ORDER BY pf.[Order]",
            {},
            function(err, data) {
                var projects;

                if (err) {
                    console.log("Database error in coding.getFeaturedProjects.");
                    console.log(err);
                    callback({
                        error: "There was a database error retrieving featured projects.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (!data || !data[0]) {
                    callback(null, []);
                }

                projects = data[0].map(function(project) {
                    return {
                        id: project.ProjectID,
                        title: project.Title,
                        url: project.URL
                    };
                });

                cache.set("roncli.com:projects:featured", projects, 3600);

                callback(null, projects.slice(0, count));
            }
        );
    });
};
