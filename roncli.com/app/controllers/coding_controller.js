var handleServerError = require("../lib/handleServerError");

module.exports = {
    /**
     * The default coding view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            page: {model: "PageOptional", params: {url: "/coding"}},
            codingEvents: {collection: "Event_GetLatest", params: {count: 100}},
            projects: {collection: "Projects", params: {}}
        }, function(err, result) {
            if (!err && result && result.page && result.page.attributes && result.page.attributes.error) {
                err = result.page.attributes;
            }

            if (!err && result && result.songs && result.songs.models && result.songs.models[0] && result.songs.models[0].attributes && result.songs.models[0].attributes.error) {
                err = result.songs.models[0].attributes;
            }

            if (!err && result && result.tags && result.tags.models && result.tags.models[0] && result.tags.models[0].attributes && result.tags.models[0].attributes.error) {
                err = result.tags.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                result.meta = {
                    "og:description": "Discover roncli's many coding projects.  See recent code commits, project releases, and more.",
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": "roncli.com Coding Projects",
                    "og:type": "website",
                    "og:url": "http://" + app.req.headers.host + "/coding",
                    "twitter:card": "summary",
                    "twitter:description": "Discover roncli's many coding projects.  See recent code commits, project releases, and more.",
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": "roncli.com Coding Projects",
                    "twitter:url": "http://" + app.req.headers.host + "/coding"
                };
            }
            callback(err, result);
        });
    },

    /**
     * The project view.
     * @param {object} params The parameters to use in the controller.
     * @param {function((null | object), object=)} callback The callback to run upon completion of the controller running.
     */
    project: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            page: {model: "PageOptional", params: {url: "/" + params[0]}},
            project: {model: "Project", params: {url: "/" + params[0]}}
        }, function(err, result) {
            var content;

            if (!err && result && result.page && result.page.attributes && result.page.attributes.error) {
                err = result.page.attributes;
            }

            if (!err && result && result.project && result.project.attributes && result.project.attributes.error) {
                err = result.project.attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (app.req) {
                content = result.project.attributes.description;
                if (content.length > 200) {
                    content = content.substr(0, 197).trim() + "...";
                }

                result.meta = {
                    "og:description": content,
                    "og:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "og:site_name": "roncli.com",
                    "og:title": result.project.attributes.title,
                    "og:type": "website",
                    "og:url": "http://" + app.req.headers.host + "/" + params[0],
                    "twitter:card": "summary",
                    "twitter:description": content,
                    "twitter:image": "http://" + app.req.headers.host + "/images/favicon.png",
                    "twitter:site": "@roncli",
                    "twitter:title": result.project.attributes.title,
                    "twitter:url": "http://" + app.req.headers.host + "/" + params[0]
                };
            }
            callback(err, result);
        });
    }
};
