var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the project view.
module.exports = BaseView.extend({
    className: "coding_project_view",

    postRender: function() {
        "use strict";

        var app = this.app;

        if ($("#sibling-pages-wrapper").length > 0) {
            setTimeout(function() {
                app.addPageScroller("#sibling-pages-wrapper", {mouseWheel: true, scrollbars: true});
            }, 1);
        }

        if ($("#children-pages-wrapper").length > 0) {
            setTimeout(function() {
                app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});
            }, 1);
        }

        $("abbr.setTime").removeClass("setTime").timeago();
    }
});

module.exports.id = "coding/project";
