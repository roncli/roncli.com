var github = require("../github/github"),
    cache = require("../cache/cache.js");

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
