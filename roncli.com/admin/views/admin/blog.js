var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the blog admin view.
module.exports = BaseView.extend({
    className: "admin_blog_view",

    onLogout: function() {
        "use strict";

        this.app.router.navigate("/", true);
    }
});

module.exports.id = "admin/blog";
