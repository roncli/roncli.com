/*globals bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone"),
    sortable = require("sortablejs");

// Sets up the pages admin view.
module.exports = BaseView.extend({
    className: "admin_pages_view",

    events: {
        "click button.remove-life-feature": "removeLifeFeature",
        "click button#add-life-feature": "addLifeFeature",
        "click button.delete-page": "deletePage",
        "click button#move-page": "movePage",
        "click button#add-page": "addPage",
        "click a.page-link": "openPage",
        "click button.approve-comment": "approveComment",
        "click button.reject-comment": "rejectComment"
    },

    postRender: function() {
        "use strict";

        var view = this;

        $("#add-new-page").defaultButton("#add-page");

        // Setup sortable.
        this.app.sortable = sortable.create($("#feature-list")[0], {
            store: {
                get: function() {return [];},
                set: function(sortable) {
                    var admin = new Admin();

                    admin.fetch({
                        url: "/admin/pages/change-life-feature-order",
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
                                message = "There was a server error ordering the features.  Please try again later.";
                            }

                            view.showError(message);
                        }
                    });
                }
            },
            filter: "button"
        });
    },

    removeLifeFeature: function(ev) {
        "use strict";

        var view = this,
            removeButton = $(ev.target),
            featureId = removeButton.closest(".feature-container").data("id"),
            admin = new Admin();

        removeButton.prop("disabled", true);

        admin.fetch({
            url: "/admin/pages/remove-life-feature",
            data: JSON.stringify({featureId: featureId}),
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
                    message = "There was a server error removing the life feature.  Please try again later.";
                }

                view.showError(message);

                removeButton.prop("disabled", false);
            }
        });
    },

    addLifeFeature: function(ev) {
        "use strict";

        var view = this,
            addButton = $(ev.target),
            pageId = $("#add-life-feature-list").val(),
            admin = new Admin();

        addButton.prop("disabled", true);

        admin.fetch({
            url: "/admin/pages/add-life-feature",
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
                    message = "There was a server error adding a life feature.  Please try again later.";
                }

                view.showError(message);

                addButton.prop("disabled", false);
            }
        });
    },

    deletePage: function(ev) {
        "use strict";

        var view = this,
            app = this.app,
            deleteButton = $(ev.target),
            pageId = deleteButton.closest(".page-container").data("id"),
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
                                    message = "There was a server error deleting the page.  Please try again later.";
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

    movePage: function() {
        "use strict";

        var view = this,
            movePage = $("#move-page"),
            pageId = $("#move-page-list").val(),
            admin = new Admin();

        if (!pageId) {
            return;
        }

        movePage.prop("disabled", true);

        admin.fetch({
            url: "/admin/pages/move-page",
            data: JSON.stringify({
                pageId: pageId,
                parentPageId: null
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
                    message = "There was a server error moving the page.  Please try again later.";
                }

                view.showError(message);

                movePage.prop("disabled", false);
            }
        });
    },

    addPage: function() {
        "use strict";

        var url = $("#add-page-url").val();

        if (url.length <= 1 || url.substring(0, 1) !== "/") {
            this.showError("You must enter a valid URL.");
            return;
        }

        this.app.parentPageId = null;
        this.app.router.navigate("/admin/page" + url, {trigger: true});
    },

    openPage: function(ev) {
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
            view = this,
            app = this.app;

        approveButton.prop("disabled", true);
        rejectButton.prop("disabled", true);

        admin.fetch({
            url: "/admin/pages/" + action + "-comment",
            data: JSON.stringify({commentId: commentPost.data("commentId")}),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                $("<div></div>").html(app.templateAdapter.getTemplate("admin/pages/" + action)).insertAfter(commentPost.find(".comment-actions"));
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
    }
});

module.exports.id = "admin/pages";
