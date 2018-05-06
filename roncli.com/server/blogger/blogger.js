var config = require("../privateConfig").google,
    google = require("googleapis").google,
    blogger = google.blogger("v3"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Caches the posts from Blogger.
     * @param {function} callback The callback function.
     */
    cachePosts = function(callback) {
        "use strict";

        var totalPosts = [],
            postsDeferred = new Deferred(),

            /**
             * Gets the blog posts for a specific page.
             * @param {string} [pageToken] The page token to retrieve.
             */
            getPosts = function(pageToken) {
                var options = {
                    blogId: config.blog_id,
                    maxResults: 500,
                    status: "live",
                    fields: "items(id,labels,published,title,url),nextPageToken",
                    key: config.api_key
                };

                if (pageToken) {
                    options.pageToken = pageToken;
                }

                blogger.posts.list(options, function(err, data) {
                    if (err) {
                        console.log("Bad response from Google.");
                        console.log(err);
                        postsDeferred.reject({
                            error: "Bad response from Google.",
                            status: 502
                        });
                        return;
                    }

                    totalPosts = [].concat.apply([], [totalPosts, data.data.items]);

                    if (data.data.nextPageToken) {
                        getPosts(data.data.nextPageToken);
                    } else {
                        postsDeferred.resolve(true);
                    }
                });
            };

        getPosts();

        postsDeferred.promise.then(
            function() {
                var urlPattern = /^http:\/\/blog\.roncli\.com\/[0-9]{4}\/[0-9]{2}\/(.*)\.html$/,
                    posts, categories, categoryPosts, promises;

                posts = totalPosts.map(function(post) {
                    var urlParsed = urlPattern.exec(post.url),
                        timestamp = new Date(post.published).getTime();

                    return {
                        score: timestamp,
                        value: {
                            blogSource: "blogger",
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
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                callback(err);
            }
        );
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

    all(
        (function() {
            var deferred = new Deferred();

            cache.get("roncli.com:blogger:post:" + id, function(post) {
                if (post) {
                    deferred.resolve(post);
                    return;
                }

                blogger.posts.get({
                    blogId: config.blog_id,
                    postId: id,
                    fields: "id,published,title,content",
                    key: config.api_key
                }, function(err, post) {
                    if (err || !post || !post.data) {
                        console.log("Bad response from Blogger.");
                        console.log(err);
                        deferred.reject({
                            error: "Bad response from Blogger.",
                            status: 502
                        });
                        return;
                    }

                    post.data.published = new Date(post.published).getTime();

                    cache.set("roncli.com:blogger:post:" + id, post.data, 86400);

                    deferred.resolve(post.data);
                });
            });

            return deferred;
        }()),
        (function() {
            var deferred = new Deferred(),
                postComments = [],
                getComments = function(params) {
                    blogger.comments.list(
                        params, function(err, comments) {
                            if (err) {
                                console.log("Bad response from Blogger.");
                                console.log(err);
                                deferred.reject({
                                    error: "Bad response from Blogger.",
                                    status: 502
                                });
                                return;
                            }

                            if (!comments.data || !comments.data.items) {
                                cache.set("roncli.com:blogger:post:comments:" + id, postComments, 86400);
                                deferred.resolve(postComments);
                                return;
                            }

                            comments.data.items.forEach(function(comment) {
                                comment.published = new Date(comment.published).getTime();
                                comment.blogSource = "blogger";
                            });

                            postComments = postComments.concat(comments.data.items);

                            if (!comments.data.nextPageToken) {
                                cache.set("roncli.com:blogger:post:comments:" + id, postComments, 86400);
                                deferred.resolve(postComments);
                                return;
                            }

                            params.pageToken = comments.data.nextPageToken;
                            getComments(params);
                        }
                    );
                };

            cache.get("roncli.com:blogger:post:comments:" + id, function(comments) {
                if (comments) {
                    deferred.resolve(comments);
                    return;
                }

                getComments({
                    blogId: config.blog_id,
                    postId: id,
                    maxResults: 500,
                    status: "live",
                    fields: "items(author/displayName,content,id,published),nextPageToken",
                    key: config.api_key
                });
            });

            return deferred;
        }())
    ).then(
        function(results) {
            callback(null, {post: results[0], comments: results[1]});
        },

        // If any of the functions error out, it will be handled here.
        function(err) {
            callback(err);
        }
    );
};
