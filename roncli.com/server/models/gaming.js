var wow = require("../battlenet/wow");

/**
 * Forces the site to cache the character, even if they are already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheCharacter = function(callback) {
    "use strict";

    wow.cacheCharacter(true, callback);
};
