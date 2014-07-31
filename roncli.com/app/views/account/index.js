var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the account view.
module.exports = BaseView.extend({
    className: "account_index_view",

    postRender: function() {
        "use strict";

        var app = this.app,
            checkLogin = function() {
                if (app.user && app.user.get("id") !== 0) {
                    $("div#account-panel").html(app.templateAdapter.getTemplate("account/account")(app.user.attributes));
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
