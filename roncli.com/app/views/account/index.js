var BaseView = require("rendr/shared/base/view");

// Sets up the account view.
module.exports = BaseView.extend({
    className: "account_index_view",

    preRender: function() {
        "use strict";

        var app = this.app,
            checkLogin = function() {
                if (app.user && app.user.get("id") !== 0) {
                    // TODO: Trigger render of page.
                } else {
                    if (app.router) {
                        app.router.navigate("/", true);
                    }
                }
            };

        if (app.started) {
            checkLogin();
        } else {
            app.once("logged-in", function() {
                checkLogin();
            });
        }
    },

    onLogout: function() {
        "use strict";

        this.app.router.navigate("/", true);
    }
});

module.exports.id = "account/index";
