var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the project view.
module.exports = BaseView.extend({
    className: "coding_project_view",

    postRender: function() {
        "use strict";

        if ($("#sibling-pages-wrapper").length > 0) {
            this.app.addPageScroller("#sibling-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }
        if ($("#children-pages-wrapper").length > 0) {
            this.app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }

        $("abbr.setTime").removeClass("setTime").timeago();
    }
});

module.exports.id = "coding/project";
