/*global bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone"),
    sortable = require("sortablejs");

// Sets up the page admin view.
module.exports = BaseView.extend({
    className: "admin_page_view",

    events: {
        "click button.delete-page": "deletePage",
        "click button#move-page": "movePage",
        "click button#add-page": "addPage",
        "keyup textarea#page-content": "pageContentChanged",
        "change textarea#page-content": "pageContentChanged",
        "click button#page-save": "pageSave"
    },

    postRender: function() {
        "use strict";

        var view = this,
            app = this.app,
            pageList = $("#page-list");

        $("#add-new-page").defaultButton("#add-page");

        // Setup sortable.
        if (pageList.length > 0) {
            app.sortable = sortable.create(pageList[0], {
                store: {
                    get: function() {
                        return [];
                    },
                    set: function(sortable) {
                        var admin = new Admin();

                        admin.fetch({
                            url: "/admin/pages/change-order",
                            data: JSON.stringify({
                                pageId: view.options.page.get("id"),
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
                                    message = "There was a server error ordering the pages.  Please try again later.";
                                }

                                view.showError(message);
                            }
                        });
                    }
                },
                filter: "button"
            });
        }
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
                parentPageId: this.options.page.get("id")
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

        if (this.options.url === url) {
            this.showError("Please use a URL other than the current URL.");
            return;
        }

        this.app.parentPageId = this.options.page.get("id");
        this.app.router.navigate("/admin/page" + url, {trigger: true});
    },

    pageContentChanged: function() {
        "use strict";

        var view = this,
            app = this.app;

        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }

        this.previewTimeout = setTimeout(function() {
            if (view !== app.router.currentView) {
                return;
            }
            $("#preview").html($("#page-content").val());
        }, 1000);
    },

    pageSave: function() {
        "use strict";

        var view = this,
            app = this.app,
            pageId = +$("div.page").data("page-id"),
            pageSave = $("#page-save"),
            url = $("#page-url").val(),
            title = $("#page-title").val(),
            shortTitle = $("#page-short-title").val(),
            content = $("#page-content").val(),
            admin = new Admin(),
            adminUrl, data;

        if (url.length <= 1 || url.substring(0, 1) !== "/") {
            this.showError("You must enter a valid URL.");
            return;
        }

        if (title.length === 0) {
            this.showError("You must enter a title.");
            return;
        }

        pageSave.prop("disabled", true);

        if (pageId) {
            adminUrl = "/admin/pages/update-page";
            data = {
                pageId: pageId,
                url: url,
                title: title,
                shortTitle: shortTitle,
                content: content
            };
        } else {
            adminUrl = "/admin/pages/add-page";
            data = {
                parentPageId: app.parentPageId,
                url: url,
                title: title,
                shortTitle: shortTitle,
                content: content
            };
        }

        admin.fetch({
            url: adminUrl,
            data: JSON.stringify(data),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                var path = "/admin/page" + url;
                if (window.location.pathname === path) {
                    backbone.history.loadUrl(window.location.pathname);
                } else {
                    app.router.navigate(path, {trigger: true});
                }
            },
            error: function(xhr, error) {
                var message;
                if (error && error.body && error.body.error) {
                    message = error.body.error;
                } else {
                    message = "There was a server error saving the page.  Please try again later.";
                }

                view.showMessage(message);

                pageSave.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/page";
