/*global bootbox*/

var BaseView = require("./base"),
    $ = require("jquery");

// Sets up the admin view.
module.exports = BaseView.extend({
    className: "admin_page_view",

    events: {
        "click button#add-page": "addPage",
        "keyup textarea#pageContent": "pageContentChanged",
        "change textarea#pageContent": "pageContentChanged"
    },

    postRender: function() {
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
    }
});

module.exports.id = "admin/page";
