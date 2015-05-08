var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the music view.
module.exports = BaseView.extend({
    className: "music_index_view",

    postRender: function() {
        "use strict";

        if ($("#children-pages-wrapper").length > 0) {
            this.app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }
    }
});

module.exports.id = "music/index";
