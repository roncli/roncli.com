var config = require("../privateConfig").tumblr,
    tumblr = require("tumblr"),
    cache = require("../cache/cache.js"),
    blog = new tumblr.Blog("roncli.tumblr.com", config),
    cachePosts = function(callback) {
        "use strict";

        var limit = 20,
            totalPosts = [],

            getPosts = function(offset) {
                blog.posts({offset: offset}, function(err, posts) {
                    var categories, categoryPosts;

                    if (err) {
                        console.log("Bad response from Tumblr.");
                        console.log(err);
                        callback({
                            error: "Bad resposne from Tumblr.",
                            status: 502
                        });
                        return;
                    }

                    totalPosts.push(posts.posts);

                    if (offset + limit < posts.blog.posts) {
                        getPosts(offset + limit);
                    } else {
                        posts = totalPosts.map(function(post) {
                            return {
                                score: post.timestamp,
                                value: {
                                    type: "tumblr",
                                    id: post.id,
                                    categories: post.tags,
                                    published: post.timestamp,
                                    title: post.title
                                }
                            };
                        });
                        cache.zset("roncli.com:tumblr:posts", posts, 86400);

                        categories = {};
                        categoryPosts = {};
                        posts.forEach(function(post) {
                            post.categories.forEach(function(category) {
                                categories[category] = 0;

                                if (!categoryPosts.hasOwnProperty(category)) {
                                    categoryPosts[category] = [];
                                }
                                categoryPosts[category].push(post);
                            });
                        });
                        cache.zset("roncli.com:tumblr:categories", Object.keys(categories).map(function(category) {
                            return {
                                score: 0,
                                value: category
                            };
                        }), 86400);
                        Object.keys(categories).forEach(function(category) {
                            cache.zset("roncli.com:tumblr:category:" + category, categoryPosts[category], 86400);
                        });

                        callback();
                    }
                });
            };

        getPosts(0);
    };

module.exports.posts = function(err, callback) {
    "use strict";

    cache.zrevrange("roncli.com:tumblr:posts", 0, -1, function(posts) {
        if (posts) {
            callback(null, posts);
            return;
        }

        cachePosts(function(err) {
            if (err) {
                callback(err);
                return;
            }

            cache.zrevrange("roncli.com:tumblr:posts", 0, -1, function(posts) {
                if (posts) {
                    callback(null, posts);
                    return;
                }

                callback({
                    error: "Tumblr posts do not exist.",
                    status: 502
                });
            });
        });
    });
};
