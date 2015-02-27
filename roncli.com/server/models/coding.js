var github = require("../github/github");

/**
 * Forces the site to cache the events, even if they are already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheEvents = function(callback) {
    "use strict";

    github.cacheEvents(true, callback);
};
