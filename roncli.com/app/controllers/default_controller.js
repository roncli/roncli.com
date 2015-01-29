module.exports = {
    /**
     * The default view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";
        
        var app = this.app;

        app.fetch({
            page: {model: "Page", params: {url: "/" + params[0]}}
        }, function(err, result) {
            var page, content;

            // On the server, a 404 is sent as a valid result.  We need to check for this and set err to the result's attributes if this is the case.
            // On the client, if there is an error, it is sent under err, and therefore we don't want to mess with it.
            if (!err && result && result.page && result.page.attributes && result.page.attributes.error) {
                err = result.page.attributes;
            }

            if (err) {
                result = {error: true};
                if (err.status) {
                    // This is a known error.
                    if (app && app.req && app.req.res) {
                        app.req.res.status(err.status);
                    }

                    result["status" + err.status] = true;
                    callback(null, result);
                    return;
                }

                // This is an unknown error.
                if (app && app.req && app.req.res) {
                    app.req.res.status(500);
                }
                callback(null, result);
                return;
            }

            // This matched a page.
            result.error = false;
            if (app.req) {
                page = result.page.get("page");
                content = page.content.replace("\n", " ").replace("\r", " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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

            callback(err, result);
        });
    }
};
