var github = require("../github/github"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,
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

                        if (data && data.recordsets && data.recordsets[0] && data.recordsets[0].length > 0) {
                            data.recordsets[0].forEach(function(project) {
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
        github.cacheEvents(true, function(err) {
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

            if (!data || !data.recordsets || !data.recordsets[0]) {
                callback(null, []);
            }

            callback(null, data.recordsets[0].map(function(project) {
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

            if (!data || !data.recordsets || !data.recordsets[0]) {
                callback(null, []);
            }

            callback(null, data.recordsets[0].map(function(project) {
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

/**
 * Gets a project.
 * @param {string} url The URL of the project.
 * @param {function} callback The callback function.
 */
module.exports.getProject = function(url, callback) {
    "use strict";

    db.query(
        "SELECT ProjectID, Title, ProjectURL, [User], Repository, Description FROM tblProject WHERE URL = @url",
        {url: {type: db.VARCHAR(1024), value: url}},
        function(err, data) {
            var project, githubDeferred;

            if (err) {
                console.log("Database error in coding.getProject.");
                console.log(err);
                callback({
                    error: "There was a database error retrieving a project.  Please reload the page and try again.",
                    status: 500
                });
                return;
            }

            if (!data || !data.recordsets || !data.recordsets[0] || data.recordsets[0].length === 0) {
                callback({
                    error: "Project does not exist.",
                    status: 404
                });
                return;
            }

            project = {
                id: data.recordsets[0][0].ProjectID,
                title: data.recordsets[0][0].Title,
                projectUrl: data.recordsets[0][0].ProjectURL,
                user: data.recordsets[0][0].User,
                repository: data.recordsets[0][0].Repository,
                description: data.recordsets[0][0].Description,
                url: url
            };

            githubDeferred = new Deferred();

            // If this is a GitHub project, get the releases and commits.
            if (project.user && project.repository && project.user.length > 0 && project.repository.length > 0) {
                github.cacheRepository(project.user, project.repository, false, function() {
                    all(
                        (function() {
                            var deferred = new Deferred();

                            cache.get("roncli.com:github:repository:" + project.user + ":" + project.repository, function(repository) {
                                project.project = repository;
                                deferred.resolve(true);
                            });

                            return deferred.promise;
                        }()),
                        (function() {
                            var deferred = new Deferred();

                            cache.zrevrange("roncli.com:github:repository:" + project.user + ":" + project.repository + ":releases", 0, -1, function(releases) {
                                project.releases = releases;
                                deferred.resolve(true);
                            });

                            return deferred.promise;
                        }()),
                        (function() {
                            var deferred = new Deferred();

                            cache.zrevrange("roncli.com:github:repository:" + project.user + ":" + project.repository + ":commits", 0, 100, function(commits) {
                                project.commits = commits.map(function(commit) {
                                    commit.shortSha = commit.sha.substring(0, 7);

                                    return commit;
                                });
                                deferred.resolve(true);
                            });

                            return deferred.promise;
                        }())
                    ).then(
                        function() {
                            githubDeferred.resolve();
                        }
                    );
                });
            } else {
                githubDeferred.resolve();
            }

            githubDeferred.promise.then(function() {
                callback(null, project);
            });
        }
    );
};
