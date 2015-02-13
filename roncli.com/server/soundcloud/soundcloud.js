var config = require("../privateConfig").soundcloud,
    soundcloud = require("node-soundcloud"),
    cache = require("../cache/cache.js"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,
    seq = promise.seq,

    /**
     * Caches the tracks from SoundCloud.
     * @param {function} callback The callback function.
     */
    cacheTracks = function(callback) {
        "use strict";

        var limit = 50,
            totalTracks = [],

            /**
             * Gets the tracks from SoundCloud.
             * @param {number} offset The offset to start at.
             */
            getTracks = function(offset) {
                soundcloud.get("/users/7641/tracks?linked_partitioning=1&limit=" + limit + (offset > 0 ? "&offset=" + offset : ""), function(err, data) {
                    var tracks, tags, tagTracks, promises, fxs;

                    if (err) {
                        console.log("Bad response from Soundcloud.");
                        console.log(err);
                        callback({
                            error: "Bad response from SoundCloud.",
                            status: 502
                        });
                        return;
                    }

                    if (data && data.collection && data.collection.length > 0) {
                        totalTracks = [].concat.apply([], [totalTracks, data.collection.map]);
                    }

                    if (data && data.next_href) {
                        // There are more tracks, retrieve them.
                        getTracks(offset + limit);
                    } else {
                        // There are no more tracks, cache what was received.
                        totalTracks.forEach(function(track) {
                            track.published = (track.release_year ?
                                new Date(track.release_year, track.release_month ? track.release_month - 1 : 0, track.release_day || 1) :
                                new Date(track.created_at)).getTime();
                        });

                        tracks = totalTracks.map(function(track) {
                            return {
                                score: track.published,
                                value: {
                                    trackSource: "soundcloud",
                                    id: track.id,
                                    tags: [].concat.apply([], [[track.genre], track.replace(/"[^"]+"|( )/g, function(m, group1) {return group1 ? "||" : m;}).replace(/"/g, "").split("||")]),
                                    published: track.published,
                                    title: track.title,
                                    url: "/soundcloud/" + track.id + "/" + track.permalink
                                }
                            };
                        });

                        tags = {};
                        tagTracks = {};
                        tracks.forEach(function(track) {
                            if (track.value.tags) {
                                track.value.tags.forEach(function(tag) {
                                    tags[tag] = 0;

                                    if (!tagTracks.hasOwnProperty(tag)) {
                                        tagTracks[tag] = [];
                                    }
                                    tagTracks[tag].push(track);
                                });
                            }
                        });

                        promises = [
                            (function() {
                                var deferred = new Deferred();

                                cache.zadd("roncli.com:soundcloud:tracks", tracks, 86400, function() {
                                    deferred.resolve(true);
                                });

                                return deferred.promise;
                            }()),
                            (function() {
                                var deferred = new Deferred();

                                cache.hmset("roncli.com:song:urls", tracks.map(function(track) {
                                    return {
                                        key: track.value.url,
                                        value: track.value
                                    };
                                }), 0, function() {
                                    deferred.resolve(true);
                                });

                                return deferred.promise;
                            }()),
                            (function() {
                                var deferred = new Deferred();

                                cache.zadd("roncli.com:soundcloud:tags", Object.keys(tags).map(function(tag) {
                                    return {
                                        score: -tagTracks[tag].length,
                                        value: tag
                                    };
                                }), 86400, function() {
                                    deferred.resolve(true);
                                });

                                return deferred.promise;
                            }())
                        ];

                        Object.keys(tags).forEach(function(tag) {
                            promises.push(
                                (function() {
                                    var deferred = new Deferred();

                                    cache.zadd("roncli.com:soundcloud:tag:" + tag, tagTracks[tag], 86400, function() {
                                        deferred.resolve(true);
                                    });

                                    return deferred.promise;
                                }())
                            );
                        });

                        all(promises).then(function() {
                            callback();
                        });

                        fxs = [];
                        totalTracks.forEach(function(track) {
                            fxs.push(function() {
                                var deferred = new Deferred();

                                cache.set("roncli.com:soundcloud:track:" + track.id, track, 86400, function() {
                                    deferred.resolve(true);
                                });

                                return deferred.promise;
                            });
                        });

                        seq(fxs);
                    }
                });
            };
    };

// Initialize soundcloud.
soundcloud.init(config);

/**
 * Forces the site to cache the tracks, even if they are already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheTracks = function(callback) {
    "use strict";

    cacheTracks(callback);
};
