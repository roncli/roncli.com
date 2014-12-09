var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery"),
    BlogComments = require("../../collections/blog_comments");

// Sets up the blog view.
module.exports = BaseView.extend({
    className: "blog_base_view",

    events: {
        "click img.thumb": "thumbClick",
        "click a.blog-nav": "blogNav"
    },

    postRender: function() {
        "use strict";

        var blogTopNav = $("#blog-top-nav");

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

        switch (this.name) {
            case "blog/url":
                if (!this.app.lastBlogNav) {
                    this.app.lastBlogNav = "all";
                }

                blogTopNav.html($("div.blog-nav-bottom[data-blog-nav=\"" + this.app.lastBlogNav + "\"]").html()).data("blog-nav", this.app.lastBlogNav);
                break;
            case "blog/index":
                blogTopNav.html($("div.blog-nav-bottom[data-blog-nav=\"all\"]").html()).data("blog-nav", "all");
                break;
            case "blog/category":
                blogTopNav.html($("div.blog-nav-bottom[data-blog-nav=\"" + blogTopNav.data("load-category") + "\"]").html()).data("blog-nav", blogTopNav.data("load-category"));
                break;
        }

        this.app.lastBlogNav = undefined;

        this.app.addPageScroller("#blog-categories-wrapper", {mouseWheel: true, scrollbars: true});
    },

    thumbClick: function(ev) {
        "use strict";

        window.open($(ev.target).attr("src"), "fullImage", "menubar=0,status=0,titlebar=0,toolbar=0");
    },

    blogNav: function(ev) {
        "use strict";

        this.app.lastBlogNav = $(ev.target).closest("div.blog-nav").data("blog-nav");
    },

    onScroll: function() {
        "use strict";

        var windowTop = $(window).scrollTop(),
            windowBottom = windowTop + $(window).height(),
            commentsUnloaded = $("div.comments-unloaded"),
            divTop = commentsUnloaded.offset().top,
            divBottom = divTop + commentsUnloaded.height();

        if (windowTop <= divBottom && windowBottom >= divTop) {
            this.loadComments();
        }
    },

    loadComments: function() {
        "use strict";

        var comments;

        if (this.options.blog && this.options.blog.attributes && this.options.blog.attributes.post && this.options.blog.attributes.post.blogUrl) {
            this.onScroll = null;
            $("div.comments-unloaded").removeClass("comments-unloaded").addClass("comments");

            comments = new BlogComments();
            comments.blogUrl = this.options.blog.get("post").blogUrl;
            comments.fetch({
                success: function() {
                    console.log("Success!");
                    console.log(comments);
                },
                error: function(xhr, error) {
                    console.log("Error!");
                    var message;
                    if (error && error.body && error.body.error) {
                        message = error.body.error;
                    } else {
                        message = "There was a server error while requesting your email change.  Plesae try again later.";
                    }
                    console.log(xhr, error, message);
                }
            });
        }
    }
});

module.exports.id = "blog/base";
