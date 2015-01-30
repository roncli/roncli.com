var BaseView = require("rendr/shared/base/view");

// Sets up the admin view.
module.exports = BaseView.extend({
    onLogout: function() {
        "use strict";

        this.app.router.navigate("/", true);
    }
});

module.exports.id = "admin/base";
