/*globals bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone");

// Sets up the admin view.
module.exports = BaseView.extend({
    className: "admin_pages_view",

    events: {
        "click button.delete-page": "deletePage",
        "click button#add-page": "addPage"
    },

    postRender: function() {
        "use strict";

        $("#add-new-page").defaultButton("#add-page");
    },

    deletePage: function(ev) {
        "use strict";

        var app = this.app,
            deleteButton = $(ev.target),
            pageId = deleteButton.closest(".page-container").data("page-id"),
            admin = new Admin();

        bootbox.dialog({
            title: "Delete Page",
            message: app.templateAdapter.getTemplate("admin/pages/deleteConfirm")(),
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        deleteButton.prop("disabled", true);

                        admin.fetch({
                            url: "/admin/pages/delete-page",
                            data: JSON.stringify({pageId: pageId}),
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
                                    message = "There was a server error processing your registration.  Please try again later.";
                                }

                                bootbox.dialog({
                                    title: "Error",
                                    message: app.templateAdapter.getTemplate("admin/error")({message: message}),
                                    buttons: {ok: {label: "OK"}},
                                    show: false
                                }).off("shown.bs.modal").modal("show");

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

    addPage: function() {
        "use strict";

        var url = $("#addPageUrl").val();

        if (url.length <= 1 || url.substring(0, 1) !== "/") {
            bootbox.dialog({
                title: "Error",
                message: this.app.templateAdapter.getTemplate("admin/error")({message: "You must enter a valid URL."}),
                buttons: {ok: {label: "OK"}},
                show: false
            }).off("shown.bs.modal").modal("show");

            return;
        }

        this.app.parentPageId = null;
        this.app.router.navigate("/admin/page" + url, {trigger: true});
    }
});

module.exports.id = "admin/pages";
