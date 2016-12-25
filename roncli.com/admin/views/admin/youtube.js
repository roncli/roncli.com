/*globals bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone");

// Sets up the YouTube admin view.
module.exports = BaseView.extend({
    className: "admin_youtube_view",

    events: {
        "click button#clear-caches": "clearCaches",
        "click a.playlist-link": "openPlaylist",
        "click button.approve-comment": "approveComment",
        "click button.reject-comment": "rejectComment",
        "click button.delete-playlist": "deletePlaylist",
        "click button#add-playlist": "addPlaylist"
    },

    clearCaches: function() {
        "use strict";

        var clearCaches = $("button#clear-caches"),
            admin = new Admin(),
            view = this,
            app = this.app;

        clearCaches.prop("disabled", true);

        admin.fetch({
            url: "/admin/youtube/clear-caches",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                bootbox.dialog({
                    title: "Caches Cleared",
                    message: app.templateAdapter.getTemplate("admin/youtube/cachesCleared")(),
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
                    message = "There was a server error clearing the YouTube caches.  Please try again later.";
                }

                view.showError(message);

                clearCaches.prop("disabled", false);
            }
        });
    },

    openPlaylist: function(ev) {
        "use strict";

        // Open playlist in new window.
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
            view = this,
            app = this.app;

        approveButton.prop("disabled", true);
        rejectButton.prop("disabled", true);

        admin.fetch({
            url: "/admin/youtube/" + action + "-comment",
            data: JSON.stringify({commentId: commentPost.data("commentId")}),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                $("<div></div>").html(app.templateAdapter.getTemplate("admin/youtube/" + action)).insertAfter(commentPost.find(".comment-actions"));
                approveButton.remove();
                rejectButton.remove();
            },
            error: function(xhr, error) {
                var message;
                if (error && error.body && error.body.error) {
                    message = error.body.error;
                } else {
                    message = "There was a server error moderating the comment.  Please try again later.";
                }

                view.showError(message);

                approveButton.prop("disabled", false);
                rejectButton.prop("disabled", false);
            }
        });
    },

    deletePlaylist: function(ev) {
        "use strict";

        var view = this,
            app = this.app,
            deletePlaylist = $(ev.target),
            admin = new Admin();

        bootbox.dialog({
            title: "Delete Playlist",
            message: app.templateAdapter.getTemplate("admin/youtube/deleteConfirm")(),
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        deletePlaylist.prop("disabled", true);

                        admin.fetch({
                            url: "/admin/youtube/delete-playlist",
                            data: JSON.stringify({playlistId: deletePlaylist.closest("div.playlist").data("playlist-id")}),
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
                                    message = "There was a server error deleting the playlist.  Please try again later.";
                                }

                                view.showError(message);

                                deletePlaylist.prop("disabled", false);
                            }
                        });
                    }
                },
                no: {label: "No"}
            },
            show: false
        }).off("shown.bs.modal").modal("show");
    },

    addPlaylist: function() {
        "use strict";

        var view = this,
            addPlaylist = $("div#add-playlist"),
            admin = new Admin();

        addPlaylist.prop("disabled", true);

        admin.fetch({
            url: "/admin/youtube/add-playlist",
            data: JSON.stringify({playlistId: $("input#playlist-id").val()}),
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
                    message = "There was a server error adding the playlist.  Please try again later.";
                }

                view.showError(message);

                addPlaylist.prop("disabled", false);
            }
        });
    },
});

module.exports.id = "admin/youtube";
