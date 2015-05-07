var youtube = require("../youtube/youtube"),
    cache = require("../cache/cache"),

    /**
     * Determines if a playlist is allowed to be displayed on the site.
     * @param {string} id The playlist ID.
     * @param {function} callback The callback function.
     */
    isAllowed = function(id, callback) {
        "use strict";

        cache.zrank("roncli.com:youtube:playlists", id, function(index) {
            callback(index === 0 || (index && index > 0));
        });
    };

/**
 * Gets the playlist from the cache.
 * @param {string} id The playlist ID to use.
 * @param {function} callback The callback function.
 */
module.exports.getPlaylist = function(id, callback) {
    "use strict";

    isAllowed(id, function(allowed) {
        if (!allowed) {
            callback({
                error: "Playlist not found.",
                status: 404
            });
            return;
        }

        /**
         * Retrieves a playlist from the cache.
         * @param {function} failureCallback The failure callback when there is no playlist.
         */
        var getPlaylist = function(failureCallback) {
            cache.zrevrange("roncli.com:youtube:playlist:" + id, 0, -1, function(videos) {
                var result = {};

                if (videos && videos.length > 0) {
                    result.videos = videos;
                    cache.get("roncli.com:youtube:playlist:" + id + ":info", function(info) {
                        if (info) {
                            result.info = info;
                            callback(null, result);
                            return;
                        }

                        failureCallback();
                    });
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
    });
};

/**
 * Gets the latest item in a playlist from the cache.
 * @param {string} id The playlist ID to use.
 * @param {function} callback The callback function.
 */
module.exports.getLatestPlaylist = function(id, callback) {
    "use strict";

    isAllowed(id, function(allowed) {
        if (!allowed) {
            callback({
                error: "Playlist not found.",
                status: 404
            });
            return;
        }

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
    });
};

/**
 * Gets video info from the cache.
 * @param {string} id The video ID to use.
 * @param {function} callback The callback function.
 */
module.exports.getVideoInfo = function(id, callback) {
    "use strict";

    var getVideoInfo = function(failureCallback) {
        cache.get("roncli.com:youtube:video:" + id, function(info) {
            if (info) {
                callback(null, {
                    channelTitle: info.snippet.channelTitle,
                    title: info.snippet.title
                });
                return;
            }

            failureCallback();
        });
    };

    getVideoInfo(function() {
        youtube.cacheVideoInfo(false, id, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getVideoInfo(function() {
                callback({
                    error: "Video does not exist.",
                    status: 400
                });
            });
        });
    });
};
