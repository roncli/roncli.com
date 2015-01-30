/*global bootbox*/
var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin");

// Sets up the blog admin view.
module.exports = BaseView.extend({
    className: "admin_blog_view",

    events: {
        "click button#clear-caches": "clearCaches",
        "click a.post-link": "openPost",
        "click button.approve-comment": "approveComment",
        "click button.reject-comment": "rejectComment"
    },

    clearCaches: function() {
        "use strict";

        var clearCaches = $("button#clear-caches"),
            admin = new Admin(),
            app = this.app;

        clearCaches.prop("disabled", true);

        admin.fetch({
            url: "/admin/blog/clear-caches",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                bootbox.dialog({
                    title: "Caches Cleared",
                    message: app.templateAdapter.getTemplate("admin/blog/cachesCleared")(),
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
    },

    openPost: function(ev) {
        "use strict";

        // Open post in new window.
        window.open($(ev.target).attr("href"), "_blank");

        // Do not open post in current window!
        return false;
    },

    approveComment: function(ev) {
        "use strict";

        this.moderateComment($(ev.target).closest(".comment-post"), "approve");
    },

    rejectComment: function(ev) {
        "use strict";

        this.moderateComment($(ev.target).closest(".comment-post"), "reject");
    },

    moderateComment: function(commentPost, action) {
        "use strict";

        var approveButton = commentPost.find(".approve-comment"),
            rejectButton = commentPost.find(".reject-comment"),
            admin = new Admin(),
            app = this.app;

        approveButton.prop("disabled", true);
        rejectButton.prop("disabled", true);

        admin.fetch({
            url: "/admin/blog/" + action + "-comment",
            data: JSON.stringify({commentId: commentPost.data("commentId")}),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                $("<div></div>").html(app.templateAdapter.getTemplate("admin/blog/" + action)).insertAfter(commentPost.find(".comment-actions"));
                approveButton.remove();
                rejectButton.remove();
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

                approveButton.prop("disabled", false);
                rejectButton.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/blog";
