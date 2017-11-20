var handleServerError = require("../lib/handleServerError");

module.exports = {
    /**
     * The default view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";
        
        var app = this.app;

        app.fetch({
            page: {model: "Page", params: {url: "/" + params[0]}}
        }, function(err, result) {
            var page, content;

            if (!err && result && result.page && result.page.attributes && result.page.attributes.error) {
                err = result.page.attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            // This matched a page.
            if (app.req) {
                page = result.page.get("page");
                content = page.content.replace("\n", " ").replace("\r", " ").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                if (content.length > 200) {
                    content = content.substr(0, 197).trim() + "...";
                }

                result.meta = {
                    "article:author": "http://www.facebook.com/roncli",
                    "article:publisher": "http://www.facebook.com/roncli",
                    "og:description": content,
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": page.title,
                    "og:type": "article",
                    "og:url": "http://" + app.req.headers.host + "/" + params[0],
                    "twitter:card": "summary",
                    "twitter:description": content,
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": page.title,
                    "twitter:url": "http://" + app.req.headers.host + "/" + params[0]
                };
            }

            callback(err, "page/index", result);
        });
    }
};
