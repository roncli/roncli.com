var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

    // Sets up the account view.
module.exports = BaseView.extend({
    className: "coding_index_view",

    postRender: function() {
        "use strict";

        $("abbr.setTime").removeClass("setTime").timeago();
    }
});

module.exports.id = "coding/index";
