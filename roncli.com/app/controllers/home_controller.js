var handleServerError = require("../lib/handleServerError");

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
            blog: {collection: "Blog_GetLatest", params: {}},
            songs: {collection: "Song_GetLatest", params: {count: 3}},
            classics: {collection: "Song_GetLatestByTag", params: {tag: "Classic", count:3}},
            codingEvents: {collection: "Event_GetLatest", params: {count: 4}},
            projects: {collection: "Project_GetFeatured", params: {count: 3}},
            wow: {collection: "WarcraftFeedSummary_GetLatest", params: {}},
            d3: {collection: "DiabloProfileSummary_GetMain", params: {}},
            dcl: {collection: "DclPilotSummary_GetLatest", params: {}},
            life: {collection: "LifeFeatures", params: {}}
        }, function(err, result) {
            if (!err && result && result.blog && result.blog.models && result.blog.models[0] && result.blog.models[0].attributes && result.blog.models[0].attributes.error) {
                err = result.blog.models[0].attributes;
            }

            if (!err && result && result.songs && result.songs.models && result.songs.models[0] && result.songs.models[0].attributes && result.songs.models[0].attributes.error) {
                err = result.songs.models[0].attributes;
            }

            if (!err && result && result.classics && result.classics.models && result.classics.models[0] && result.classics.models[0].attributes && result.classics.models[0].attributes.error) {
                err = result.classics.models[0].attributes;
            }

            if (!err && result && result.codingEvents && result.codingEvents.models && result.codingEvents.models[0] && result.codingEvents.models[0].attributes && result.codingEvents.models[0].attributes.error) {
                err = result.codingEvents.models[0].attributes;
            }

            if (!err && result && result.projects && result.projects.models && result.projects.models[0] && result.projects.models[0].attributes && result.projects.models[0].attributes.error) {
                err = result.projects.models[0].attributes;
            }

            if (!err && result && result.wow && result.wow.models && result.wow.models[0] && result.wow.models[0].attributes && result.wow.models[0].attributes.error) {
                err = result.wow.models[0].attributes;
            }

            if (!err && result && result.d3 && result.d3.models && result.d3.models[0] && result.d3.models[0].attributes && result.d3.models[0].attributes.error) {
                err = result.d3.models[0].attributes;
            }

            if (!err && result && result.dcl && result.dcl.models && result.dcl.models[0] && result.dcl.models[0].attributes && result.dcl.models[0].attributes.error) {
                err = result.dcl.models[0].attributes;
            }

            if (!err && result && result.life && result.life.models && result.life.models[0] && result.life.models[0].attributes && result.life.models[0].attributes.error) {
                err = result.life.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

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
