/*global tinyMCE, bootbox*/
var BaseView = require("rendr/shared/base/view"),
    PageComment = require("../../models/page_comment"),
    PageComments = require("../../collections/page_comments"),
    $ = require("jquery"),
    moment = require("moment"),
    sanitizeHtml = require("sanitize-html");

// Sets up the page view.
module.exports = BaseView.extend({
    className: "page_index_view",

    events: {
        "click img.thumb": "thumbClick",
        "click #add-page-comment": "addPageComment",
        "click button.comment-reply": "commentReply"
    },

    postRender: function() {
        "use strict";

        if ($("#sibling-pages-wrapper").length > 0) {
            this.app.addPageScroller("#sibling-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }
        if ($("#children-pages-wrapper").length > 0) {
            this.app.addPageScroller("#children-pages-wrapper", {mouseWheel: true, scrollbars: true});
        }

        $("div.page-content img").each(function() {
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
    },

    thumbClick: function(ev) {
        "use strict";

        window.open($(ev.target).attr("src"), "fullImage", "menubar=0,status=0,titlebar=0,toolbar=0");
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

        var view = this,
            app = this.app;

        this.onScroll = null;

        // Delay 1s in case the user is rapidly moving through the pages.
        setTimeout(function() {
            var comments;

            if (view !== app.router.currentView) {
                return;
            }

            $("div.comments-unloaded").removeClass("comments-unloaded").addClass("comments");

            comments = new PageComments();
            comments.pageId = view.options.page.attributes.page.id;
            comments.fetch({
                success: function() {
                    if (view !== app.router.currentView) {
                        return;
                    }

                    var commentsDiv = $("div.comments");
                    commentsDiv.find("div.loader").remove();
                    commentsDiv.append(app.templateAdapter.getTemplate("page/comment")({comments: comments.models}));

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
                    commentsDiv.append(app.templateAdapter.getTemplate("page/commentLoadingError")({error: message}));
                }
            });
        }, 1000);
    },

    addPageComment: function() {
        "use strict";

        var view = this,
            attributes = sanitizeHtml.defaults.allowedAttributes,
            addPageCommentButton, comment, content;

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

        addPageCommentButton = $("#add-page-comment");
        addPageCommentButton.attr("disabled", "");
        tinyMCE.activeEditor.getBody().setAttribute("contenteditable", false);

        if (!this.app.user) {
            this.onLogin = this.addPageComment;
            $("#login").click();
            return;
        }
        this.onLogin = null;

        attributes.p = ["style"];
        attributes.span = ["style"];

        comment = new PageComment();
        comment.fetch({
            url: "/page-comment",
            data: JSON.stringify({
                pageId: view.options.page.attributes.page.id,
                content: content
            }),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                if (view !== view.app.router.currentView) {
                    return;
                }

                $("#page-comment-server-errors").html("");
                $("#page-comment-server-error-list").hide();

                tinyMCE.activeEditor.setContent("");
                addPageCommentButton.removeAttr("disabled");
                tinyMCE.activeEditor.getBody().setAttribute("contenteditable", true);

                // Display the dialog box.
                bootbox.dialog({
                    title: "Comment Awaiting Moderation",
                    message: view.app.templateAdapter.getTemplate("page/commentAwaitingModeration")(),
                    buttons: {ok: {label: "OK"}},
                    show: false
                }).off("shown.bs.modal").modal("show");
            },
            error: function(xhr, error) {
                var list = $("#page-comment-server-error-list"),
                    message;

                console.log(xhr, error);
                if (error && error.body && error.body.error) {
                    message = error.body.error;
                } else {
                    message = "There was a server error posting your comment.  Please try again later.";
                }
                $("#page-comment-server-errors").html(message);
                list.show();
                addPageCommentButton.removeAttr("disabled");
                tinyMCE.activeEditor.getBody().setAttribute("contenteditable", true);
                $(window).scrollTop(list.offset().top);
            }
        });
    },

    commentReply: function(ev) {
        "use strict";

        var commentPost, content, author, date;

        commentPost = $(ev.target).closest(".comment-post");
        content = commentPost.find(".comment-body").html().trim();
        author = commentPost.find(".comment-author").text();
        date = moment(new Date(commentPost.find(".comment-date").data("published") * 1000));

        tinyMCE.activeEditor.setContent("");
        tinyMCE.activeEditor.execCommand("mceInsertContent", false, "<p><span style=\"font-size: 12px;\">On " + date.format("M/D/YYYY") + " at " + date.format("h:mm:ss a (Z)") + ", <strong>" + author + "</strong> wrote:</span></p><blockquote>" + content + "</blockquote><br /><p>{$caret}</p>");
        tinyMCE.activeEditor.focus();
    }
});

module.exports.id = "page/index";
