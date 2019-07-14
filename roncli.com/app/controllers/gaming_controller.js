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
            page: {model: "PageOptional", params: {url: "/gaming"}},
            sixGamingPodcast: {model: "Video", params: {playlistId: "PLzcYb51h4me8-Jq9mOk6Vk1MLodmhRZ6K"}},
            wow: {collection: "WarcraftFeedData", params: {}},
            wowVideo: {model: "Video", params: {playlistId: "PLoqgd0t_KsN4SzIkVVyPVt7UuT3d6Rr7G"}},
            d3: {collection: "DiabloProfiles", params: {}},
            d3Video: {model: "Video", params: {playlistId: "PLoqgd0t_KsN7LEYsVepkfbn2xOiC5M5yY"}},
            dcl: {collection: "DclPilotData", params: {}},
            descentVideo: {model: "Video", params: {playlistId: "PLoqgd0t_KsN5pPPi0xKz7NfByO4mJvi27"}},
            steam: {collection: "SteamGames", params: {}}
        }, function(err, result) {
            if (!err && result && result.page && result.page.attributes && result.page.attributes.error) {
                err = result.page.attributes;
            }

            if (!err && result && result.sixGamingPodcast && result.sixGamingPodcast.attributes && result.sixGamingPodcast.attributes.error) {
                err = result.sixGamingPodcast.attributes;
            }

            if (!err && result && result.wow && result.wow.models && result.wow.models[0] && result.wow.models[0].attributes && result.wow.models[0].attributes.error) {
                result.wowMissing = true;
            }

            if (!err && result && result.wowVideo && result.wowVideo.attributes && result.wowVideo.attributes.error) {
                err = result.wowVideo.attributes;
            }

            if (!err && result && result.d3 && result.d3.models && result.d3.models[0] && result.d3.models[0].attributes && result.d3.models[0].attributes.error) {
                result.d3Missing = true;
            }

            if (!err && result && result.d3Video && result.d3Video.attributes && result.d3Video.attributes.error) {
                err = result.d3Video.attributes;
            }

            if (!err && result && result.dcl && result.dcl.models && result.dcl.models[0] && result.dcl.models[0].attributes && result.dcl.models[0].attributes.error) {
                result.dclMissing = true;
            }

            if (!err && result && result.descentVideo && result.descentVideo.attributes && result.descentVideo.attributes.error) {
                err = result.descentVideo.attributes;
            }

            if (!err && result && result.steam && result.steam.models && result.steam.models[0] && result.steam.models[0].attributes && result.steam.models[0].attributes.error) {
                result.steamMissing = true;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                result.meta = {
                    "og:description": "Games roncli plays.",
                    "og:image": app.req.protocol + "://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": "roncli Gaming",
                    "og:type": "website",
                    "og:url": app.req.protocol + "://" + app.req.headers.host + "/gaming",
                    "twitter:card": "summary",
                    "twitter:description": "Games roncli plays",
                    "twitter:image": app.req.protocol + "://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": "roncli Gaming",
                    "twitter:url": app.req.protocol + "://" + app.req.headers.host + "/gaming"
                };
            }
            callback(err, result);
        });
    },

    /**
     * The default game view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    game: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            page: {model: "PageOptional", params: {url: "/" + params[0]}},
            game: {model: "SteamGame", params: {gameId: params[1]}}
        }, function(err, result) {
            if (!err && result && result.page && result.page.attributes && result.page.attributes.error) {
                err = result.page.attributes;
            }

            if (!err && result && result.game && result.game.attributes && result.game.attributes.error) {
                err = result.game.attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                result.meta = {
                    "og:description": "roncli's game stats for " + result.game.attributes.name,
                    "og:image": app.req.protocol + "://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": result.game.attributes.name,
                    "og:type": "website",
                    "og:url": app.req.protocol + "://" + app.req.headers.host + "/" + params[0],
                    "twitter:card": "summary",
                    "twitter:description": "roncli's game stats for " + result.game.attributes.name,
                    "twitter:image": app.req.protocol + "://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": result.game.attributes.name,
                    "twitter:url": app.req.protocol + "://" + app.req.headers.host + "/" + params[0]
                };
            }
            callback(err, result);
        });
    }
};
