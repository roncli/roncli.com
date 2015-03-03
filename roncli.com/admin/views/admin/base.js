/*globals bootbox*/

var BaseView = require("rendr/shared/base/view");

// Sets up the base admin view.
module.exports = BaseView.extend({
    onLogout: function() {
        "use strict";

        this.app.router.navigate("/", true);
    },

    showError: function(message) {
        "use strict";

        bootbox.dialog({
            title: "Error",
            message: this.app.templateAdapter.getTemplate("admin/error")({message: message}),
            buttons: {ok: {label: "OK"}},
            show: false
        }).off("shown.bs.modal").modal("show");
    }
});

module.exports.id = "admin/base";
