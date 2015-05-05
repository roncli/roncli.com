var youtube = require("../youtube/youtube"),
    cache = require("../cache/cache");

/**
 * Gets the playlist from the cache.
 * @param {string} id The playlist ID to use.
 * @param {function} callback The callback function.
 */
module.exports.getPlaylist = function(id, callback) {
    "use strict";

    /**
     * Retrieves a playlist from the cache.
     * @param {function} failureCallback The failure callback when there is no playlist.
     */
    var getPlaylist = function(failureCallback) {
        cache.zrevrange("roncli.com:youtube:playlist:" + id, 0, -1, function(videos) {
            if (videos && videos.length > 0) {
                callback(null, videos);
                return;
            }

            failureCallback();
        });
    };

    getPlaylist(function() {
        youtube.cachePlaylist(false, id, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getPlaylist(function() {
                callback({
                    error: "Playlist does not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets the latest item in a playlist from the cache.
 * @param {string} id The playlist ID to use.
 * @param {function} callback The callback function.
 */
module.exports.getLatestPlaylist = function(id, callback) {
    "use strict";

    /**
     * Retrieves the latest video from the cache.
     * @param {function} failureCallback The failure callback when there is no playlist.
     */
    var getVideo = function(failureCallback) {
        cache.zrevrange("roncli.com:youtube:playlist:" + id, 0, 0, function(videos) {
            if (videos && videos.length > 0) {
                callback(null, videos[0]);
                return;
            }

            failureCallback();
        });
    };

    getVideo(function() {
        youtube.cachePlaylist(false, id, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getVideo(function() {
                callback({
                    error: "Playlist does not exist.",
                    status: 400
                });
            });
        });
    });
};
