var Moment = require("moment"),
    sanitizeHtml = require("sanitize-html"),
    cache = require("../cache/cache"),
    db = require("../database/database"),
    blogger = require("../blogger/blogger"),
    googleConfig = require("../privateConfig").google,
    tumblr = require("../tumblr/tumblr"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Cache the posts from blogger and tumblr.
     * @param {boolean} force Whether to force the caching of posts.
     * @param {function} callback The callback function.
     */
    cachePosts = function(force, callback) {
        "use strict";

        var bloggerDeferred = new Deferred(),
            tumblrDeferred = new Deferred();

        blogger.cachePosts(force, function(err) {
            if (err) {
                bloggerDeferred.reject(err);
            } else {
                bloggerDeferred.resolve(true);
            }
        });

        tumblr.cachePosts(force, function(err) {
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
                                if (!categories) {
                                    unionDeferred.reject({
                                        error: "Error retrieving blog categories.",
                                        status: 500
                                    });
                                }

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
 * Forces the blog to cache the posts, even if they are already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCachePosts = function(callback) {
    "use strict";

    cachePosts(true, callback);
};

/**
 * Gets the latest blog post.
 * @param {function} callback The callback function.
 */
module.exports.getLatestPost = function(callback) {
    "use strict";

    this.getPostByIndex(0, function(err, post) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, [post]);
    });
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
                    Blog.getPost(post[0], function(err, post) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        callback(null, [post]);
                    });
                    return;
                }

                failureCallback();
            });
        };

    getPost(function() {
        cachePosts(true, function(err) {
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
        cachePosts(true, function(err) {
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

                callback(null, [post]);
            });
        };

    getPostFromUrl(url, getPost, function() {
        cachePosts(true, function(err) {
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
        categoriesDeferred = new Deferred(),
        promises = [],

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
                            var nextDeferred = new Deferred();

                            if (index === 0) {
                                nextDeferred.resolve(null);
                            } else {
                                cache.zrevrange(key, index - 1, index - 1, function(post) {
                                    nextDeferred.resolve(post);
                                });
                            }

                            return nextDeferred.promise;
                        }()),
                        (function() {
                            var prevDeferred = new Deferred();

                            cache.zrevrange(key, index + 1, index + 1, function(post) {
                                prevDeferred.resolve(post);
                            });

                            return prevDeferred.promise;
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
                            deferred.reject(err);
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
        cachePosts(true, function(err) {
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

    post.categories.forEach(function(category) {
        promises.push(
            (function() {
                var deferred = new Deferred();

                cache.keys("roncli.com:blog:category:" + category, function(keys) {
                    if (keys && keys.length > 0) {
                        deferred.resolve();
                    } else {
                        cachePosts(true, function(err) {
                            if (err) {
                                deferred.reject(err);
                                return;
                            }

                            deferred.resolve();
                        });
                    }
                });

                return deferred.promise;
            }())
        );
    });

    all(promises).then(
        function() {
            categoriesDeferred.resolve();
        },

        function(err) {
            categoriesDeferred.reject(err);
        }
    );

    all(postDeferred.promise, rankDeferred.promise, categoriesDeferred.promise).then(
        function(content) {
            var contentPromises = [],
                sourceDeferred = new Deferred();

            content[0].blogUrl = post.url;

            post.categories.forEach(function(category) {
                var deferred = new Deferred();

                getIndex("roncli.com:blog:category:" + category, deferred, function() {
                    console.log("Missing posts for category " + category);
                    deferred.reject({
                        error: "Missing posts for category.",
                        status: 500
                    });
                });

                contentPromises.push(deferred.promise);
            });

            getIndex("roncli.com:" + post.blogSource + ":posts", sourceDeferred, function() {
                console.log("Missing posts for blog source " + post.blogSource);
                sourceDeferred.reject({
                    error: "Missing posts for blog source.",
                    status: 500
                });
            });
            contentPromises.push(sourceDeferred.promise);

            all(contentPromises).then(
                function(categoryRanks) {
                    var postData = {
                        id: post.blogSource + content[0].id,
                        post: content[0],
                        index: content[1],
                        categories: [],
                        blogUrl: post.url
                    };

                    postData.post.categories = post.categories;
                    postData.post.published = post.published;
                    postData.post.blogTitle = post.title;
                    postData.post.id = post.id;

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
            if (categories && categories.length > 0) {
                callback(null, categories.map(function(category, index) {
                    return {id: index, category: category};
                }));
                return;
            }

            failureCallback();
        });
    };

    getCategories(function() {
        cachePosts(true, function(err) {
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
            "SELECT bc.CommentID, bc.Comment, bc.CrDate, u.Alias FROM tblBlogComment bc INNER JOIN tblUser u ON bc.CrUserID = u.UserID WHERE bc.BlogURL = @url AND bc.ModeratedDate IS NOT NULL ORDER BY bc.CrDate",
            {url: {type: db.VARCHAR(1024), value: url}},
            function(err, data) {
                if (err || !data || !data.recordsets || !data.recordsets[0]) {
                    console.log("Database error in blog.getCommentsByUrl.");
                    console.log(err);
                    dbDeferred.reject({
                        error: "There was a database error retrieving blog post comments.  Please reload the page and try again.",
                        status: 500
                    });
                    return;
                }

                if (data.recordsets[0]) {
                    comments = comments.concat(data.recordsets[0].map(function(comment) {
                        return {
                            id: comment.CommentID,
                            published: comment.CrDate.getTime(),
                            content: comment.Comment,
                            author: comment.Alias,
                            blogSource: "site"
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
        cachePosts(true, function(err) {
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

/**
 * Posts a comment to a blog page.
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
                "SELECT MAX(CrDate) LastComment FROM tblBlogComment WHERE CrUserID = @userId",
                {userId: {type: db.INT, value: userId}},
                function(err, data) {
                    if (err || !data || !data.recordsets || !data.recordsets[0]) {
                        console.log("Database error in blog.postComment while checking the user's last comment time.");
                        console.log(err);
                        deferred.reject({
                            error: "There was a database error posting a blog comment.  Please reload the page and try again.",
                            status: 500
                        });
                        return;
                    }

                    if (data.recordsets[0] && data.recordsets[0][0] && data.recordsets[0][0].LastComment > new Moment().add(-1, "minute")) {
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

            getPostFromUrl(url, resolve, function() {
                cachePosts(true, function(err) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    getPostFromUrl(url, resolve, function() {
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
                "INSERT INTO tblBlogComment (BlogURL, Comment, CrDate, CrUserID) VALUES (@url, @content, GETUTCDATE(), @userId)",
                {
                    url: {type: db.VARCHAR(1024), value: url},
                    content: {type: db.TEXT, value: content},
                    userId: {type: db.INT, value: userId}
                },
                function(err) {
                    if (err) {
                        console.log("Database error in blog.postComment while posting a comment.");
                        console.log(err);
                        callback({
                            error: "There was a database error posting a blog comment.  Please reload the page and try again.",
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
