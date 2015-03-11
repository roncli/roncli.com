var wow = require("../battlenet/wow"),
    d3 = require("../battlenet/d3"),
    lol = require("../riot/lol");

/**
 * Forces the site to cache the character, even if it is already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheCharacter = function(callback) {
    "use strict";

    wow.cacheCharacter(true, callback);
};

/**
 * Forces the site to cache the profile, even if it is already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheProfile = function(callback) {
    "use strict";

    d3.cacheProfile(true, callback);
};

/**
 * Forces the site to cache the ranked data, even if it is already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheRanked = function(callback) {
    "use strict";

    lol.cacheRanked(true, callback);
};
