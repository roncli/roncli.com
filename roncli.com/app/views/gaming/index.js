var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the gaming view.
module.exports = BaseView.extend({
    className: "gaming_index_view",

    postRender: function() {
        "use strict";

        var app = this.app,
            childrenWrapper = $("#children-pages-wrapper");

        if (childrenWrapper.length > 0) {
            setTimeout(function() {
                app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});

                $("div.children-pages").height(Math.min(childrenWrapper.height(), childrenWrapper.find("div.scroller").height()));
            }, 1);
        }
    }
});

module.exports.id = "gaming/index";
