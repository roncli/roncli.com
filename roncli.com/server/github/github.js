var config = require("./server/privateConfig").github,
    Github = require("github"),
    cache = require("../cache/cache.js"),

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
                    var meta, pushEvents, releaseEvents;

                    if (err) {
                        console.log("Bad response from GitHub.");
                        console.log(err);
                        callback({
                            error: "Bad response from GitHub.",
                            status: 502
                        });
                        return;
                    }

                    meta = events.meta;
                    delete events.meta;

                    totalEvents = [].concat.apply([], [totalEvents, events]);

                    if (client.hasNextPage(meta.link)) {
                        getEvents(meta.link);
                        return;
                    }

                    releaseEvents = totalEvents.filter(function(event) {
                        return event.type === "ReleaseEvent";
                    });

                    pushEvents = totalEvents.filter(function(event) {
                        return event.type === "PushEvent";
                    });

                    //TODO: Parse and store these events
                };

                if (link) {
                    client.getNextPage(link, processEvents);
                } else {
                    client.events.getFromUser({user: "roncli"}, processEvents);
                }
            };

        getEvents();
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

    cache.keys("roncli.com:github:events:release", function(keys) {
        if (keys && keys.length > 0) {
            callback();
            return;
        }

        cacheEvents(callback);
    });
};
