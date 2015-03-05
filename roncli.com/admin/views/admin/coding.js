/*global bootbox */

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone"),
    sortable = require("sortablejs");

// Sets up the default admin view.
module.exports = BaseView.extend({
    className: "admin_coding_view",

    events: {
        "click button#clear-caches": "clearCaches",
        "click button.unfeature-project": "unfeatureProject",
        "click button#feature-project": "featureProject",
        "click button.delete-project": "deleteProject",
        "click button#project-save": "projectSave"
    },

    postRender: function() {
        "use strict";

        var view = this;

        // Setup sortable.
        this.app.sortable = sortable.create($("#featured-projects")[0], {
            store: {
                get: function() {return [];},
                set: function(sortable) {
                    var admin = new Admin();

                    admin.fetch({
                        url: "/admin/coding/change-feature-order",
                        data: JSON.stringify({
                            order: sortable.toArray()
                        }),
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        error: function(xhr, error) {
                            var message;
                            if (error && error.body && error.body.error) {
                                message = error.body.error;
                            } else {
                                message = "There was a server error ordering the featured projects.  Please try again later.";
                            }

                            view.showError(message);
                        }
                    });
                }
            },
            filter: "button"
        });
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
                    message = "There was a server error clearing the coding caches.  Please try again later.";
                }

                view.showError(message);

                clearCaches.prop("disabled", false);
            }
        });
    },

    unfeatureProject: function(ev) {
        "use strict";

        var unfeatureButton = $(ev.target),
            projectId = unfeatureButton.closest(".featured-container").data("id"),
            view = this,
            admin = new Admin();

        unfeatureButton.prop("disabled", true);

        admin.fetch({
            url: "/admin/coding/unfeature-project",
            data: JSON.stringify({projectId: projectId}),
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
                    message = "There was a server error featuring the project.  Please try again later.";
                }

                view.showMessage(message);

                unfeatureButton.prop("disabled", false);
            }
        });
    },

    featureProject: function() {
        "use strict";

        var view = this,
            featureProject = $("#feature-project"),
            projectId = $("#feature-project-list").val(),
            admin = new Admin();

        if (!projectId) {
            return;
        }

        featureProject.prop("disabled", true);

        admin.fetch({
            url: "/admin/coding/feature-project",
            data: JSON.stringify({projectId: projectId}),
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
                    message = "There was a server error featuring the project.  Please try again later.";
                }

                view.showMessage(message);

                featureProject.prop("disabled", false);
            }
        });
    },

    deleteProject: function(ev) {
        "use strict";

        var view = this,
            app = this.app,
            deleteButton = $(ev.target),
            projectId = deleteButton.closest(".project-container").data("id"),
            admin = new Admin();

        bootbox.dialog({
            title: "Delete Project",
            message: app.templateAdapter.getTemplate("admin/coding/deleteConfirm")(),
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        deleteButton.prop("disabled", true);

                        admin.fetch({
                            url: "/admin/coding/delete-project",
                            data: JSON.stringify({projectId: projectId}),
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
                                    message = "There was a server error deleting the project.  Please try again later.";
                                }

                                view.showError(message);

                                deleteButton.prop("disabled", false);
                            }
                        });
                    }
                },
                no: {label: "No"}
            },
            show: false
        }).off("shown.bs.modal").modal("show");
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

        if (!/^\/project\//.test(url)) {
            this.showError("Projects must exist under the /project/ directory.");
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
                    message = "There was a server error saving the project.  Please try again later.";
                }

                view.showMessage(message);

                projectSave.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/coding";
