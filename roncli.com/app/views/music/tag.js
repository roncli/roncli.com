var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the music tag view.
module.exports = BaseView.extend({
    className: "music_tag_view",

    events: {
        "click button#add-all-to-media-player": "addAllToPlaylist"
    },

    postRender: function() {
        "use strict";

        if ($("#sibling-pages-wrapper").length > 0) {
            this.app.addPageScroller("#sibling-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }
        if ($("#children-pages-wrapper").length > 0) {
            this.app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }
    },

    addAllToPlaylist: function() {
        "use strict";

        $("button.add-song-to-media-player").each(function(index, button) {
            $(button).click();
        });
    }
});

module.exports.id = "music/tag";
