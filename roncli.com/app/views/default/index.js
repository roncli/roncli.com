var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the default view.
module.exports = BaseView.extend({
    className: "default_index_view",

    postRender: function() {
        "use strict";

        if (this.options.page) {
            if ($("#sibling-pages-wrapper").length > 0) {
                this.app.addPageScroller("#sibling-pages-wrapper", {mouseWheel: true, scrollbars: true});
            }
            if ($("#children-pages-wrapper").length > 0) {
                this.app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});
            }
        }
    }
});

module.exports.id = "default/index";
