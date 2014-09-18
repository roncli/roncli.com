var cache = require("../cache/cache.js"),
    blogger = require("../blogger/blogger.js"),
    tumblr = require("../tumblr/tumblr.js"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Cache the posts from blogger and tumblr.
     * @param {function} callback The callback function.
     */
    cachePosts = function(callback) {
        "use strict";

        var bloggerDeferred = new Deferred(),
            tumblrDeferred = new Deferred();

        blogger.cachePosts(false, function(err) {
            if (err) {
                bloggerDeferred.reject(err);
            } else {
                bloggerDeferred.resolve(true);
            }
        });

        tumblr.cachePosts(false, function(err) {
            if (err) {
                tumblrDeferred.reject(err);
            } else {
                tumblrDeferred.resolve(true);
            }
        });

        all(bloggerDeferred.promise, tumblrDeferred.promise).then(
            function() {
                cache.zunionstore("roncli.com:blog:posts", ["roncli.com:blogger:posts", "roncli.com:tumblr:posts"], 86400, function() {
                    callback();
                });
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                callback(err);
            }
        );
    };

/**
 * Gets the latest blog post.
 * @param {function} callback The callback function.
 */
module.exports.getLatestPost = function(callback) {
    "use strict";

    this.getPostByIndex(0, callback);
};

/**
 * Gets the blog post by index.
 * @param {number} index The index of the post.
 * @param {function} callback The callback function.
 */
module.exports.getPostByIndex = function(index, callback) {
    "use strict";

    var Blog = this,

        /**
         * Retrieves the post from the cache.
         * @param {function} failureCallback The callback function to perform if the post is not in the cache.
         */
        getPost = function(failureCallback) {
            cache.zrevrange("roncli.com:blog:posts", index, index, function(post) {
                if (post && post.length > 0) {
                    Blog.getPost(post[0], callback);
                    return;
                }

                failureCallback();
            });
        };

    getPost(function() {
        cachePosts(function(err) {
            if (err) {
                callback(err);
                return;
            }

            getPost(function() {
                callback({
                    error: "Blog posts do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets the post via the URL.
 * @param {string} url The URL of the post.
 * @param {function} callback The callback function.
 */
module.exports.getPostByUrl = function(url, callback) {
    "use strict";

    var Blog = this,

        /**
         * Retrieves the index of the post in the cache.
         * @param {object} post The post object.
         * @param {function} failureCallback The callback function to perform if the post is not in the cache.
         */
        getIndex = function(post, failureCallback) {
            cache.zrevrank("roncli.com:blog:posts", post, function(index) {
                if (index !== null) {
                    Blog.getPost(post, function(err, post) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        callback(null, {
                            post: post,
                            index: index
                        });
                    });
                    return;
                }

                failureCallback();
            });
        },

        /**
         * Retrieves the post from the cache.
         * @param {function} failureCallback The callback function to perform if the post is not in the cache.
         */
        getPost = function(failureCallback) {
            cache.hget("roncli.com:blog:urls", url, function(post) {
                if (post) {
                    getIndex(post, function() {
                        cachePosts(function(err) {
                            if (err) {
                                callback(err);
                                return;
                            }

                            getIndex(post, function() {
                                callback({
                                    error: "Page not found 1.",
                                    status: 404
                                });
                            });
                        });
                    });

                    return;
                }

                failureCallback();
            });
        };

    getPost(function() {
        cachePosts(function(err) {
            if (err) {
                callback(err);
                return;
            }

            getPost(function() {
                callback({
                    error: "Page not found 2.",
                    status: 404
                });
            });
        });
    });
};

/**
 * Gets a full post.
 * @param {object} post The post object to retrieve the full post for.
 * @param {function} callback The callback function.
 */
module.exports.getPost = function(post, callback) {
    "use strict";

    switch (post.type) {
        case "blogger":
            blogger.post(post.id, callback);
            break;
        case "tumblr":
            tumblr.post(post.id, callback);
            break;
    }
};
