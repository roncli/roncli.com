var soundcloud = require("../soundcloud/soundcloud"),
    cache = require("../cache/cache");

/**
 * Forces the site to cache the songs, even if they are already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheSongs = function(callback) {
    "use strict";

    soundcloud.cacheTracks(true, callback);
};

/**
 * Returns the latest songs.
 * @param {number} count The number of songs to return.
 * @param {function} callback The callback function.
 */
module.exports.getLatestSongs = function(count, callback) {
    "use strict";

    /**
     * Retrieves songs from
     * @param failureCallback
     */
    var getSongs = function(failureCallback) {
        cache.zrevrange("roncli.com:soundcloud:tracks", 0, count - 1, function(songs) {
            if (songs && songs.length > 0) {
                callback(null, songs);
                return;
            }

            failureCallback();
        });
    };

    getSongs(function() {
        soundcloud.cacheTracks(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getSongs(function() {
                callback({
                    error: "Songs do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Returns the latest songs for a tag.
 * @param {string} tag The tag to return songs for.
 * @param {number} count The number of songs to return.
 * @param {function} callback The callback function.
 */
module.exports.getLatestSongsByTag = function(tag, count, callback) {
    "use strict";

    /**
     * Retrieves songs from
     * @param failureCallback
     */
    var getSongs = function(failureCallback) {
        cache.zrevrange("roncli.com:soundcloud:tag:" + tag, 0, count - 1, function(songs) {
            if (songs && songs.length > 0) {
                callback(null, songs);
                return;
            }

            failureCallback();
        });
    };

    getSongs(function() {
        soundcloud.cacheTracks(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getSongs(function() {
                callback({
                    error: "Songs for this tag do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets all of the available song tags.
 * @param {function} callback The callback function.
 */
module.exports.getTags = function(callback) {
    "use strict";

    /**
     * Retrieves tags from the cache.
     * @param {function} failureCallback The callback function to perform if the categories are not in the cache.
     */
    var getCategories = function(failureCallback) {
        cache.zrange("roncli.com:soundcloud:tags", 0, -1, function(tags) {
            if (tags && tags.length > 0) {
                callback(null, tags.map(function(tag, index) {
                    return {id: index, tag: tag};
                }));
                return;
            }

            failureCallback();
        });
    };

    getCategories(function() {
        soundcloud.cacheTracks(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getCategories(function() {
                callback({
                    error: "Song tags do not exist.",
                    status: 400
                });
            });
        });
    });
};


/**
 * Returns the songs for a tag.
 * @param {string} tag The tag to return songs for.
 * @param {function} callback The callback function.
 */
module.exports.getSongsByTag = function(tag, callback) {
    "use strict";

    /**
     * Retrieves songs from
     * @param failureCallback
     */
    var getSongs = function(failureCallback) {
        cache.zrevrange("roncli.com:soundcloud:tag:" + tag, 0, -1, function(songs) {
            if (songs && songs.length > 0) {
                callback(null, songs);
                return;
            }

            failureCallback();
        });
    };

    getSongs(function() {
        soundcloud.cacheTracks(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getSongs(function() {
                callback({
                    error: "Songs for this tag do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Retrieves a song via URL.
 * @param {string} url The URL of the song.
 * @param {function} callback The callback function.
 */
module.exports.getSongByUrl = function(url, callback) {
    "use strict";

    /**
     * Retrieves song data.
     * TODO: Handle when the post hasn't been cached.
     * @param {object} song The song object.
     */
    var getSong = function(song) {
            cache.get("roncli.com:" + song.trackSource + ":track:" + song.id, function(track) {
                if (track) {
                    callback(null, track);
                    return;
                }

                callback({
                    error: "Page not found.",
                    status: 404
                });
            });
        },

        /**
         * Gets song data for a URL from the cache.
         * @param {string} url The URL to get song data for.
         * @param {function} callback The success callback when the song is found.
         * @param {function} failureCallback The failure callback when there are no songs.
         */
        getSongFromUrl = function(url, callback, failureCallback) {
            cache.hget("roncli.com:song:urls", url, function(song) {
                if (song) {
                    callback(song);
                    return;
                }

                failureCallback();
            });
        };

    getSongFromUrl(url, getSong, function() {
        soundcloud.cacheTracks(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getSongFromUrl(url, getSong, function() {
                callback({
                    error: "Page not found.",
                    status: 404
                });
            });
        });
    });
};
