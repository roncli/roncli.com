var handleServerError = require("app/lib/handleServerError");

module.exports = {
    /**
     * The default admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    index: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            notifications: {model: "User_GetNotifications", params: {}}
        }, {readFromCache: false, writeToCache: false}, function(err, result) {
            if (!err && result && result.notifications && result.notifications.attributes && result.notifications.attributes.error) {
                err = result.notifications.attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            callback(err, result);
        });
    },

    /**
     * The blog admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    blog: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            comments: {collection: "Admin_BlogComments", params: {}}
        }, {readFromCache: false, writeToCache: false}, function(err, result) {
            if (!err && result && result.comments && result.comments.models && result.comments.models[0] && result.comments.models[0].attributes && result.comments.models[0].attributes.error) {
                err = result.comments.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            callback(err, result);
        });
    },

    /**
     * The pages admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    pages: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            pages: {model: "Admin_Pages", params: {}},
            comments: {collection: "Admin_PageComments", params: {}}
        }, {readFromCache: false, writeToCache: false}, function(err, result) {
            if (!err && result && result.pages && result.pages.attributes && result.pages.attributes.error) {
                err = result.pages.attributes;
            }

            if (!err && result && result.comments && result.comments.models && result.comments.models[0] && result.comments.models[0].attributes && result.comments.models[0].attributes.error) {
                err = result.comments.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            callback(err, result);
        });
    },

    /**
     * The page admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    page: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            page: {model: "Admin_Page", params: {url: params[0]}}
        }, {readFromCache: false, writeToCache: false}, function(err, result) {
            if (!err && result && result.page && result.page.attributes && result.page.attributes.error) {
                err = result.page.attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            if (result) {
                result.url = params[0];
            }
            callback(err, result);
        });
    },

    /**
     * The music admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    music: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            comments: {collection: "Admin_MusicComments", params: {}}
        }, {readFromCache: false, writeToCache: false}, function(err, result) {
            if (!err && result && result.comments && result.comments.models && result.comments.models[0] && result.comments.models[0].attributes && result.comments.models[0].attributes.error) {
                err = result.comments.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            callback(err, result);
        });
    }
};
