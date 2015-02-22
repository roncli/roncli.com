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
            page: {model: "PageOptional", params: {url: "/music"}},
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
    },

    /**
     * The music tags view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    tag: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            page: {model: "PageOptional", params: {url: "music/tag/" + params[0]}},
            songs: {collection: "Song_ByTag", params: {tag: params[0]}}
        }, function(err, result) {
            if (app.req) {
                result.meta = {
                    "og:description": "This is the music of The Nightstalker with the " + decodeURIComponent(params[0]) + " tag.",
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": "The Home of The Nightstalker - " + decodeURIComponent(params[0]),
                    "og:type": "website",
                    "og:url": "http://" + app.req.headers.host + "/music/tag/" + decodeURIComponent(params[0]),
                    "twitter:card": "summary",
                    "twitter:description": "This is the music of The Nightstalker with the " + decodeURIComponent(params[0]) + " tag.",
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": "The Home of The Nightstalker - " + decodeURIComponent(params[0]),
                    "twitter:url": "http://" + app.req.headers.host + "/music/tag/" + decodeURIComponent(params[0])
                };
            }
            result.tag = params[0];
            callback(err, result);
        });
    }
};
