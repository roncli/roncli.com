var soundcloud = require("../soundcloud/soundcloud");

/**
 * Forces the site to cache the songs, even if they are already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheSongs = function(callback) {
    "use strict";

    soundcloud.forceCacheTracks(callback);
};
