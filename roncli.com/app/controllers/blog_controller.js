var moment = require("moment");

module.exports = {
    /**
     * The blog page view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var app = this.app,
            data = {
                blog: {model: "Blog_GetLatest", params: {}},
                categories: {collection: "BlogCategories", params: {}}
            };

        app.fetch(data, function(err, result) {
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

        var app = this.app,
            data = {
                blog: {model: "Blog_GetLatestByCategory", params: {category: params[0]}},
                categories: {collection: "BlogCategories", params: {}}
            };

        app.fetch(data, function(err, result) {
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

        var app = this.app,
            data = {
                blog: {model: "Blog_GetFromUrl", params: {url: params[0]}},
                categories: {collection: "BlogCategories", params: {}}
            };

        app.fetch(data, function(err, result) {
            if (app.req) {
                // TODO: Descriptions should be first 200 chars of the article, text only.
                result.meta = {
                    "article:author": "http://www.facebook.com/roncli",
                    "article:published_time": moment(result.blog.get("post").published * 1000).format(),
                    "article:publisher": "http://www.facebook.com/roncli",
                    "article:section": "Blog",
                    "article:tag": result.blog.get("post").categories,
                    "og:description": "This is the roncli.com Blog.",
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": result.blog.get("post").blogTitle || "The roncli.com Blog",
                    "og:type": "article",
                    "og:url": "http://" + app.req.headers.host + "/" + params[0],
                    "twitter:card": "summary",
                    "twitter:description": "This is the roncli.com Blog.",
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": result.blog.get("post").blogTitle || "The roncli.com Blog",
                    "twitter:url": "http://" + app.req.headers.host + "/" + params[0]
                };
            }
            callback(err, result);
        });
    }
};
