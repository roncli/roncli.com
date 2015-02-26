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
            page: {model: "PageOptional", params: {url: "/music/tag/" + params[0]}},
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
    },

    /**
     * The page view for specific songs.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    url: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            page: {model: "PageOptional", params: {url: "/" + params[0]}},
            song: {model: "Song_GetFromUrl", params: {url: "/" + params[0]}}
        }, function(err, result) {
            var content;

            if (app.req) {
                content = result.song.attributes.description.replace("\n", " ").replace("\r", " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                if (content.length === 0) {
                    content = "Listen to " + result.song.attributes.title + " by The Nightstalker.";
                } else if (content.length > 200) {
                    content = content.substr(0, 197).trim() + "...";
                }

                result.meta = {
                    "og:description": content,
                    "og:image": result.song.attributes.artwork_url,
                    "og:site_name": "roncli.com",
                    "og:title": result.song.attributes.title,
                    "og:type": "soundcloud:sound",
                    "og:url": "http://" + app.req.headers.host + "/" + params[0],
                    "og:video": "http://player.soundcloud.com/player.swf?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F" + result.song.attributes.id + "&auto_play=false&show_artwork=true&visual=true&color=3b5998&origin=facebook",
                    "og:video:height": "98",
                    "og:video:type": "application/x-shockwave-flash",
                    "og:video:width": "460",
                    "twitter:app:url:googleplay": "soundcloud://sounds:" + result.song.attributes.id,
                    "twitter:app:url:ipad": "soundcloud://sounds:" + result.song.attributes.id,
                    "twitter:app:url:iphone": "soundcloud://sounds:" + result.song.attributes.id,
                    "twitter:audio:artist_name": "roncli, The Nightstalker",
                    "twitter:audio:partner": "SoundCloud",
                    "twitter:audio:source": "https://api-partners.soundcloud.com/twitter/tracks/soundcloud:sounds:" + result.song.attributes.id + "/vmap",
                    "twitter:card": "audio",
                    "twitter:description": content,
                    "twitter:image": result.song.attributes.artwork_url,
                    "twitter:player": "https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F" + result.song.attributes.id + "&auto_play=false&show_artwork=true&visual=true&origin=twitter",
                    "twitter:player:height": "400",
                    "twitter:player:width": "435",
                    "twitter:site": "@roncli",
                    "twitter:title": result.song.attributes.title,
                    "twitter:url": "http://" + app.req.headers.host + "/" + params[0]
                };
            }
            callback(err, result);
        });
    }
};
