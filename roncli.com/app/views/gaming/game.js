var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the game view.
module.exports = BaseView.extend({
    className: "gaming_game_view",

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
    }
});

module.exports.id = "gaming/game";
