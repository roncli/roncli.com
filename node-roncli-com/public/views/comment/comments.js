/**
 * @typedef {import("../../../types/browser/viewTypes").CommentsViewParameters} ViewTypes.CommentsViewParameters
 */

//   ###                                       #            #   #    #
//  #   #                                      #            #   #
//  #       ###   ## #   ## #    ###   # ##   ####    ###   #   #   ##     ###   #   #
//  #      #   #  # # #  # # #  #   #  ##  #   #     #       # #     #    #   #  #   #
//  #      #   #  # # #  # # #  #####  #   #   #      ###    # #     #    #####  # # #
//  #   #  #   #  # # #  # # #  #      #   #   #  #      #   # #     #    #      # # #
//   ###    ###   #   #  #   #   ###   #   #    ##   ####     #     ###    ###    # #
/**
 * A class that represents the comments view.
 */
class CommentsView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered view template.
     * @param {ViewTypes.CommentsViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="panel rounded" style="margin-top: 8px;">
                <div class="panel-title rounded-top"><h2>Comments</h2></div>
                <div id="comments">
                    ${data.comments ? data.comments.map((c) => CommentsView.CommentView.get(c)).join("") : ""}
                </div>
                <div id="comment-container" class="panel-body rounded-bottom">
                    <div id="comment-add">
                        <div class="center"><h4><b>Add Your Comments</b></h4></div>
                        <div id="comment-editor"></div>
                        <div class="center"><button id="comment-post" class="btn">Post</button></div>
                    </div>
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("./comment")} */
// @ts-ignore
CommentsView.CommentView = typeof CommentView === "undefined" ? require("./comment") : CommentView; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.CommentsView = CommentsView;
} else {
    module.exports = CommentsView; // eslint-disable-line no-undef
}
