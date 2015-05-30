var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the game view.
module.exports = BaseView.extend({
    className: "gaming_game_view",

    postRender: function() {
        "use strict";

        var app = this.app,
            siblingWrapper = $("#sibling-pages-wrapper"),
            childrenWrapper = $("#children-pages-wrapper");

        if (siblingWrapper.length > 0) {
            setTimeout(function() {
                app.addPageScroller("#sibling-pages-wrapper", {mouseWheel: true, scrollbars: true});

                $("div.sibling-pages").height(Math.min(siblingWrapper.height(), siblingWrapper.find("div.scroller").height()));
            }, 1);
        }

        if (childrenWrapper.length > 0) {
            setTimeout(function() {
                app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});

                $("div.children-pages").height(Math.min(childrenWrapper.height(), childrenWrapper.find("div.scroller").height()));
            }, 1);
        }
    }
});

module.exports.id = "gaming/game";
