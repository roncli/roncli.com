var cache = require("../cache/cache"),
    Rss = require("rss"),
    blog = require("../models/blog"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all;

/**
 * Get the RSS feed for the blog.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @param {function(null, object)|function(object)} callback The callback function.
 */
module.exports.rss = function(req, res, callback) {
    "use strict";

    var startIndex = req.query["start-index"] || 1,
        category = req.query.category,
        cacheKey = "roncli.com:rss:blog:" + startIndex + (category ? ":" + category : ""),
        feed = new Rss();

    cache.get(cacheKey, function(rss) {
        if (rss) {
            callback(null, rss);
            return;
        }

        feed.title = "roncli.com Blog";
        feed.description = "The blog of roncli";
        feed.generator = "roncli.com";
        feed.feed_url = "http://roncli.com/blog.rss";
        feed.site_url = "http://roncli.com/blog";
        feed.image_url = "http://roncli.com/images/roncliSmall.png";
        feed.managingEditor = "roncli@roncli.com (Ronald M. Clifford)";
        feed.webMaster = "roncli@roncli.com (Ronald M. Clifford)";
        feed.copyright = (new Date()).getFullYear().toString() + " Ronald M. Clifford";
        feed.language = "en-us";
        feed.ttl = 60;
        feed.custom_namespaces.openSearch = "http://a9.com/-/spec/opensearchrss/1.0/";
        // feed.custom_elements.push({"openSearch:totalResults": ""});
        feed.custom_elements.push({"openSearch:startIndex": startIndex.toString()});
        feed.custom_elements.push({"openSearch:itemsPerPage": "25"});

        // Get the list of blog categories.  This will ensure that all the posts are there.
        blog.getCategories(function(err, categories) {
            if (err) {
                res.status(err.status);
                callback({error: err.error});
                return;
            }

            feed.categories = [];
            categories.forEach(function(category) {
                feed.categories.push(category.category);
            });

            all(
                (function () {
                    var deferred = new Deferred(),
                        key;

                    if (category) {
                        key = "roncli.com:blog:category:" + category;
                    } else {
                        key = "roncli.com:blog:posts";
                    }

                    cache.zrevrange(key, startIndex - 1, startIndex + 23, function(posts) {
                        var promises = [];

                        posts.forEach(function(post) {
                            promises.push((function() {
                                var postDeferred = new Deferred();

                                blog.getPost(post, function(err, postData) {
                                    if (err) {
                                        postDeferred.reject(err);
                                        return;
                                    }

                                    postDeferred.resolve(postData);
                                });

                                return postDeferred.promise;
                            }()));
                        });

                        all(promises).then(
                            function(posts) {
                                posts.forEach(function(post) {
                                    feed.item({ //TODO: Complete this
                                        guid: "",
                                        pubDate: "",
                                        "atom:updated": "",
                                        categories: [],
                                        title: "",
                                        description: "",
                                        link: "",
                                        author: "roncli@roncli.com (roncli)"
                                    });
                                });

                                deferred.resolve();
                            },

                            // If any of the functions error out, it will be handled here.
                            function(err) {
                                res.status(err.status);
                                callback({error: err.error});
                                return;
                            }
                        )
                    });

                    return deferred.promise;
                }())
            );
        });
    });


};
