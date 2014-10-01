var config = require("../privateConfig").google,
    google = require("googleapis"),
    blogger = google.blogger("v3"),
    cache = require("../cache/cache.js"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Caches the posts from Blogger.
     * @param {function} callback The callback function.
     */
    cachePosts = function(callback) {
        "use strict";

        blogger.posts.list({
            blogId: config.blog_id,
            maxResults: 100000,
            fields: "items(id,labels,published,title,url)",
            key: config.api_key
        }, function(err, data) {
            var urlPattern = /^http:\/\/blog\.roncli\.com\/[0-9]{4}\/[0-9]{2}\/(.*)\.html$/,
                posts, categories, categoryPosts, promises;

            if (err) {
                console.log("Bad response from Google.");
                console.log(err);
                callback({
                    error: "Bad response from Google.",
                    status: 502
                });
                return;
            }

            posts = data.items.map(function(post) {
                var urlParsed = urlPattern.exec(post.url),
                    timestamp = new Date(post.published).getTime() / 1000;

                return {
                    score: timestamp,
                    value: {
                        source: "blogger",
                        id: post.id,
                        categories: post.labels,
                        published: timestamp,
                        title: post.title,
                        url: "/blogger/" + post.id + (urlParsed ? "/" + urlParsed[1] : "")
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

                    cache.zadd("roncli.com:blogger:posts", posts, 86400, function() {
                        deferred.resolve(true);
                    });

                    return deferred.promise;
                }()),
                (function() {
                    var deferred = new Deferred();

                    cache.hmset("roncli.com:blog:urls", posts.map(function(post) {
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

                    cache.zadd("roncli.com:blogger:categories", Object.keys(categories).map(function(category) {
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

                        cache.zadd("roncli.com:blogger:category:" + category, categoryPosts[category], 86400, function() {
                            deferred.resolve(true);
                        });

                        return deferred.promise;
                    }())
                );
            });

            all(promises).then(function() {
                callback();
            });
        });
    };

/**
 * Ensures that the posts are cached.
 * @param {boolean} force Forces the caching of posts.
 * @param {function} callback The callback function.
 */
module.exports.cachePosts = function(force, callback) {
    "use strict";

    if (force) {
        cachePosts(callback);
        return;
    }

    cache.keys("roncli.com:blogger:posts", function(keys) {
        if (keys && keys.length > 0) {
            callback();
            return;
        }

        cachePosts(callback);
    });
};

/**
 * Retrieves the posts from the cache, retrieving from Blogger if they are not in the cache.
 * @param {function} callback The callback function.
 */
module.exports.posts = function(callback) {
    "use strict";

    /**
     * Retrieves the posts from the cache.
     * @param {function} failureCallback The callback function to perform if the posts are not in the cache.
     */
    var getPosts = function(failureCallback) {
        cache.zrevrange("roncli.com:blogger:posts", 0, -1, function(posts) {
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
                    error: "Blogger posts do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Retrieves the categories from the cache, retrieving from Blogger if they are not in the cache.
 * @param {function} callback The callback function.
 */
module.exports.categories = function(callback) {
    "use strict";

    /**
     * Retrieves the categories from the cache.
     * @param {function} failureCallback The callback function to perform if the categories are not in the cache.
     */
    var getCategories = function(failureCallback) {
        cache.zrange("roncli.com:blogger:categories", 0, -1, function(categories) {
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
                    error: "Blogger categories do not exist.",
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

    var Blogger = this,

        /**
         * Retrieves the category posts from the cache.
         * @param {function} failureCallback The callback function to perform if the posts are not in the cache.
         */
        getCategoryPosts = function(failureCallback) {
            cache.zrevrange("roncli.com:blogger:category:" + category, 0, -1, function(posts) {
                if (posts && posts.length > 0) {
                    callback(null, posts);
                    return;
                }

                failureCallback();
            });
        };

    getCategoryPosts(function() {
        Blogger.categories(function(categories) {
            if (categories && categories.indexOf(category) === -1) {
                callback({
                    error: "Blogger posts for category do not exist.",
                    status: 400
                });
                return;
            }

            getCategoryPosts(function() {
                callback({
                    error: "Blogger posts for category do not exist.",
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

    cache.get("roncli.com:blogger:post:" + id, function(post) {
        if (post) {
            callback(null, post);
            return;
        }

        blogger.posts.get({
            blogId: config.blog_id,
            postId: id,
            fields: "id,published,title,content",
            key: config.api_key
        }, function(err, post) {
            if (err || !post) {
                console.log("Bad response from Blogger.");
                console.log(err);
                callback({
                    error: "Bad response from Blogger.",
                    status: 502
                });
                return;
            }

            post.published = new Date(post.published).getTime() / 1000;

            cache.set("roncli.com:blogger:post:" + id, post, 86400);

            callback(null, post);
        });
    });
};
