/*globals bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone");

// Sets up the redirect admin view.
module.exports = BaseView.extend({
    className: "admin_redirect_view",

    events: {
        "click button.remove-redirect": "removeRedirect",
        "click button#add-redirect": "addRedirect"
    },

    removeRedirect: function(ev) {
        "use strict";

        var view = this,
            app = this.app,
            removeRedirect = $(ev.target),
            admin = new Admin();

        bootbox.dialog({
            title: "Remove Redirect",
            message: app.templateAdapter.getTemplate("admin/redirect/deleteConfirm")(),
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        removeRedirect.prop("disabled", true);

                        admin.fetch({
                            url: "/admin/redirect/remove-redirect",
                            data: JSON.stringify({redirectId: removeRedirect.closest("div.redirect").data("redirect-id")}),
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
                                    message = "There was a server error removing the redirect.  Please try again later.";
                                }

                                view.showError(message);

                                removeRedirect.prop("disabled", false);
                            }
                        });
                    }
                },
                no: {label: "No"}
            },
            show: false
        }).off("shown.bs.modal").modal("show");
    },

    addRedirect: function() {
        "use strict";

        var view = this,
            addRedirect = $("div#add-redirect"),
            admin = new Admin();

        addRedirect.prop("disabled", true);

        admin.fetch({
            url: "/admin/redirect/add-redirect",
            data: JSON.stringify({
                fromPath: $("#redirect-from-path").val().toLowerCase(),
                toUrl: $("#redirect-to-url").val()
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
                    message = "There was a server error adding the redirect.  Please try again later.";
                }

                view.showError(message);

                addRedirect.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/redirect";
