var handleServerError = require("../lib/handleServerError");

module.exports = {
    /**
     * The default gaming view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            wow: {model: "WarcraftFeed", params: {}},
            d3: {model: "DiabloProfile", params: {}},
            lol: {model: "LeagueRanked", params: {}}
        }, function(err, result) {
            if (!err && result && result.wow && result.wow.attributes && result.wow.attributes.error) {
                err = result.wow.attributes;
            }

            if (!err && result && result.d3 && result.d3.attributes && result.d3.attributes.error) {
                err = result.d3.attributes;
            }

            if (!err && result && result.lol && result.lol.attributes && result.lol.attributes.error) {
                err = result.lol.attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                result.meta = {
                    "og:description": "Games roncli plays.",
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": "roncli Gaming",
                    "og:type": "website",
                    "og:url": "http://" + app.req.headers.host + "/gaming",
                    "twitter:card": "summary",
                    "twitter:description": "Games roncli plays",
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": "roncli Gaming",
                    "twitter:url": "http://" + app.req.headers.host + "/gaming"
                };
            }
            callback(err, result);
        });
    }
};
