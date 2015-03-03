/*global bootbox */

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone");

    // Sets up the default admin view.
module.exports = BaseView.extend({
    className: "admin_coding_view",

    events: {
        "click button#clear-caches": "clearCaches",
        "click button#project-save": "projectSave"
    },

    clearCaches: function() {
        "use strict";

        var clearCaches = $("button#clear-caches"),
            admin = new Admin(),
            view = this,
            app = this.app;

        clearCaches.prop("disabled", true);

        admin.fetch({
            url: "/admin/coding/clear-caches",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                bootbox.dialog({
                    title: "Caches Cleared",
                    message: app.templateAdapter.getTemplate("admin/coding/cachesCleared")(),
                    buttons: {ok: {label: "OK"}},
                    show: false
                }).off("shown.bs.modal").modal("show");

                clearCaches.prop("disabled", false);
            },
            error: function(xhr, error) {
                var message;
                if (error && error.body && error.body.error) {
                    message = error.body.error;
                } else {
                    message = "There was a server error processing your registration.  Please try again later.";
                }

                view.showError(message);

                clearCaches.prop("disabled", false);
            }
        });
    },

    projectSave: function() {
        "use strict";

        var url = $("#project-url").val(),
            title = $("#project-title").val(),
            projectUrl = $("#project-project-url").val(),
            description = $("#project-description").val(),
            projectSave = $("#project-save"),
            admin = new Admin(),
            view = this;

        if (url.length <= 1 || url.substring(0, 1) !== "/") {
            this.showError("You must enter a valid URL.");
            return;
        }

        if (title.length === 0) {
            this.showError("You must enter a title.");
            return;
        }

        if (projectUrl.length > 0 && (projectUrl.length <= 7 || !/^https?:\/\//.test(projectUrl))) {
            this.showError("You must enter a valid project URL.");
            return;
        }

        if (description.length === 0) {
            this.showError("You must enter a description.");
            return;
        }

        projectSave.prop("disabled", true);

        admin.fetch({
            url: "/admin/coding/add-project",
            data: JSON.stringify({
                url: url,
                title: title,
                projectUrl: projectUrl,
                user: $("#project-user").val(),
                repository: $("#project-repository").val(),
                description: description
            }),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                backbone.history.loadUrl(window.location.pathname);
            },
            error: function(xhr, error) {
                var message;
                if (error && error.body && error.body.error) {
                    message = error.body.error;
                } else {
                    message = "There was a server error saving the page.  Please try again later.";
                }

                view.showMessage(message);

                projectSave.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/coding";
