var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the gaming view.
module.exports = BaseView.extend({
    className: "gaming_index_view",

    postRender: function() {
        "use strict";

        if ($("#children-pages-wrapper").length > 0) {
            this.app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }
    }
});

module.exports.id = "gaming/index";
