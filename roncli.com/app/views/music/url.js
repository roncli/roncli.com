/*global tinyMCE, bootbox*/
var BaseView = require("rendr/shared/base/view"),
    SongComment = require("../../models/song_comment"),
    SongComments = require("../../collections/song_comments"),
    $ = require("jquery"),
    moment = require("moment"),
    sanitizeHtml = require("sanitize-html");

// Sets up the song view.
module.exports = BaseView.extend({
    className: "music_url_view",

    events: {
        "click #add-song-comment": "addSongComment",
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

        if (this.options.song && this.options.song.attributes && this.options.song.attributes.songUrl) {
            this.onScroll = null;

            // Delay 1s in case the user is rapidly moving through the pages.
            setTimeout(function() {
                var comments;

                if (view !== app.router.currentView) {
                    return;
                }

                $("div.comments-unloaded").removeClass("comments-unloaded").addClass("comments");

                comments = new SongComments();
                comments.songUrl = view.options.song.get("songUrl");
                comments.fetch({
                    success: function() {
                        if (view !== app.router.currentView) {
                            return;
                        }

                        var commentsDiv = $("div.comments");
                        commentsDiv.find("div.loader").remove();
                        commentsDiv.append(app.templateAdapter.getTemplate("music/comment")({comments: comments.models}));

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
                        commentsDiv.append(app.templateAdapter.getTemplate("music/commentLoadingError")({error: message}));
                    }
                });
            }, 1000);
        }
    },

    addSongComment: function() {
        "use strict";

        var view = this,
            attributes = sanitizeHtml.defaults.allowedAttributes,
            addSongCommentButton = $("#add-song-comment"),
            comment = new SongComment(),
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

        addSongCommentButton.attr("disabled", "");
        tinyMCE.activeEditor.getBody().setAttribute("contenteditable", false);

        if (!this.app.user) {
            this.onLogin = this.addSongComment;
            $("#login").click();
            return;
        }
        this.onLogin = null;

        attributes.p = ["style"];
        attributes.span = ["style"];

        comment.fetch({
            url: "/song-comment",
            data: JSON.stringify({
                url: this.options.song.get("songUrl"),
                content: content
            }),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                if (view !== view.app.router.currentView) {
                    return;
                }

                $("#song-comment-server-errors").html("");
                $("#song-comment-server-error-list").hide();

                tinyMCE.activeEditor.setContent("");
                addSongCommentButton.removeAttr("disabled");
                tinyMCE.activeEditor.getBody().setAttribute("contenteditable", true);

                // Display the dialog box.
                bootbox.dialog({
                    title: "Comment Awaiting Moderation",
                    message: view.app.templateAdapter.getTemplate("music/commentAwaitingModeration")(),
                    buttons: {ok: {label: "OK"}},
                    show: false
                }).off("shown.bs.modal").modal("show");
            },
            error: function(xhr, error) {
                var list = $("#song-comment-server-error-list"),
                    message;

                if (error && error.body && error.body.error) {
                    message = error.body.error;
                } else {
                    message = "There was a server error posting your comment.  Please try again later.";
                }
                $("#song-comment-server-errors").html(message);
                list.show();
                addSongCommentButton.removeAttr("disabled");
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

module.exports.id = "music/url";
