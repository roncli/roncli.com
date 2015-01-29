/*global tinyMCE, bootbox*/
var BaseView = require("rendr/shared/base/view"),
    BlogComment = require("../../models/blog_comment"),
    BlogComments = require("../../collections/blog_comments"),
    $ = require("jquery"),
    moment = require("moment"),
    sanitizeHtml = require("sanitize-html");

// Sets up the blog view.
module.exports = BaseView.extend({
    className: "blog_base_view",

    events: {
        "click img.thumb": "thumbClick",
        "click a.blog-nav": "blogNav",
        "click #add-blog-comment": "addBlogComment",
        "click button.comment-reply": "commentReply"
    },

    postRender: function() {
        "use strict";

        var blogTopNav = $("#blog-top-nav"),
            rssText = $("div.rss-text"),
            rssLink = $("a.rss-link");

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

                if (["all", "blogsource"].indexOf(this.app.lastBlogNav) === -1) {
                    rssText.html("Subscribe to this category:");
                    rssLink.attr("href", rssLink.attr("href") + "?category=" + this.app.lastBlogNav);
                }

                blogTopNav.html($("div.blog-nav-bottom[data-blog-nav=\"" + this.app.lastBlogNav + "\"]").html()).data("blog-nav", this.app.lastBlogNav);
                break;
            case "blog/index":
                blogTopNav.html($("div.blog-nav-bottom[data-blog-nav=\"all\"]").html()).data("blog-nav", "all");
                break;
            case "blog/category":
                rssText.html("Subscribe to this category:");
                rssLink.attr("href", rssLink.attr("href") + "?category=" + blogTopNav.data("load-category"));
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

        var view = this;

        if (this.options.blog && this.options.blog.attributes && this.options.blog.attributes.post && this.options.blog.attributes.post.blogUrl) {
            this.onScroll = null;

            // Delay 1s in case the user is rapidly moving through the pages.
            setTimeout(function() {
                var app = view.app,
                    comments;

                if (view !== app.router.currentView) {
                    return;
                }

                $("div.comments-unloaded").removeClass("comments-unloaded").addClass("comments");

                comments = new BlogComments();
                comments.blogUrl = view.options.blog.get("post").blogUrl;
                comments.fetch({
                    success: function() {
                        if (view !== app.router.currentView) {
                            return;
                        }

                        var commentsDiv = $("div.comments");
                        commentsDiv.find("div.loader").remove();
                        commentsDiv.append(app.templateAdapter.getTemplate("blog/comment")({comments: comments.models}));

                        tinyMCE.init({
                            selector: "textarea.tinymce",
                            toolbar: [
                                "formatselect | fontsizeselect | removeformat | bold italic underline | strikethrough subscript superscript",
                                "undo redo | alignleft aligncenter alignright | alignjustify blockquote | bullist numlist | outdent indent "
                            ],
                            menubar: false,
                            statusbar: false,
                            content_css: "/css/tinymce.min.css",
                            fontsize_formats: "12px 15px 18px 24px 36px 48px 72px",
                            init_instance_callback: function(editor) {
                                view.app.loadFonts(editor.iframeElement.contentWindow);
                            }
                        });
                    },
                    error: function(xhr, error) {
                        var commentsDiv = $("div.comments"),
                            message;

                        if (error && error.body && error.body.error) {
                            message = error.body.error;
                        } else {
                            message = "A server error occurred while loading this post's comments.  Please try again later.";
                        }

                        commentsDiv.find("div.loader").remove();
                        commentsDiv.append(app.templateAdapter.getTemplate("blog/commentLoadingError")({error: message}));
                    }
                });
            }, 1000);
        }
    },

    addBlogComment: function() {
        "use strict";

        var view = this,
            attributes = sanitizeHtml.defaults.allowedAttributes,
            addBlogCommentButton = $("#add-blog-comment"),
            comment = new BlogComment(),
            content;

        if (view !== view.app.router.currentView) {
            return;
        }

        content = sanitizeHtml(tinyMCE.activeEditor.getContent(), {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "u", "sup", "sub", "strike", "address", "span"]),
            allowedAttributes: attributes
        });

        if (content.length === 0) {
            return;
        }

        addBlogCommentButton.attr("disabled", "");
        tinyMCE.activeEditor.getBody().setAttribute("contenteditable", false);

        if (!this.app.user) {
            this.onLogin = this.addBlogComment;
            $("#login").click();
            return;
        }
        this.onLogin = null;

        attributes.p = ["style"];
        attributes.span = ["style"];

        comment.fetch({
            url: "/blog-comment",
            data: JSON.stringify({
                url: this.options.blog.get("post").blogUrl,
                content: content
            }),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                if (view !== view.app.router.currentView) {
                    return;
                }

                $("#blogCommentServerErrors").html("");
                $("#blogCommentServerErrorList").hide();

                tinyMCE.activeEditor.setContent("");
                addBlogCommentButton.removeAttr("disabled");
                tinyMCE.activeEditor.getBody().setAttribute("contenteditable", true);

                // Display the dialog box.
                bootbox.dialog({
                    title: "Comment Awaiting Moderation",
                    message: view.app.templateAdapter.getTemplate("blog/commentAwaitingModeration")(),
                    buttons: {ok: {label: "OK"}},
                    show: false
                }).off("shown.bs.modal").modal("show");
            },
            error: function(xhr, error) {
                var list = $("#blogCommentServerErrorList"),
                    message;

                console.log(xhr, error);
                if (error && error.body && error.body.error) {
                    message = error.body.error;
                } else {
                    message = "There was a server error posting your comment.  Please try again later.";
                }
                $("#blogCommentServerErrors").html(message);
                list.show();
                addBlogCommentButton.removeAttr("disabled");
                tinyMCE.activeEditor.getBody().setAttribute("contenteditable", true);
                $(window).scrollTop(list.offset().top);
            }
        });
    },

    commentReply: function(ev) {
        "use strict";

        var commentPost = $(ev.target).closest(".comment-post"),
            content = commentPost.find(".comment-body").html().trim(),
            author = commentPost.find(".comment-author").text(),
            date = moment(new Date(commentPost.find(".comment-date").data("published") * 1000));

        tinyMCE.activeEditor.setContent("");
        tinyMCE.activeEditor.execCommand("mceInsertContent", false, "<p><span style=\"font-size: 12px;\">On " + date.format("M/D/YYYY") + " at " + date.format("h:mm:ss a (Z)") + ", <strong>" + author + "</strong> wrote:</span></p><blockquote>" + content + "</blockquote><br /><p>{$caret}</p>");
        tinyMCE.activeEditor.focus();
    }
});

module.exports.id = "blog/base";
