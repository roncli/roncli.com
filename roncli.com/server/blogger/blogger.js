var config = require("../privateConfig").google,
    google = require("googleapis"),
    blogger = google.blogger("v3"),
    cache = require("../cache/cache.js"),
    moment = require("moment"),
    processPosts = function(posts) {
        "use strict";

        var categories = {},
            sortedCategories = [],
            key;

        posts.forEach(function(post) {
            post.labels.forEach(function(label) {
                if (!categories[label]) {
                    categories[label] = [];
                }
                categories[label].push(post);
            });
        });

        for (key in categories) {
            if (categories.hasOwnProperty(key)) {
                sortedCategories.push({category: key, count: categories[key].length});
                cache.set("roncli.com:blogger:category:" + key, categories[key], 86400);
            }
        }

        sortedCategories.sort(function(a, b) {
            if (a.count < b.count) {
                return 1;
            }
            if (a.count > b.count) {
                return -1;
            }

            return a.category.localeCompare(b.category);
        });

        cache.zadd(
            "roncli.com:blogger:categories", sortedCategories.map(function(category) {
                return {value: category.category, score: 0};
            }), 86400
        );
    };

module.exports.posts = function(callback) {
    "use strict";

    cache.get("roncli.com:blogger:posts", function(posts) {
        if (posts) {
            callback(null, posts);
            return;
        }

        blogger.posts.list({
            blogId: config.blog_id,
            maxResults: 100000,
            fields: "items(id,labels,published,title)",
            key: config.api_key
        }, function(err, data) {
            var posts;

            if (err) {
                console.log("Bad response from Google.");
                console.log(err);
                callback({
                    error: "Bad response from Google.",
                    status: 502
                });
                return;
            }

            posts = data.items;

            cache.set("roncli.com:blogger:posts", posts.map(function(post) {
                return {
                    type: "blogger",
                    id: post.id,
                    labels: post.labels,
                    published: new Date(post.published).getTime(),
                    title: post.title
                };
            }), 86400);
            processPosts(posts);
            callback(null, posts);
        });
    });
};

module.exports.categories = function(callback) {
    "use strict";

    var Blogger = this;

    cache.zrangebylex("roncli.com:blogger:categories", function(categories) {
        if (categories) {
            callback(null, categories);
            return;
        }

        Blogger.posts(function(err) {
            if (err) {
                callback(err);
                return;
            }

            Blogger.categories(callback);
        });
    });
};

module.exports.postsByCategory = function(category, callback) {
    "use strict";

    var Blogger = this;

    cache.get("roncli.com:blogger:category:" + category, function(posts) {
        if (posts) {
            callback(null, posts);
            return;
        }

        Blogger.categories(function(categories) {
            if (categories.indexOf(category) === -1) {
                callback({
                    error: "Category does not exist.",
                    status: 400
                });
                return;
            }

            Blogger.posts(function(err) {
                if (err) {
                    callback(err);
                    return;
                }

                Blogger.postsByCategory(category, callback);
            });
        });
    });
};
