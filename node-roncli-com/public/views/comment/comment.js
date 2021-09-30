/**
 * @typedef {import("../../../src/models/comment")} Comment
 */

//   ###                                       #     #   #    #
//  #   #                                      #     #   #
//  #       ###   ## #   ## #    ###   # ##   ####   #   #   ##     ###   #   #
//  #      #   #  # # #  # # #  #   #  ##  #   #      # #     #    #   #  #   #
//  #      #   #  # # #  # # #  #####  #   #   #      # #     #    #####  # # #
//  #   #  #   #  # # #  # # #  #      #   #   #  #   # #     #    #      # # #
//   ###    ###   #   #  #   #   ###   #   #    ##     #     ###    ###    # #
/**
 * A class that represents the comment view.
 */
class CommentView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered view template.
     * @param {Comment} comment The comment to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(comment) {
        return /* html */`
            <div class="panel-body grid-tight grid-columns-3 comment">
                <div class="left comment-top"><b><span class="comment-username">${CommentView.Encoding.htmlEncode(comment.username)}</span></b></div>
                <div class="left comment-top grid-span-2">
                    <span class="date">Posted <time class="timeago comment-date" datetime="${new Date(comment.dateAdded).toISOString()}">${new Date(comment.dateAdded).toUTCString()}</time></span>
                    ${comment.dateModerated ? "" : /* html */`
                        <span class="badge">Awaiting Moderation</span>
                    `}
                </div>
                <div class="grid-span-2 comment-text">
                    ${comment.comment}
                </div>
                <div class="right">
                    <button class="btn comment-reply">Reply</button>
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
CommentView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.CommentView = CommentView;
} else {
    module.exports = CommentView; // eslint-disable-line no-undef
}
