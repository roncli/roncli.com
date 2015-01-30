/*globals bootbox*/

var BaseView = require("./base"),
    $ = require("jquery");

// Sets up the admin view.
module.exports = BaseView.extend({
    className: "admin_pages_view",

    events: {
        "click button#add-page": "addPage"
    },

    postRender: function() {
        $("#add-new-page").defaultButton("#add-page");
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
