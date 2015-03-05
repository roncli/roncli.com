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
                // Match github projects to local projects.
                db.query(
                    "SELECT URL, [User], Repository FROM tblProject WHERE [User] IS NOT NULL AND Repository IS NOT NULL",
                    {}, function(err, data) {
                        var projects = {};

                        if (err) {
                            console.log("Database error in coding.getLatestEvents.");
                            console.log(err);
                            callback({
                                error: "There was a database error retrieving latest events.  Please reload the page and try again.",
                                status: 500
                            });
                            return;
                        }

                        if (data && data[0] && data[0].length > 0) {
                            data[0].forEach(function(project) {
                                projects[project.User + "/" + project.Repository] = project.URL;
                            });

                            events.forEach(function(event) {
                                event.url = projects[event.repository];
                            });
                        }

                        callback(null, events);
                    }
                );
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
 * @param {function} callback The callback function.
 */
module.exports.getFeaturedProjectList = function(callback) {
    "use strict";

    db.query(
        "SELECT p.ProjectID, p.Title, p.URL FROM tblProject p INNER JOIN tblProjectFeature pf ON p.ProjectID = pf.ProjectID ORDER BY pf.[Order]",
        {},
        function(err, data) {
            if (err) {
                console.log("Database error in coding.getFeaturedProjectList.");
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

            callback(null, data[0].map(function(project) {
                return {
                    id: project.ProjectID,
                    title: project.Title,
                    url: project.URL
                };
            }));
        }
    );
};

/**
 * Gets the featured projects.
 * @param {number} count The number of projects to return.
 * @param {function} callback The callback function.
 */
module.exports.getFeaturedProjects = function(count, callback) {
    "use strict";

    var coding = this;

    cache.get("roncli.com:projects:featured", function(cachedProjects) {
        if (cachedProjects) {
            callback(null, cachedProjects.slice(0, count));
            return;
        }

        coding.getFeaturedProjectList(function(err, projects) {
            if (err) {
                callback(err);
                return;
            }

            cache.set("roncli.com:projects:featured", projects, 3600);

            callback(null, projects);
        });
    });
};

/**
 * Gets the projects.
 * @param {function} callback The callback function.
 */
module.exports.getProjectList = function(callback) {
    "use strict";

    db.query(
        "SELECT ProjectID, Title, URL, Description FROM tblProject ORDER BY Title",
        {},
        function(err, data) {
            if (err) {
                console.log("Database error in coding.getProjectList.");
                console.log(err);
                callback({
                    error: "There was a database error retrieving projects.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            if (!data || !data[0]) {
                callback(null, []);
            }

            callback(null, data[0].map(function(project) {
                return {
                    id: project.ProjectID,
                    title: project.Title,
                    url: project.URL,
                    description: project.Description
                };
            }));
        }
    );
};

/**
 * Gets the projects, retrieving from the cache first if they exist.
 * @param {function} callback The callback function.
 */
module.exports.getProjects = function(callback) {
    "use strict";

    var coding = this;

    cache.get("roncli.com:projects", function(cachedProjects) {
        if (cachedProjects) {
            callback(null, cachedProjects);
            return;
        }

        coding.getProjectList(function(err, projects) {
            if (err) {
                callback(err);
                return;
            }

            cache.set("roncli.com:projects", projects, 3600);

            callback(null, projects);
        });
    });
};
