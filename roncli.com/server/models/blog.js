var cache = require("../cache/cache.js"),
    db = require("../database/database.js"),
    blogger = require("../blogger/blogger.js"),
    googleConfig = require("../privateConfig").google,
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
                all(
                    (function() {
                        var deferred = new Deferred();

                        cache.zunionstore("roncli.com:blog:posts", ["roncli.com:blogger:posts", "roncli.com:tumblr:posts"], 86400, function() {
                            deferred.resolve(true);
                        });

                        return deferred.promise;
                    }()),
                    (function() {
                        var unionDeferred = new Deferred();

                        cache.zunionstore("roncli.com:blog:categories", ["roncli.com:blogger:categories", "roncli.com:tumblr:categories"], 86400, function() {
                            var promises = [],

                                /**
                                 * Caches a category.
                                 * @param {string} category The category to cache.
                                 * @returns {*} A promise object.
                                 */
                                cacheCategory = function(category) {
                                    var deferred = new Deferred();

                                    cache.zunionstore("roncli.com:blog:category:" + category, ["roncli.com:blogger:category:" + category, "roncli.com:tumblr:category:" + category], 86400, function() {
                                        deferred.resolve(true);
                                    });

                                    return deferred.promise;
                                };

                            cache.zrange("roncli.com:blog:categories", 0, -1, function(categories) {
                                categories.forEach(function(category) {
                                    promises.push(cacheCategory(category));
                                });
                            });
                            all(promises).then(

                                function() {
                                    unionDeferred.resolve(true);
                                },

                                // If any of the functions error out, it will be handled here.
                                function(err) {
                                    unionDeferred.reject(err);
                                }
                            );
                        });

                        return unionDeferred.promise;
                    }())
                ).then(
                    function() {
                        callback();
                    },

                    // If any of the functions error out, it will be handled here.
                    function(err) {
                        callback(err);
                    }
                );
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                callback(err);
            }
        );
    },

    /**
     * Gets post data for a URL from the cache.
     * @param {string} url The URL to get post data for.
     * @param {function} callback The success callback when the post is found.
     * @param {function} failureCallback The failure callback when there are no posts.
     */
    getPostFromUrl = function(url, callback, failureCallback) {
        "use strict";

        cache.hget("roncli.com:blog:urls", url, function(post) {
            if (post) {
                callback(post);
                return;
            }

            failureCallback();
        });
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
 * Gets the latest post for a category.
 * @param {string} category The category to get the latest post for.
 * @param {function} callback The callback function.
 */
module.exports.getLatestPostByCategory = function(category, callback) {
    "use strict";

    var Blog = this,

        /**
         * Retrieves the post from the cache.
         * @param {function} failureCallback The callback function to perform if the post is not in the cache.
         */
        getPost = function(failureCallback) {
            cache.zrevrange("roncli.com:blog:category:" + category, 0, 0, function(post) {
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
                    error: "Blog posts do not exist for this category.",
                    status: 400
                });
            });
        });
    });
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
         * Retrieves the post from the cache.
         * @param {object} post The post to retrieve.
         */
        getPost = function(post) {
            Blog.getPost(post, function(err, post) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(null, post);
            });
        };

    getPostFromUrl(url, getPost, function() {
        cachePosts(function(err) {
            if (err) {
                callback(err);
                return;
            }

            getPostFromUrl(url, getPost, function() {
                callback({
                    error: "Page not found.",
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

    var postDeferred = new Deferred(),
        rankDeferred = new Deferred(),

        /**
         * Get the index of the post from a key.
         * @param {string} key The key to lookup the index against.
         * @param {object} deferred The deferred object to resolve.
         * @param {function} failureCallback The callback function to perform if the index is not in the cache.
         */
        getIndex = function(key, deferred, failureCallback) {
            cache.zrevrank(key, post, function(index) {
                if (index || index === 0) {
                    all(
                        (function() {
                            var deferred = new Deferred();

                            if (index === 0) {
                                deferred.resolve(null);
                            } else {
                                cache.zrevrange(key, index - 1, index - 1, function(post) {
                                    deferred.resolve(post);
                                });
                            }

                            return deferred.promise;
                        }()),
                        (function() {
                            var deferred = new Deferred();

                            cache.zrevrange(key, index + 1, index + 1, function(post) {
                                deferred.resolve(post);
                            });

                            return deferred.promise;
                        }())
                    ).then(
                        function(posts) {
                            deferred.resolve({
                                index: index,
                                next: posts[0] ? posts[0][0] : null,
                                previous: posts[1] ? posts[1][0]: null
                            });
                        },

                        // If any of the functions error out, it will be handled here.
                        function(err) {
                            callback(err);
                        }
                    );

                    return;
                }

                failureCallback();
            });
        };

    switch (post.blogSource) {
        case "blogger":
            blogger.post(post.id, function(err, data) {
                if (err) {
                    postDeferred.reject(err);
                } else {
                    data.post.blogSource = "blogger";
                    postDeferred.resolve(data.post);
                }
            });
            break;
        case "tumblr":
            tumblr.post(post.id, function(err, post) {
                if (err) {
                    postDeferred.reject(err);
                } else {
                    post.blogSource = "tumblr";
                    postDeferred.resolve(post);
                }
            });
            break;
    }

    getIndex("roncli.com:blog:posts", rankDeferred, function() {
        cachePosts(function(err) {
            if (err) {
                rankDeferred.reject(err);
                return;
            }

            getIndex("roncli.com:blog:posts", rankDeferred, function() {
                rankDeferred.reject({
                    error: "Blog posts do not exist.",
                    status: 400
                });
            });
        });
    });

    all(postDeferred.promise, rankDeferred.promise).then(
        function(content) {
            var promises = [],
                sourceDeferred = new Deferred();

            content[0].blogUrl = post.url;

            post.categories.forEach(function(category) {
                var deferred = new Deferred();

                getIndex("roncli.com:blog:category:" + category, deferred, function() {
                    deferred.resolve(null);
                });

                promises.push(deferred.promise);
            });

            getIndex("roncli.com:" + post.blogSource + ":posts", sourceDeferred, function() {
                sourceDeferred.resolve(null);
            });
            promises.push(sourceDeferred.promise);

            all(promises).then(
                function(categoryRanks) {
                    var postData = {
                        post: content[0],
                        index: content[1],
                        categories: []
                    };

                    postData.post.categories = post.categories;
                    postData.post.published = post.published;
                    postData.post.blogTitle = post.title;

                    postData.source = categoryRanks[categoryRanks.length - 1];

                    post.categories.forEach(function(category, index) {
                        categoryRanks[index].category = category;
                        postData.categories.push(categoryRanks[index]);
                    });

                    callback(null, postData);
                },

                // If any of the functions error out, it will be handled here.
                function(err) {
                    callback(err);
                }
            );
        },

        // If any of the functions error out, it will be handled here.
        function(err) {
            callback(err);
        }
    );
};

/**
 * Gets the available categories.
 * @param {function} callback The callback function.
 */
module.exports.getCategories = function(callback) {
    "use strict";

    /**
     * Retrieves categories from the cache.
     * @param {function} failureCallback The callback function to perform if the categories are not in the cache.
     */
    var getCategories = function(failureCallback) {
        cache.zrange("roncli.com:blog:categories", 0, -1, function(categories) {
            if (categories) {
                callback(null, categories.map(function(category, index) {
                    return {id: index, category: category};
                }));
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
                    error: "Blog categories do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets comments for a post via the post URL.
 * @param {string} url The URL of the post.
 * @param {function} callback The callback function.
 */
module.exports.getCommentsByUrl = function(url, callback) {
    "use strict";

    /**
     * Gets the comments for a post.
     * @param {object} post The post object from the URL.
     */
    var getComments = function(post) {
        var dbDeferred = new Deferred(),
            promises = [dbDeferred],
            comments = [],
            bloggerDeferred;

        db.query(
            "SELECT bc.CommentID, bc.Comment, bc.CrDate, u.Alias FROM tblBlogComment bc INNER JOIN tblUser u ON bc.CrUserID = u.UserID WHERE bc.BlogURL = @url AND bc.ModeratedDate IS NOT NULL",
            {url: {type: db.VARCHAR(1024), value: url}},
            function(err, data) {
                if (err) {
                    console.log("Database error in blog.getCommentsByUrl.");
                    console.log(err);
                    dbDeferred.reject({
                        error: "There was a database error retrieving blog post comments.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (data[0]) {
                    comments = comments.concat(data[0].map(function(comment) {
                        return {
                            id: comment.CommentID,
                            published: comment.CrDate.getTime() / 1000,
                            content: comment.Comment,
                            author: comment.Alias,
                            replyAddress: "https://www.blogger.com/comment.g?blogID=" + googleConfig.blog_id + "&postID=" + post.id,
                            blogSource: "db"
                        };
                    }));
                }

                dbDeferred.resolve(true);
            }
        );

        switch (post.blogSource) {
            case "blogger":
                bloggerDeferred = new Deferred();

                blogger.post(post.id, function(err, data) {
                    if (err) {
                        bloggerDeferred.reject(err);
                        return;
                    }

                    comments = comments.concat(
                        data.comments.map(function(comment) {
                            comment.replyAddress = "https://www.blogger.com/comment.g?blogID=" + googleConfig.blog_id + "&postID=" + post.id;
                            return comment;
                        })
                    );
                    bloggerDeferred.resolve(true);
                });

                promises.push(bloggerDeferred);
                break;
        }

        all(promises).then(
            function() {
                callback(null, comments.sort(function(a, b) {
                    return a.published - b.published;
                }));
            },

            // If any of the functions error out, it will be handled here.
            function(err) {
                callback(err);
            }
        );
    };

    getPostFromUrl(url, getComments, function() {
        cachePosts(function(err) {
            if (err) {
                callback(err);
                return;
            }

            getPostFromUrl(url, getComments, function() {
                callback({
                    error: "Page not found.",
                    status: 404
                });
            });
        });
    });
};
