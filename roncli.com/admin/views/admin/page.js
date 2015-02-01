/*global bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone");

// Sets up the admin view.
module.exports = BaseView.extend({
    className: "admin_page_view",

    events: {
        "click button.delete-page": "deletePage",
        "click button#move-page": "movePage",
        "click button#add-page": "addPage",
        "keyup textarea#pageContent": "pageContentChanged",
        "change textarea#pageContent": "pageContentChanged",
        "click button#page-save": "pageSave"
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
                                    message = "There was a server error deleting the page.  Please try again later.";
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

    movePage: function() {
        "use strict";

        var app = this.app,
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

                bootbox.dialog({
                    title: "Error",
                    message: app.templateAdapter.getTemplate("admin/error")({message: message}),
                    buttons: {ok: {label: "OK"}},
                    show: false
                }).off("shown.bs.modal").modal("show");

                movePage.prop("disabled", false);
            }
        });
    },

    addPage: function() {
        "use strict";

        var url = $("#addPageUrl").val(),
            path;

        if (url.length <= 1 || url.substring(0, 1) !== "/") {
            bootbox.dialog({
                title: "Error",
                message: this.app.templateAdapter.getTemplate("admin/error")({message: "You must enter a valid URL."}),
                buttons: {ok: {label: "OK"}},
                show: false
            }).off("shown.bs.modal").modal("show");

            return;
        }

        if (this.options.url === url) {
            bootbox.dialog({
                title: "Error",
                message: this.app.templateAdapter.getTemplate("admin/error")({message: "Please use a URL other than the current URL."}),
                buttons: {ok: {label: "OK"}},
                show: false
            }).off("shown.bs.modal").modal("show");

            return;
        }

        this.app.parentPageId = this.options.page.get("id");
        this.app.router.navigate("/admin/page" + url, {trigger: true});
    },

    postRender: function() {
        "use strict";

        $("#add-new-page").defaultButton("#add-page");
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
            $("#preview").html($("#pageContent").val());
        }, 1000);
    },

    pageSave: function() {
        "use strict";

        var app = this.app,
            pageId = +$("div.page").data("page-id"),
            pageSave = $("#page-save"),
            url = $("#pageUrl").val(),
            title = $("#pageTitle").val(),
            shortTitle = $("#pageShortTitle").val(),
            content = $("#pageContent").val(),
            admin = new Admin(),
            adminUrl, data;

        if (url.length <= 1 || url.substring(0, 1) !== "/") {
            bootbox.dialog({
                title: "Error",
                message: this.app.templateAdapter.getTemplate("admin/error")({message: "You must enter a valid URL."}),
                buttons: {ok: {label: "OK"}},
                show: false
            }).off("shown.bs.modal").modal("show");

            return;
        }

        if (title.length === 0) {
            bootbox.dialog({
                title: "Error",
                message: this.app.templateAdapter.getTemplate("admin/error")({message: "You must enter a title."}),
                buttons: {ok: {label: "OK"}},
                show: false
            }).off("shown.bs.modal").modal("show");

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
                    backbone.history.loadUrl(path);
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

                bootbox.dialog({
                    title: "Error",
                    message: app.templateAdapter.getTemplate("admin/error")({message: message}),
                    buttons: {ok: {label: "OK"}},
                    show: false
                }).off("shown.bs.modal").modal("show");

                pageSave.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/page";
