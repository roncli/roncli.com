var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the coding view.
module.exports = BaseView.extend({
    className: "coding_index_view",

    postRender: function() {
        "use strict";

        var app = this.app;

        if ($("#children-pages-wrapper").length > 0) {
            setTimeout(function() {
                app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});
            }, 1);
        }

        $("abbr.setTime").removeClass("setTime").timeago();
    }
});

module.exports.id = "coding/index";
