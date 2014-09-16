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

    var Blog = this,

        /**
         * Retrieves the post from the cache.
         * @param {function} failureCallback The callback function to perform if the post is not in the cache.
         */
        getPost = function(failureCallback) {
            cache.zrevrange("roncli.com:blog:posts", 0, 0, function(post) {
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
