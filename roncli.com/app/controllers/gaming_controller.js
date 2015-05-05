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
            sixGamingPodcast: {model: "Video", params: {playlistId: "PLzcYb51h4me8-Jq9mOk6Vk1MLodmhRZ6K"}},
            wow: {model: "WarcraftFeed", params: {}},
            wowVideo: {model: "Video", params: {playlistId: "PLoqgd0t_KsN4SzIkVVyPVt7UuT3d6Rr7G"}},
            d3: {collection: "DiabloProfiles", params: {}},
            d3Video: {model: "Video", params: {playlistId: "PLoqgd0t_KsN7LEYsVepkfbn2xOiC5M5yY"}},
            lol: {model: "LeagueRanked", params: {}},
            lolVideo: {model: "Video", params: {playlistId: "PLoqgd0t_KsN5YU7YGjhofQ7DJTt8pV4OZ"}}
        }, function(err, result) {
            if (!err && result && result.sixGamingPodcast && result.sixGamingPodcast.attributes && result.sixGamingPodcast.attributes.error) {
                err = result.sixGamingPodcast.attributes;
            }

            if (!err && result && result.wow && result.wow.attributes && result.wow.attributes.error) {
                err = result.wow.attributes;
            }

            if (!err && result && result.wowVideo && result.wowVideo.attributes && result.wowVideo.attributes.error) {
                err = result.wowVideo.attributes;
            }

            if (!err && result && result.d3 && result.d3.models && result.d3.models[0] && result.d3.models[0].attributes && result.d3.models[0].attributes.error) {
                err = result.d3.models[0].attributes;
            }

            if (!err && result && result.d3Video && result.d3Video.attributes && result.d3Video.attributes.error) {
                err = result.d3Video.attributes;
            }

            if (!err && result && result.lol && result.lol.attributes && result.lol.attributes.error) {
                err = result.lol.attributes;
            }

            if (!err && result && result.lolVideo && result.lolVideo.attributes && result.lolVideo.attributes.error) {
                err = result.lolVideo.attributes;
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
