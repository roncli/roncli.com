var config = require("../privateConfig").github,
    Github = require("@octokit/rest"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    client = new Github({
        version: "3.0.0",
        headers: {
            "user-agent": "roncli.com API"
        }
    }),

    /**
     * Caches the events from GitHub.
     * @param {function} callback The callback function.
     */
    cacheEvents = function(callback) {
        "use strict";

        var totalEvents = [],

            /**
             * Gets the events from GitHub.
             * @param {object} [link] The link object to determine the page to retrieve.  If not passed, gets the first page.
             */
            getEvents = function(link) {
                var processEvents = function(err, events) {
                    var releaseEvents, pushEvents, allEvents;

                    if (err) {
                        console.log("Bad response from GitHub while getting events.");
                        console.log(err);
                        callback({
                            error: "Bad response from GitHub.",
                            status: 502
                        });
                        return;
                    }

                    totalEvents = [].concat.apply([], [totalEvents, events.data]);

                    if (client.hasNextPage(events)) {
                        getEvents(events);
                        return;
                    }

                    releaseEvents = totalEvents.filter(function(event) {
                        return event.type === "ReleaseEvent" && event.payload.action === "published" && !event.payload.release.draft;
                    });

                    pushEvents = totalEvents.filter(function(event) {
                        return event.type === "PushEvent" && event.payload.commits.length > 0;
                    });


                    allEvents = [].concat.apply([], [
                        releaseEvents.map(function(event) {
                            var date = new Date(event.created_at).getTime();

                            return {
                                score: date,
                                value: {
                                    projectSource: "github",
                                    type: "release",
                                    id: event.payload.release.id,
                                    published: date,
                                    repository: event.repo.name,
                                    release: event.payload.release.name,
                                    message: event.payload.release.body
                                }
                            };
                        }),
                        pushEvents.map(function(event) {
                            var date = new Date(event.created_at).getTime();

                            return {
                                score: date,
                                value: {
                                    projectSource: "github",
                                    type: "push",
                                    id: event.payload.push_id,
                                    published: date,
                                    repository: event.repo.name,
                                    size: event.payload.size,
                                    message: event.payload.commits[0].message
                                }
                            };
                        })
                    ]);

                    cache.zadd("roncli.com:github:events", allEvents, 3600, function() {
                        callback();
                    });
                };

                if (link) {
                    client.getNextPage(link, processEvents);
                } else {
                    client.activity.getEventsForUser({username: "roncli", per_page: 100}, processEvents);
                }
            };

        getEvents();
    },

    /**
     * Caches the events from GitHub.
     * @param {string} user The user of the repository to retrieve.
     * @param {string} repository The repository to retrieve.
     * @param {function} callback The callback function.
     */
    cacheRepository = function(user, repository, callback) {
        "use strict";

        var repositoryDeferred = new Deferred(),
            commitsDeferred = new Deferred(),
            releasesDeferred = new Deferred();

        client.repos.get({owner: user, repo: repository}, function(err, repo) {
            if (err) {
                console.log("Bad response from GitHub while getting a repository.");
                console.log(err);
                repositoryDeferred.reject({
                    error: "Bad response from GitHub.",
                    status: 502
                });
                return;
            }

            repositoryDeferred.resolve({
                user: repo.data.owner.login,
                repository: repo.data.name,
                url: repo.data.html_url,
                description: repo.data.description,
                created: new Date(repo.data.created_at).getTime(),
                updated: new Date(repo.data.updated_at).getTime(),
                gitUrl: repo.data.git_url,
                language: repo.data.language
            });
        });

        client.repos.getCommits({owner: user, repo: repository, per_page: 100}, function(err, commits) {
            if (err) {
                console.log("Bad response from GitHub while getting commits for a repository.");
                console.log(err);
                commitsDeferred.reject({
                    error: "Bad response from GitHub.",
                    status: 502
                });
                return;
            }

            commitsDeferred.resolve(commits.data.map(function(commit) {
                var date = new Date(commit.commit.author.date).getTime();
                return {
                    score: date,
                    value: {
                        sha: commit.sha,
                        author: commit.author.login,
                        created: date,
                        message: commit.commit.message,
                        url: commit.html_url
                    }
                };
            }));
        });

        client.repos.getReleases({owner: user, repo: repository, per_page: 100}, function(err, releases) {
            if (err) {
                console.log("Bad response from GitHub while getting releases for a repository.");
                console.log(err);
                releasesDeferred.reject({
                    error: "Bad response from GitHub.",
                    status: 502
                });
                return;
            }

            releasesDeferred.resolve(releases.data.filter(function(release) {
                return !release.draft;
            }).map(function(release) {
                var date = new Date(release.created_at).getTime();

                return {
                    score: date,
                    value: {
                        id: release.id,
                        name: release.name,
                        url: release.html_url,
                        created: date,
                        body: release.body
                    }
                };
            }));
        });

        all([repositoryDeferred.promise, commitsDeferred.promise, releasesDeferred.promise]).then(
            function(results) {
                var repo = results[0],
                    commits = results[1],
                    releases = results[2],
                    cacheRepositoryDeferred = new Deferred(),
                    cacheCommitsDeferred = new Deferred(),
                    cacheReleasesDeferred = new Deferred();

                cache.set("roncli.com:github:repository:" + user + ":" + repository, repo, 3600, function() {
                    cacheRepositoryDeferred.resolve(true);
                });

                if (commits.length > 0) {
                    cache.zadd("roncli.com:github:repository:" + user + ":" + repository + ":commits", commits, 3600, function() {
                        cacheCommitsDeferred.resolve(true);
                    });
                }

                if (releases.length > 0) {
                    cache.zadd("roncli.com:github:repository:" + user + ":" + repository + ":releases", releases, 3600, function() {
                        cacheReleasesDeferred.resolve(true);
                    });
                }

                all(cacheRepositoryDeferred.promise, cacheCommitsDeferred.promise, cacheReleasesDeferred.promise).then(
                    function() {
                        callback();
                    }
                );
            },

            function(err) {
                callback(err);
            }
        );
    };

client.authenticate(config);

/**
 * Ensures that the events are cached.
 * @param {boolean} force Forces the caching of events.
 * @param {function} callback The callback function.
 */
module.exports.cacheEvents = function(force, callback) {
    "use strict";

    if (force) {
        cacheEvents(callback);
        return;
    }

    cache.keys("roncli.com:github:events", function(keys) {
        if (keys && keys.length > 0) {
            callback();
            return;
        }

        cacheEvents(callback);
    });
};

/**
 * Ensures that a repository is cached.
 * @param {string} user The user of the repository to cache.
 * @param {string} repository The repository to cache.
 * @param {boolean} force Forces the caching of the repository.
 * @param {function} callback The callback function.
 */
module.exports.cacheRepository = function(user, repository, force, callback) {
    "use strict";

    if (force) {
        cacheRepository(user, repository, callback);
        return;
    }

    cache.keys("roncli.com:github:repository:" + user + ":" + repository, function(keys) {
        if (keys && keys.length > 0) {
            callback();
            return;
        }

        cacheRepository(user, repository, callback);
    });
};
