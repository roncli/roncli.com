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

        // TODO: Loop through results past 50.
        youtube.playlistItems.list({
            part: "snippet",
            maxResults: 50,
            playlistId: playlistId,
            key: config.api_key
        }, function(err, data) {
            var videos;

            if (err) {
                console.log("Bad response from Google.");
                console.log(err);
                callback({
                    error: "Bad response from Google.",
                    status: 502
                });
                return;
            }

            videos = data.items.map(function(video) {
                var timestamp = new Date(video.snippet.publishedAt).getTime();

                return {
                    score: timestamp,
                    value: {
                        id: video.snippet.resourceId.videoId,
                        title: video.snippet.title
                    }
                };
            });

            cache.zadd("roncli.com:youtube:playlist:" + playlistId, videos, 86400, function() {
                callback();
            });
        });
    };

/**
 * Ensures that the posts are cached.
 * @param {boolean} force Forces the caching of posts.
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
            callback();
            return;
        }

        cachePlaylist(playlistId, callback);
    });
};
