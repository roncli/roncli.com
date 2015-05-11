var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the game view.
module.exports = BaseView.extend({
    className: "gaming_game_view",

    postRender: function() {
        "use strict";

        if ($("#sibling-pages-wrapper").length > 0) {
            this.app.addPageScroller("#sibling-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }
        if ($("#children-pages-wrapper").length > 0) {
            this.app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }
    }
});

module.exports.id = "gaming/game";
