var config = require("../privateConfig").tumblr,
    tumblr = require("tumblr"),
    blog = new tumblr.Blog("roncli.tumblr.com", config),
    cache = require("../cache/cache.js"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,
    seq = promise.seq,

    /**
     * Caches the posts from Tumblr.
     * @param {function} callback The callback function.
     */
    cachePosts = function(callback) {
        "use strict";

        var limit = 20,
            totalPosts = [],

            /**
             * Gets 20 posts from Tumblr.
             * @param {number} offset The post number to start retrieving posts from.
             */
            getPosts = function(offset) {
                blog.posts({offset: offset}, function(err, posts) {
                    var categories, categoryPosts, promises, fxs;

                    if (err) {
                        console.log("Bad response from Tumblr.");
                        console.log(err);
                        callback({
                            error: "Bad resposne from Tumblr.",
                            status: 502
                        });
                        return;
                    }

                    totalPosts = totalPosts.concat(posts.posts);

                    if (offset + limit < posts.blog.posts) {
                        // There are more posts, retrieve them.
                        getPosts(offset + limit);
                    } else {
                        // There are no more posts, cache what was received.
                        posts = totalPosts.map(function(post) {
                            return {
                                score: post.timestamp,
                                value: {
                                    type: "tumblr",
                                    id: post.id,
                                    categories: post.tags,
                                    published: post.timestamp,
                                    title: post.title,
                                    url: "tumblr/" + post.id + "/" + post.slug
                                }
                            };
                        });

                        categories = {};
                        categoryPosts = {};
                        posts.forEach(function(post) {
                            if (post.value.categories) {
                                post.value.categories.forEach(function(category) {
                                    categories[category] = 0;

                                    if (!categoryPosts.hasOwnProperty(category)) {
                                        categoryPosts[category] = [];
                                    }
                                    categoryPosts[category].push(post);
                                });
                            }
                        });

                        promises = [
                            (function() {
                                var deferred = new Deferred();

                                cache.zadd("roncli.com:tumblr:posts", posts, 86400, function() {
                                    deferred.resolve(true);
                                });

                                return deferred.promise;
                            }()),
                            (function() {
                                var deferred = new Deferred();

                                cache.hmset("roncli.com:urls", posts.map(function(post) {
                                    return {
                                        key: post.value.url,
                                        value: post.value
                                    };
                                }), 0, function() {
                                    deferred.resolve(true);
                                });

                                return deferred.promise;
                            }()),
                            (function() {
                                var deferred = new Deferred();

                                cache.zadd("roncli.com:tumblr:categories", Object.keys(categories).map(function(category) {
                                    return {
                                        score: -categoryPosts[category].length,
                                        value: category
                                    };
                                }), 86400, function() {
                                    deferred.resolve(true);
                                });

                                return deferred.promise;
                            }())
                        ];

                        Object.keys(categories).forEach(function(category) {
                            promises.push(
                                (function() {
                                    var deferred = new Deferred();

                                    cache.zadd("roncli.com:tumblr:category:" + category, categoryPosts[category], 86400, function() {
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
                        totalPosts.forEach(function(post) {
                            fxs.push(function() {
                                var deferred = new Deferred();

                                cache.set("roncli.com:tumblr:post:" + post.id, post, 86400, function() {
                                    deferred.resolve(true);
                                });

                                return deferred.promise;
                            });
                        });

                        seq(fxs);
                    }
                });
            };

        getPosts(0);
    };

/**
 * Retrieves the posts from the cache, retrieving from Tumblr if they are not in the cache.
 * @param {function} callback The callback function.
 */
module.exports.posts = function(callback) {
    "use strict";

    /**
     * Retrieves the posts from the cache.
     * @param {function} failureCallback The callback function to perform if the posts are not in the cache.
     */
    var getPosts = function(failureCallback) {
        cache.zrevrange("roncli.com:tumblr:posts", 0, -1, function(posts) {
            if (posts && posts.length > 0) {
                callback(null, posts);
                return;
            }

            failureCallback();
        });
    };

    getPosts(function() {
        cachePosts(function(err) {
            if (err) {
                callback(err);
                return;
            }

            getPosts(function() {
                callback({
                    error: "Tumblr posts do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Retrieves the categories from the cache, retrieving from Tumblr if they are not in the cache.
 * @param {function} callback The callback function.
 */
module.exports.categories = function(callback) {
    "use strict";

    /**
     * Retrieves the categories from the cache.
     * @param {function} failureCallback The callback function to perform if the categories are not in the cache.
     */
    var getCategories = function(failureCallback) {
        cache.zrange("roncli.com:tumblr:categories", 0, -1, function(categories) {
            if (categories && categories.length > 0) {
                callback(null, categories);
                return;
            }

            failureCallback();
        });
    };

    getCategories(function() {
        cachePosts(function(err) {
            if (err) {
                callback(err);
                return;
            }

            getCategories(function() {
                callback({
                    error: "Tumblr categories do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Retrieves posts from a single category.
 * @param {string} category The category to get posts for.
 * @param {function} callback The callback function.
 */
module.exports.categoryPosts = function(category, callback) {
    "use strict";

    var Tumblr = this,

        /**
         * Retrieves the category posts from the cache.
         * @param {function} failureCallback The callback function to perform if the posts are not in the cache.
         */
        getCategoryPosts = function(failureCallback) {
            cache.zrevrange("roncli.com:tumblr:category:" + category, 0, -1, function(posts) {
                if (posts && posts.length > 0) {
                    callback(null, posts);
                    return;
                }

                failureCallback();
            });
        };

    getCategoryPosts(function() {
        Tumblr.categories(function(categories) {
            if (categories && categories.indexOf(category) === -1) {
                callback({
                    error: "Tumblr posts for category do not exist.",
                    status: 400
                });
                return;
            }

            getCategoryPosts(function() {
                callback({
                    error: "Tumblr posts for category do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Retrieves a single post.
 * @param {number} id The post ID to retrieve.
 * @param {function} callback The callback function.
 */
module.exports.post = function(id, callback) {
    "use strict";

    cache.get("roncli.com:tumblr:post:" + id, function(post) {
        if (post) {
            callback(null, post);
            return;
        }

        blog.posts({id: id}, function(err, posts) {
            var post;

            if (err || !posts || !posts.posts || !posts.posts[0]) {
                console.log("Bad response from Tumblr.");
                console.log(err);
                callback({
                    error: "Bad resposne from Tumblr.",
                    status: 502
                });
                return;
            }

            post = posts.posts[0];

            cache.set("roncli.com:tumblr:post:" + id, post, 86400);

            callback(null, post);
        });
    });
};
