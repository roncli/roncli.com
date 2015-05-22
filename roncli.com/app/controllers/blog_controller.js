var handleServerError = require("../lib/handleServerError"),
    moment = require("moment");

module.exports = {
    /**
     * The blog page view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            blog: {collection: "Blog_GetLatest", params: {}},
            categories: {collection: "BlogCategories", params: {}}
        }, function(err, result) {
            if (!err && result && result.blog && result.blog.models && result.blog.models[0] && result.blog.models[0].attributes && result.blog.models[0].attributes.error) {
                err = result.blog.models[0].attributes;
            }

            if (!err && result && result.categories && result.categories.models && result.categories.models[0] && result.categories.models[0].attributes && result.categories.models[0].attributes.error) {
                err = result.categories.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                result.meta = {
                    "og:description": "This is the roncli.com Blog.",
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": "The roncli.com Blog",
                    "og:type": "website",
                    "og:url": "http://" + app.req.headers.host + "/blog",
                    "twitter:card": "summary",
                    "twitter:description": "This is the roncli.com Blog.",
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": "The roncli.com Blog",
                    "twitter:url": "http://" + app.req.headers.host + "/blog"
                };
            }
            callback(err, result);
        });
    },

    /**
     * The page view for a blog category.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    category: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            blog: {collection: "Blog_GetLatestByCategory", params: {category: params[0]}},
            categories: {collection: "BlogCategories", params: {}}
        }, function(err, result) {
            if (!err && result && result.blog && result.blog.models && result.blog.models[0] && result.blog.models[0].attributes && result.blog.models[0].attributes.error) {
                err = result.blog.models[0].attributes;
            }

            if (!err && result && result.categories && result.categories.models && result.categories.models[0] && result.categories.models[0].attributes && result.categories.models[0].attributes.error) {
                err = result.categories.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                result.meta = {
                    "og:description": "This is the " + decodeURIComponent(params[0]) + " category of the roncli.com Blog.",
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": "The roncli.com Blog - " + decodeURIComponent(params[0]),
                    "og:type": "website",
                    "og:url": "http://" + app.req.headers.host + "/blog/category/" + params[0],
                    "twitter:card": "summary",
                    "twitter:description": "This is the " + decodeURIComponent(params[0]) + " category of the roncli.com Blog.",
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": "The roncli.com Blog - " + decodeURIComponent(params[0]),
                    "twitter:url": "http://" + app.req.headers.host + "/blog/category/" + params[0]
                };
            }
            callback(err, result);
        });
    },

    /**
     * The page view for specific blog posts.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    url: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            blog: {collection: "Blog_GetFromUrl", params: {url: "/" + params[0]}},
            categories: {collection: "BlogCategories", params: {}}
        }, function(err, result) {
            var post, content;

            if (!err && result && result.blog && result.blog.models && result.blog.models[0] && result.blog.models[0].attributes && result.blog.models[0].attributes.error) {
                err = result.blog.models[0].attributes;
            }

            if (!err && result && result.categories && result.categories.models && result.categories.models[0] && result.categories.models[0].attributes && result.categories.models[0].attributes.error) {
                err = result.categories.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                post = result.blog.models[0].get("post");

                switch (post.blogSource) {
                    case "blogger":
                        content = post.content;
                        break;
                    case "tumblr":
                        switch (post.type) {
                            case "answer":
                                content = post.question + " " + post.answer;
                                break;
                            case "audio":
                            case "photo":
                            case "video":
                                content = post.caption;
                                break;
                            case "link":
                                content = post.description;
                                break;
                            case "quote":
                                content = post.text + " " + post.source;
                                break;
                            case "text":
                                content = post.body;
                                break;
                        }
                        break;
                }

                content = content.replace("\n", " ").replace("\r", " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                if (content.length === 0) {
                    content = "This is the roncli.com Blog.";
                } else if (content.length > 200) {
                    content = content.substr(0, 197).trim() + "...";
                }
                result.meta = {
                    "article:author": "http://www.facebook.com/roncli",
                    "article:published_time": moment(post.published * 1000).format(),
                    "article:publisher": "http://www.facebook.com/roncli",
                    "article:section": "Blog",
                    "article:tag": post.categories,
                    "og:description": content,
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": post.blogTitle || "The roncli.com Blog",
                    "og:type": "article",
                    "og:url": "http://" + app.req.headers.host + "/" + params[0],
                    "twitter:card": "summary",
                    "twitter:description": content,
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": post.blogTitle || "The roncli.com Blog",
                    "twitter:url": "http://" + app.req.headers.host + "/" + params[0]
                };
            }
            callback(err, result);
        });
    }
};
