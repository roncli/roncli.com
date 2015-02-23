var Moment = require("moment"),
    sanitizeHtml = require("sanitize-html"),
    soundcloud = require("../soundcloud/soundcloud"),
    cache = require("../cache/cache"),
    db = require("../database/database"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Gets song data for a URL from the cache.
     * @param {string} url The URL to get song data for.
     * @param {function} callback The success callback when the song is found.
     * @param {function} failureCallback The failure callback when there are no songs.
     */
    getSongFromUrl = function(url, callback, failureCallback) {
        "use strict";

        cache.hget("roncli.com:song:urls", url, function(song) {
            if (song) {
                callback(song);
                return;
            }

            failureCallback();
        });
    };



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
     * TODO: Handle when the song hasn't been cached.
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

/**
 * Gets comments for a song via the song URL.
 * @param {string} url The URL of the song.
 * @param {function} callback The callback function.
 */
module.exports.getCommentsByUrl = function(url, callback) {
    "use strict";

    /**
     * Gets the comments for a song.
     */
    var getComments = function() {
        db.query(
            "SELECT sc.CommentID, sc.Comment, sc.CrDate, u.Alias FROM tblSongComment sc INNER JOIN tblUser u ON sc.CrUserID = u.UserID WHERE sc.SongURL = @url AND sc.ModeratedDate IS NOT NULL ORDER BY sc.CrDate",
            {url: {type: db.VARCHAR(1024), value: url}},
            function(err, data) {
                var comments;
                if (err) {
                    console.log("Database error in music.getCommentsByUrl.");
                    console.log(err);
                    callback({
                        error: "There was a database error retrieving song comments.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (data[0]) {
                    comments = data[0].map(function(comment) {
                        return {
                            id: comment.CommentID,
                            published: comment.CrDate.getTime(),
                            content: comment.Comment,
                            author: comment.Alias,
                            songSource: "site"
                        };
                    });
                }

                callback(null, comments);
            }
        );
    };

    getSongFromUrl(url, getComments, function() {
        soundcloud.cacheTracks(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getSongFromUrl(url, getComments, function() {
                callback({
                    error: "Page not found.",
                    status: 404
                });
            });
        });
    });
};

/**
 * Posts a comment to a song page.
 * @param {int} userId The User ID posting the comment.
 * @param {string} url The URL of the page.
 * @param {string} content The content of the post.
 * @param {function} callback The callback function.
 */
module.exports.postComment = function(userId, url, content, callback) {
    "use strict";

    all(
        /**
         * Check to see if the user has posted a comment within the last 60 seconds to prevent spam.
         */
        (function() {
            var deferred = new Deferred();

            db.query(
                "SELECT MAX(CrDate) LastComment FROM tblSongComment WHERE CrUserID = @userId",
                {userId: {type: db.INT, value: userId}},
                function(err, data) {
                    if (err) {
                        console.log("Database error in music.postComment while checking the user's last comment time.");
                        console.log(err);
                        deferred.reject({
                            error: "There was a database error posting a song comment.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    if (data[0] && data[0][0] && data[0][0].LastComment > new Moment().add(-1, "minute")) {
                        deferred.reject({
                            error: "You must wait a minute after posting a comment to post a new comment.",
                            status: 400
                        });
                        return;
                    }

                    deferred.resolve(true);
                }
            );

            return deferred.promise;
        }()),

        /**
         * Ensure the URL the user is posting to exists.
         */
        (function() {
            var deferred = new Deferred(),
                resolve = function() {
                    deferred.resolve(true);
                };

            getSongFromUrl(url, resolve, function() {
                soundcloud.cacheTracks(false, function(err) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    getSongFromUrl(url, resolve, function() {
                        callback({
                            error: "Page not found.",
                            status: 404
                        });
                    });
                });
            });

            return deferred.promise;
        }())
    ).then(
        /**
         * Add the post to the database.
         */
        function() {
            var attributes = sanitizeHtml.defaults.allowedAttributes;
            attributes.p = ["style"];
            attributes.span = ["style"];

            content = sanitizeHtml(content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "u", "sup", "sub", "strike", "address", "span"]),
                allowedAttributes: attributes
            });

            db.query(
                "INSERT INTO tblSongComment (SongURL, Comment, CrDate, CrUserID) VALUES (@url, @content, GETUTCDATE(), @userId)",
                {
                    url: {type: db.VARCHAR(1024), value: url},
                    content: {type: db.TEXT, value: content},
                    userId: {type: db.INT, value: userId}
                },
                function(err) {
                    if (err) {
                        console.log("Database error in music.postComment while posting a comment.");
                        console.log(err);
                        callback({
                            error: "There was a database error posting a song comment.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    callback();
                }
            );
        },

        // If any of the functions error out, it will be handled here.
        function(err) {
            callback(err);
        }
    );
};
