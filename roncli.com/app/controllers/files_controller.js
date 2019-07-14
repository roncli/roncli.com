var handleServerError = require("../lib/handleServerError");

module.exports = {
    /**
     * The default files view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            files: {collection: "Files", params: {}}
        }, function(err, result) {
            if (!err && result && result.files && result.files.models && result.files.models[0] && result.files.models[0].attributes && result.files.models[0].attributes.error) {
                err = result.files.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                result.meta = {
                    "og:description": "Files on roncli.com.",
                    "og:image": app.req.protocol + "://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": "roncli.com Files",
                    "og:type": "website",
                    "og:url": app.req.protocol + "://" + app.req.headers.host + "/files",
                    "twitter:card": "summary",
                    "twitter:description": "Files on roncli.com.",
                    "twitter:image": app.req.protocol + "://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": "roncli.com Files",
                    "twitter:url": app.req.protocol + "://" + app.req.headers.host + "/files"
                };
            }
            callback(err, result);
        });
    }
};
