var BaseView = require("rendr/shared/base/view"),
    $ = require("jquery"),
    Admin = require("../../models/admin");

// Sets up the blog admin view.
module.exports = BaseView.extend({
    className: "admin_blog_view",

    events: {
        "click a.post-link": "openPost",
        "click button.approve-comment": "approveComment",
        "click button.reject-comment": "rejectComment"
    },

    onLogout: function() {
        "use strict";

        this.app.router.navigate("/", true);
    },

    openPost: function(ev) {
        "use strict";

        // Open post in new window.
        window.open($(ev.target).attr("href"), "_blank");

        // Do not open post in current window!
        return false;
    },

    approveComment: function(ev) {
        "use strict";

        this.moderateComment($(ev.target).closest(".comment-post"), "approve");
    },

    rejectComment: function(ev) {
        "use strict";

        this.moderateComment($(ev.target).closest(".comment-post"), "reject");
    },

    moderateComment: function(commentPost, action) {
        "use strict";

        var approveButton = commentPost.find(".approve-comment"),
            rejectButton = commentPost.find(".reject-comment"),
            admin = new Admin(),
            app = this.app;

        approveButton.prop("disabled", true);
        rejectButton.prop("disabled", true);

        admin.fetch({
            url: "/admin/" + action + "-blog-comment",
            data: JSON.stringify({commentId: commentPost.data("commentId")}),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function() {
                $("<div></div>").html(app.templateAdapter.getTemplate("admin/blog/" + action)).insertAfter(commentPost.find(".comment-actions"));
                approveButton.remove();
                rejectButton.remove();
            },
            error: function(xhr, error) {
                // TODO: Error handling
                approveButton.prop("disabled", false);
                rejectButton.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/blog";
