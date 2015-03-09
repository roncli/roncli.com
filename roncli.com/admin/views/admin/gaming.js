/*globals bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin");

// Sets up the gaming admin view.
module.exports = BaseView.extend({
    className: "admin_gaming_view",

    events: {
        "click button#clear-caches": "clearCaches"
    },

    clearCaches: function() {
        "use strict";

        var clearCaches = $("button#clear-caches"),
            admin = new Admin(),
            view = this,
            app = this.app;

        clearCaches.prop("disabled", true);

        admin.fetch({
            url: "/admin/gaming/clear-caches",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                bootbox.dialog({
                    title: "Caches Cleared",
                    message: app.templateAdapter.getTemplate("admin/gaming/cachesCleared")(),
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
                    message = "There was a server error clearing the gaming caches.  Please try again later.";
                }

                view.showError(message);

                clearCaches.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/gaming";
