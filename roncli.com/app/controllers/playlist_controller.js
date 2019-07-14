var handleServerError = require("../lib/handleServerError");

module.exports = {
    /**
     * The default playlist view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            page: {model: "PageOptional", params: {url: "/" + params[0]}},
            playlist: {model: "Playlist", params: {playlistId: params[1]}}
        }, function(err, result) {
            if (!err && result && result.page && result.page.attributes && result.page.attributes.error) {
                err = result.page.attributes;
            }

            if (!err && result && result.playlist && result.playlist.attributes && result.playlist.attributes.error) {
                err = result.playlist.attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                result.meta = {
                    "og:description": result.playlist.attributes.info.snippet.description,
                    "og:image": app.req.protocol + "://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": result.playlist.attributes.info.snippet.title,
                    "og:type": "website",
                    "og:url": app.req.protocol + "://" + app.req.headers.host + "/" + params[0],
                    "twitter:card": "summary",
                    "twitter:description": result.playlist.attributes.info.snippet.description,
                    "twitter:image": app.req.protocol + "://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": result.playlist.attributes.info.snippet.title,
                    "twitter:url": app.req.protocol + "://" + app.req.headers.host + "/" + params[0]
                };
            }
            callback(err, result);
        });
    }
};
