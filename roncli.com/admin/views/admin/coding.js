/*globals bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin");

// Sets up the default admin view.
module.exports = BaseView.extend({
    className: "admin_coding_view",

    events: {
        "click button#clear-caches": "clearCaches"
    },

    clearCaches: function() {
        "use strict";

        var clearCaches = $("button#clear-caches"),
            admin = new Admin(),
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

                bootbox.dialog({
                    title: "Error",
                    message: app.templateAdapter.getTemplate("admin/error")({message: message}),
                    buttons: {ok: {label: "OK"}},
                    show: false
                }).off("shown.bs.modal").modal("show");

                clearCaches.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/coding";
