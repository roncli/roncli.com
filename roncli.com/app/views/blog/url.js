var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery");

// Sets up the blog view.
module.exports = BaseView.extend({
    className: "blog_url_view",

    events: {
        "click img.thumb": "thumbClick",
        "click a.blog-nav": "blogNav"
    },

    postRender: function() {
        "use strict";

        var IScroll = require("iscroll");

        $("div.blog img").each(function() {
            var image = $(this);
            image.load(function() {
                var width = this.width;
                $("<img />").attr("src", $(this).attr("src")).load(function() {
                    if (width !== this.width) {
                        image.addClass("thumb").attr("title", "Click to view full image in a new window");
                    }
                });
            });
        });

        if (!this.app.lastBlogNav) {
            this.app.lastBlogNav = "all";
        }

        $("#blog-top-nav").html($("div.blog-nav-bottom[data-blog-nav=\"" + this.app.lastBlogNav + "\"]").html()).data("blog-nav", this.app.lastBlogNav);

        this.app.lastBlogNav = undefined;

        // TODO: Better handle app.blogScroller
        if (this.app.blogScroller) {
            this.app.blogScroller.destroy();
            this.app.blogScroller = null;
        }
        this.app.blogScroller = new IScroll("#blog-categories-wrapper", {mouseWheel: true, scrollbars: true});
    },

    thumbClick: function(ev) {
        "use strict";

        window.open($(ev.target).attr("src"), "fullImage", "menubar=0,status=0,titlebar=0,toolbar=0");
    },

    blogNav: function(ev) {
        "use strict";

        this.app.lastBlogNav = $(ev.target).closest("div.blog-nav").data("blog-nav");
    }
});

module.exports.id = "blog/url";
