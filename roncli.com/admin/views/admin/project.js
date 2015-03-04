var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone");

// Sets up the project admin view.
module.exports = BaseView.extend({
    className: "admin_project_view",

    events: {
        "click button#project-save": "projectSave"
    },

    projectSave: function() {
        "use strict";

        var url = $("#project-url").val(),
            title = $("#project-title").val(),
            projectUrl = $("#project-project-url").val(),
            description = $("#project-description").val(),
            projectSave = $("#project-save"),
            admin = new Admin(),
            view = this,
            app = this.app;

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
            url: "/admin/coding/update-project",
            data: JSON.stringify({
                projectId: view.options.project.get("id"),
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
                app.router.navigate("/admin/coding", {trigger: true});
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

module.exports.id = "admin/project";
