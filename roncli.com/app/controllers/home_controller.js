module.exports = {
    /**
     * The default home view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            blog: {model: "Blog_GetLatest", params: {}}
        }, function(err, result) {
            if (app.req) {
                result.meta = {
                    "og:description": "This is the homepage of Ronald M. Clifford.",
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": "The roncli.com Website",
                    "og:type": "website",
                    "og:url": "http://" + app.req.headers.host,
                    "twitter:card": "summary",
                    "twitter:description": "This is the homepage of Ronald M. Clifford.",
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": "The roncli.com Website",
                    "twitter:url": "http://" + app.req.headers.host
                };
            }
            callback(err, result);
        });
    }
};
