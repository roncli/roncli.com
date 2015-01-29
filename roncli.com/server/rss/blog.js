var cache = require("../cache/cache"),
    Rss = require("rss"),
    blog = require("../models/blog"),
    moment = require("moment"),
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
        cacheKey = "roncli.com:rss:blog:" + (category ? ":" + category : "") + startIndex,
        feed = new Rss();

    cache.get(cacheKey, function(xml) {
        if (xml) {
            callback(xml);
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
        feed.custom_elements.push({"openSearch:startIndex": startIndex.toString()});
        feed.custom_elements.push({"openSearch:itemsPerPage": "25"});

        // Get the list of blog categories.  This will ensure that all the posts are there.
        blog.getCategories(function(err, categories) {
            var key;

            if (err) {
                res.status(err.status);
                callback({error: err.error});
                return;
            }

            feed.categories = [];
            categories.forEach(function(category) {
                feed.categories.push(category.category);
            });

            if (category) {
                key = "roncli.com:blog:category:" + category;
            } else {
                key = "roncli.com:blog:posts";
            }

            all(
                (function() {
                    var deferred = new Deferred();

                    cache.zcard(key, function(count) {
                        var base = "http://roncli.com/blog.rss",
                            query = "?",
                            lastStart = Math.floor((count - 1) / 25) * 25 + 1;

                        if (category) {
                            base = base + "?category=" + category;
                            query = "&";
                        }
                        feed.custom_elements.push({"openSearch:totalResults": count});
                        if (startIndex !== 1) {
                            feed.custom_elements.push({"link": {_attr: {rel: "first", href: base}}});
                        }
                        if (startIndex !== lastStart) {
                            feed.custom_elements.push({"link": {_attr: {rel: "last", href: base + query + "start-index=" + lastStart}}});
                        }
                        if (startIndex >= 26) {
                            feed.custom_elements.push({"link": {_attr: {rel: "previous", href: base + query + "start-index=" + (startIndex - 25)}}});
                        }
                        if (startIndex <= lastStart - 25) {
                            feed.custom_elements.push({"link": {_attr: {rel: "next", href: base + query + "start-index=" + (startIndex + 25)}}});
                        }

                        deferred.resolve();
                    });

                    return deferred.promise;
                }()),
                (function () {
                    var deferred = new Deferred();

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
                                    var content;

                                    switch (post.post.blogSource) {
                                        case "blogger":
                                            content = post.post.content;
                                            break;
                                        case "tumblr":
                                            switch (post.post.type) {
                                                case "answer":
                                                    content = post.post.question + " " + post.post.answer;
                                                    break;
                                                case "audio":
                                                case "photo":
                                                case "video":
                                                    content = post.post.caption;
                                                    break;
                                                case "link":
                                                    content = post.post.description;
                                                    break;
                                                case "quote":
                                                    content = post.post.text + " " + post.post.source;
                                                    break;
                                                case "text":
                                                    content = post.post.body;
                                                    break;
                                            }
                                            break;
                                    }

                                    feed.item({
                                        guid: "roncli.com:blog:" + post.post.blogSource + ":" + post.post.id.toString(),
                                        date: new Date(post.post.published),
                                        categories: post.post.categories,
                                        title: post.post.blogTitle,
                                        description: content,
                                        url: "http://roncli.com" + post.blogUrl,
                                        author: "roncli@roncli.com (roncli)",
                                        custom_elements: [
                                            {"atom:updated": moment(new Date(post.post.published)).format()}
                                        ]
                                    });
                                });

                                deferred.resolve();
                            },

                            // If any of the functions error out, it will be handled here.
                            function(err) {
                                deferred.reject(err);
                            }
                        );
                    });

                    return deferred.promise;
                }())
            ).then(
                function() {
                    xml = feed.xml();

                    cache.set(cacheKey, xml, startIndex === 1 ? 900 : 86400);

                    callback(xml);
                },

                // If any of the functions error out, it will be handled here.
                function(err) {
                    res.status(err.status);
                    callback({error: err.error});
                }
            );
        });
    });
};
