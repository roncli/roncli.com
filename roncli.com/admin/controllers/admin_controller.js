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
     * The files admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    files: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            files: {collection: "Admin_Files", params: {}}
        }, {readFromCache: false, writeToCache: false}, function(err, result) {
            if (!err && result && result.files && result.files.models && result.files.models[0] && result.files.models[0].attributes && result.files.models[0].attributes.error) {
                err = result.files.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
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
    },

    /**
     * The coding admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    coding: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            projects: {collection: "Admin_Projects", params: {}},
            unfeatured: {collection: "Admin_Project_GetUnfeatured", params: {}},
            featured: {collection: "Admin_Project_GetFeatured", params: {}}
        }, {readFromCache: false, writeToCache: false}, function(err, result) {
            if (!err && result && result.projects && result.projects.models && result.projects.models[0] && result.projects.models[0].attributes && result.projects.models[0].attributes.error) {
                err = result.projects.models[0].attributes;
            }

            if (!err && result && result.unfeatured && result.unfeatured.models && result.unfeatured.models[0] && result.unfeatured.models[0].attributes && result.unfeatured.models[0].attributes.error) {
                err = result.unfeatured.models[0].attributes;
            }

            if (!err && result && result.featured && result.featured.models && result.featured.models[0] && result.featured.models[0].attributes && result.featured.models[0].attributes.error) {
                err = result.featured.models[0].attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            callback(err, result);
        });
    },

    /**
     * The project admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    project: function(params, callback) {
        "use strict";

        var app = this.app;

        app.fetch({
            project: {model: "Admin_Project", params: {url: params[0]}}
        }, {readFromCache: false, writeToCache: false}, function(err, result) {
            if (!err && result && result.project && result.project.attributes && result.project.attributes.error) {
                err = result.project.attributes;
            }

            if (err) {
                handleServerError(err, app, result, callback);
                return;
            }

            callback(err, result);
        });
    },

    /**
     * The gaming admin view.
     * @param {object} params The parameters to use in the controller.
     * @param {function} callback The callback to run upon completion of the controller running.
     */
    gaming: function(params, callback) {
        "use strict";

        callback();
    }
};
