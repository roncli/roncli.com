var config = require("../privateConfig").google,
    google = require("googleapis"),
    youtube = google.youtube("v3"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Caches a playlist from YouTube.
     * @param {string} playlistId The playlist ID to cache.
     * @param {function} callback The callback function.
     */
    cachePlaylist = function(playlistId, callback) {
        "use strict";

        var totalVideos = [],
            playlistDeferred = new Deferred(),
            infoDeferred = new Deferred(),

            /**
             * Gets the playlist for a specific page.
             * @param {string} [pageToken] The page token to retrieve.
             */
            getPlaylist = function(pageToken) {
                var options = {
                    part: "snippet",
                    maxResults: 50,
                    playlistId: playlistId,
                    key: config.api_key
                };

                if (pageToken) {
                    options.pageToken = pageToken;
                }

                youtube.playlistItems.list(options, function(err, data) {
                    var videos;

                    if (err) {
                        console.log("Bad response from Google.");
                        console.log(err);
                        playlistDeferred.reject({
                            error: "Bad response from Google.",
                            status: 502
                        });
                        return;
                    }

                    totalVideos = [].concat.apply([], [totalVideos, data.items]);

                    if (data.nextPageToken) {
                        getPlaylist(data.nextPageToken);
                    } else {
                        videos = totalVideos.map(function(video) {
                            var timestamp = new Date(video.snippet.publishedAt).getTime();

                            return {
                                score: timestamp,
                                value: {
                                    id: video.snippet.resourceId.videoId,
                                    title: video.snippet.title,
                                    publishedAt: new Date(video.snippet.publishedAt).getTime(),
                                    description: video.snippet.description
                                }
                            };
                        });

                        cache.zadd("roncli.com:youtube:playlist:" + playlistId, videos, 86400, function() {
                            playlistDeferred.resolve(true);
                        });
                    }
                });
            };

        getPlaylist();

        youtube.playlists.list({
            part: "snippet",
            id: playlistId,
            key: config.api_key
        }, function(err, data) {
            if (err) {
                console.log("Bad response from Google.");
                console.log(err);
                infoDeferred.reject({
                    error: "Bad response from Google.",
                    status: 502
                });
                return;
            }

            if (!data || !data.items || !data.items[0]) {
                infoDeferred.reject({
                    error: "Invalid playlist ID.",
                    status: 400
                });
                return;
            }

            cache.set("roncli.com:youtube:playlist:" + playlistId + ":info", data.items[0], 86400, function() {
                infoDeferred.resolve(true);
            });
        });

        all([playlistDeferred.promise, infoDeferred.promise]).then(
            function() {
                callback();
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                callback(err);
            }
        );
    },

    /**
     * Caches video info from YouTube.
     * @param {string} videoId The video ID to cache.
     * @param {function} callback The callback function.
     */
    cacheVideoInfo = function(videoId, callback) {
        "use strict";

        youtube.videos.list({
            part: "snippet",
            id: videoId,
            key: config.api_key
        }, function(err, data) {
            if (err) {
                console.log("Bad response from Google.");
                console.log(err);
                callback({
                    error: "Bad response from Google.",
                    status: 502
                });
                return;
            }

            if (!data || !data.items || !data.items[0]) {
                callback({
                    error: "Invalid video ID.",
                    status: 400
                });
                return;
            }

            cache.set("roncli.com:youtube:video:" + videoId, data.items[0], 86400, function() {
                callback();
            });
        });
    };

/**
 * Ensures that a playlist are cached.
 * @param {boolean} force Forces the caching of the playlist.
 * @param {string} playlistId The playlist ID to cache.
 * @param {function} callback The callback function.
 */
module.exports.cachePlaylist = function(force, playlistId, callback) {
    "use strict";

    if (force) {
        cachePlaylist(playlistId, callback);
        return;
    }

    cache.keys("roncli.com:youtube:playlist:" + playlistId, function(keys) {
        if (keys && keys.length > 0) {
            cache.keys("roncli.com:youtube:playlist:" + playlistId + ":info", function(keys) {
                if (keys && keys.length > 0) {
                    callback();
                    return;
                }

                cachePlaylist(playlistId, callback);
            });
        }

        cachePlaylist(playlistId, callback);
    });
};

/**
 * Ensures that a video is cached.
 * @param {boolean} force Forces the caching of the video.
 * @param {string} videoId The video ID to cache.
 * @param {function} callback The callback function.
 */
module.exports.cacheVideoInfo = function(force, videoId, callback) {
    "use strict";

    if (force) {
        cacheVideoInfo(videoId, callback);
        return;
    }

    cache.keys("roncli.com:youtube:video:" + videoId, function(keys) {
        if (keys && keys.length > 0) {
            callback();
            return;
        }

        cacheVideoInfo(videoId, callback);
    });
};
