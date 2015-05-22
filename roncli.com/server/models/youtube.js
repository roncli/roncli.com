var Moment = require("moment"),
    sanitizeHtml = require("sanitize-html"),
    youtube = require("../youtube/youtube"),
    cache = require("../cache/cache"),
    db = require("../database/database"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Determines if a playlist is allowed to be displayed on the site.
     * @param {string} id The playlist ID.
     * @param {function} callback The callback function.
     */
    isAllowed = function(id, callback) {
        "use strict";

        db.query(
            "SELECT COUNT(PlaylistID) Playlists FROM tblAllowedPlaylist WHERE PlaylistID = @playlistId",
            {playlistId: {type: db.VARCHAR(64), value: id}},
            function(err, data) {
                if (err) {
                    console.log("Database error in youtube.isAllowed");
                    console.log(err);
                    callback({
                        error: "There was a database error while checking for an allowed playlist.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                callback(!(!data || !data[0] || !data[0][0] || data[0][0].Playlists === 0));
            }
        );
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
                var result = {id: id};

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
                    id: id,
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

/**
 * Gets comments for a playlist via the playlist ID.
 * @param {string} id The playlist ID.
 * @param {function} callback The callback function.
 */
module.exports.getCommentsById = function(id, callback) {
    "use strict";

    isAllowed(id, function(allowed) {
        if (!allowed) {
            callback({
                error: "Playlist not found.",
                status: 404
            });
            return;
        }

        db.query(
            "SELECT pc.CommentID, pc.Comment, pc.CrDate, u.Alias FROM tblPlaylistComment pc INNER JOIN tblUser u ON pc.CrUserID = u.UserID WHERE pc.PlaylistID = @playlistId AND pc.ModeratedDate IS NOT NULL ORDER BY pc.CrDate",
            {playlistId: {type: db.VARCHAR(1024), value: id}},
            function(err, data) {
                var comments;

                if (err) {
                    console.log("Database error in youtube.getCommentsById.");
                    console.log(err);
                    callback({
                        error: "There was a database error retrieving playlist comments.  Please reload the page and try again.",
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
                            playlistSource: "site"
                        };
                    });
                }

                callback(null, comments);
            }
        );
    });
};

/**
 * Posts a comment to a playlist page.
 * @param {int} userId The User ID posting the comment.
 * @param {string} id The playlist ID.
 * @param {string} content The content of the post.
 * @param {function} callback The callback function.
 */
module.exports.postComment = function(userId, id, content, callback) {
    "use strict";

    all(
        /**
         * Check to see if the user has posted a comment within the last 60 seconds to prevent spam.
         */
        (function() {
            var deferred = new Deferred();

            db.query(
                "SELECT MAX(CrDate) LastComment FROM tblPlaylistComment WHERE CrUserID = @userId",
                {userId: {type: db.INT, value: userId}},
                function(err, data) {
                    if (err) {
                        console.log("Database error in youtube.postComment while checking the user's last comment time.");
                        console.log(err);
                        deferred.reject({
                            error: "There was a database error posting a playlist comment.  Please reload the page and try again.",
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
         * Ensure the playlist ID the user is posting to exists.
         */
        (function() {
            var deferred = new Deferred();

            isAllowed(id, function(allowed) {
                if (!allowed) {
                    deferred.reject({
                        error: "Playlist not found.",
                        status: 404
                    });
                    return;
                }

                deferred.resolve(true);
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
                "INSERT INTO tblPlaylistComment (PlaylistID, Comment, CrDate, CrUserID) VALUES (@playlistId, @content, GETUTCDATE(), @userId)",
                {
                    playlistId: {type: db.VARCHAR(1024), value: id},
                    content: {type: db.TEXT, value: content},
                    userId: {type: db.INT, value: userId}
                },
                function(err) {
                    if (err) {
                        console.log("Database error in youtube.postComment while posting a comment.");
                        console.log(err);
                        callback({
                            error: "There was a database error posting a playlist comment.  Please reload the page and try again.",
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
