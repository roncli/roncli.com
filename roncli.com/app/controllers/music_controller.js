module.exports = {
    /**
     * The music view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            page: {model: "Page", params: {url: "/music"}},
            songs: {collection: "Song_GetLatest", params: {count: 6}},
            tags: {collection: "SongTags", params: {}}
        }, function(err, result) {
            if (app.req) {
                result.meta = {
                    "og:description": "This is the home of roncli, The Nightstalker.  Listen to all of The Nightstalker's releases here.",
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": "The Home of The Nightstalker",
                    "og:type": "website",
                    "og:url": "http://" + app.req.headers.host + "/music",
                    "twitter:card": "summary",
                    "twitter:description": "This is the home of roncli, The Nightstalker.  Listen to all of The Nightstalker's releases here.",
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": "The Home of The Nightstalker",
                    "twitter:url": "http://" + app.req.headers.host + "/music"
                };
            }
            callback(err, result);
        });
    }
};
