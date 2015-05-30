/*global tinyMCE, bootbox*/
var BaseView = require("rendr/shared/base/view"),
    PlaylistComment = require("../../models/playlist_comment"),
    PlaylistComments = require("../../collections/playlist_comments"),
    $ = require("jquery"),
    moment = require("moment"),
    sanitizeHtml = require("sanitize-html");

// Sets up the playlist view.
module.exports = BaseView.extend({
    className: "playlist_index_view",

    events: {
        "click button#add-all-to-media-player": "addAllToPlaylist",
        "click button.play-video": "playVideo",
        "click #add-playlist-comment": "addPlaylistComment",
        "click button.comment-reply": "commentReply"
    },

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
    },

    addAllToPlaylist: function() {
        "use strict";

        $("button.add-video-to-media-player").each(function(index, button) {
            $(button).click();
        });
    },

    playVideo: function(ev) {
        "use strict";

        var video = $(ev.target).closest("div.video");

        $("#video-title").text(video.data("title"));
        $("#video-player").empty().append(this.app.templateAdapter.getTemplate("playlist/video")({id: video.data("video-id")}));
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

            comments = new PlaylistComments();
            comments.playlistId = view.options.playlist.attributes.id;
            comments.fetch({
                success: function() {
                    if (view !== app.router.currentView) {
                        return;
                    }

                    var commentsDiv = $("div.comments");
                    commentsDiv.find("div.loader").remove();
                    commentsDiv.append(app.templateAdapter.getTemplate("playlist/comment")({comments: comments.models}));

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
                    commentsDiv.append(app.templateAdapter.getTemplate("playlist/commentLoadingError")({error: message}));
                }
            });
        }, 1000);
    },

    addPlaylistComment: function() {
        "use strict";

        var view = this,
            attributes = sanitizeHtml.defaults.allowedAttributes,
            addPlaylistCommentButton = $("#add-playlist-comment"),
            comment = new PlaylistComment(),
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

        addPlaylistCommentButton.attr("disabled", "");
        tinyMCE.activeEditor.getBody().setAttribute("contenteditable", false);

        if (!this.app.user) {
            this.onLogin = this.addPlaylistComment;
            $("#login").click();
            return;
        }
        this.onLogin = null;

        attributes.p = ["style"];
        attributes.span = ["style"];

        comment.fetch({
            url: "/playlist-comment",
            data: JSON.stringify({
                id: view.options.playlist.attributes.id,
                content: content
            }),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                if (view !== view.app.router.currentView) {
                    return;
                }

                $("#playlist-comment-server-errors").html("");
                $("#playlist-comment-server-error-list").hide();

                tinyMCE.activeEditor.setContent("");
                addPlaylistCommentButton.removeAttr("disabled");
                tinyMCE.activeEditor.getBody().setAttribute("contenteditable", true);

                // Display the dialog box.
                bootbox.dialog({
                    title: "Comment Awaiting Moderation",
                    message: view.app.templateAdapter.getTemplate("playlist/commentAwaitingModeration")(),
                    buttons: {ok: {label: "OK"}},
                    show: false
                }).off("shown.bs.modal").modal("show");
            },
            error: function(xhr, error) {
                var list = $("#playlist-comment-server-error-list"),
                    message;

                if (error && error.body && error.body.error) {
                    message = error.body.error;
                } else {
                    message = "There was a server error posting your comment.  Please try again later.";
                }
                $("#playlist-comment-server-errors").html(message);
                list.show();
                addPlaylistCommentButton.removeAttr("disabled");
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

module.exports.id = "playlist/index";
