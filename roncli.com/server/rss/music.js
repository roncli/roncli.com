var cache = require("../cache/cache"),
    Rss = require("rss"),
    music = require("../models/music"),
    moment = require("moment"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all;

/**
 * Get the RSS feed for the music section.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.rss = function(req, res, callback) {
    "use strict";

    var startIndex = +req.query["start-index"] || 1,
        tag = req.query.tag,
        cacheKey = "roncli.com:rss:music:" + (tag ? ":" + tag : "") + startIndex,
        feed = new Rss();

    cache.get(cacheKey, function(xml) {
        if (xml) {
            callback(xml);
            return;
        }

        feed.title = "The Home of The Nightstalker";
        feed.description = "The music of roncli, The Nightstalker";
        feed.generator = "roncli.com";
        feed.feed_url = "https://roncli.com/music.rss";
        feed.site_url = "https://roncli.com/music";
        feed.image_url = "https://roncli.com/images/roncliSmall.png";
        feed.managingEditor = "roncli@roncli.com (Ronald M. Clifford)";
        feed.webMaster = "roncli@roncli.com (Ronald M. Clifford)";
        feed.copyright = (new Date()).getFullYear().toString() + " Ronald M. Clifford";
        feed.language = "en-us";
        feed.ttl = 60;
        feed.custom_namespaces.openSearch = "http://a9.com/-/spec/opensearchrss/1.0/";
        feed.custom_elements.push({"openSearch:startIndex": startIndex.toString()});
        feed.custom_elements.push({"openSearch:itemsPerPage": "25"});

        // Get the list of music categories.  This will ensure that all the songs are there.
        music.getTags(function(err, tags) {
            var key;

            if (err) {
                res.status(err.status);
                callback({error: err.error});
                return;
            }

            feed.categories = [];
            tags.forEach(function(tag) {
                feed.categories.push(tag.tag);
            });

            if (tag) {
                key = "roncli.com:soundcloud:tag:" + tag;
            } else {
                key = "roncli.com:soundcloud:tracks";
            }

            all(
                (function() {
                    var deferred = new Deferred();

                    cache.zcard(key, function(count) {
                        var base = "https://roncli.com/music.rss",
                            query = "?",
                            lastStart = Math.floor((count - 1) / 25) * 25 + 1;

                        if (tag) {
                            base = base + "?tag=" + tag;
                            query = "&";
                        }
                        feed.custom_elements.push({"openSearch:totalResults": count});
                        if (startIndex !== 1) {
                            feed.custom_elements.push({"link": {_attr: {rel: "first", href: base}}});
                        }
                        if (startIndex !== lastStart) {
                            feed.custom_elements.push({"link": {_attr: {rel: "last", href: base + query + "start-index=" + lastStart}}});
                        }
                        if (startIndex >= 26) {
                            feed.custom_elements.push({"link": {_attr: {rel: "previous", href: base + query + "start-index=" + (startIndex - 25)}}});
                        }
                        if (startIndex <= lastStart - 25) {
                            feed.custom_elements.push({"link": {_attr: {rel: "next", href: base + query + "start-index=" + (startIndex + 25)}}});
                        }

                        deferred.resolve();
                    });

                    return deferred.promise;
                }()),
                (function () {
                    var deferred = new Deferred();

                    cache.zrevrange(key, startIndex - 1, startIndex + 23, function(songs) {
                        var promises = [];

                        songs.forEach(function(song) {
                            promises.push((function() {
                                var songDeferred = new Deferred();

                                music.getSongByUrl(song.url, function(err, songData) {
                                    if (err) {
                                        songDeferred.reject(err);
                                        return;
                                    }

                                    songDeferred.resolve(songData);
                                });

                                return songDeferred.promise;
                            }()));
                        });

                        all(promises).then(
                            function(songs) {
                                songs.forEach(function(song) {
                                    var content;

                                    switch (song.trackSource) {
                                        case "soundcloud":
                                            content = song.description;
                                            break;
                                    }

                                    feed.item({
                                        guid: "roncli.com:song:" + song.trackSource + ":" + song.id.toString(),
                                        date: new Date(song.published),
                                        categories: [].concat.apply([], [[song.genre], song.tag_list.length === 0 ? [] : song.tag_list.replace(/"[^"]+"|( )/g, function(match, group) {return group ? "||" : match;}).replace(/"/g, "").split("||")]),
                                        title: song.title,
                                        description: content,
                                        url: "https://roncli.com" + song.songUrl,
                                        author: "roncli@roncli.com (roncli)",
                                        custom_elements: [
                                            {"atom:updated": moment(new Date(song.published)).format()}
                                        ]
                                    });
                                });

                                deferred.resolve();
                            },

                            // If any of the functions error out, it will be handled here.
                            function(err) {
                                deferred.reject(err);
                            }
                        );
                    });

                    return deferred.promise;
                }())
            ).then(
                function() {
                    xml = feed.xml();

                    cache.set(cacheKey, xml, 900);

                    callback(xml);
                },

                // If any of the functions error out, it will be handled here.
                function(err) {
                    res.status(err.status);
                    callback({error: err.error});
                }
            );
        });
    });
};
