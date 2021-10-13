/**
 * @typedef {import("../../types/browser/viewTypes").AdminModerationViewParameters} ViewTypes.AdminModerationViewParameters
 */

//    #        #           #           #   #             #                        #       #                  #   #    #
//   # #       #                       #   #             #                        #                          #   #
//  #   #   ## #  ## #    ##    # ##   ## ##   ###    ## #   ###   # ##    ###   ####    ##     ###   # ##   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  # # #  #   #  #  ##  #   #  ##  #      #   #       #    #   #  ##  #   # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  #   #  #   #  #   #  #####  #       ####   #       #    #   #  #   #   # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #  ##  #      #      #   #   #  #    #    #   #  #   #   # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #  #   #   ###    ## #   ###   #       ####    ##    ###    ###   #   #    #     ###    ###    # #
/**
 * A class that represents the admin moderation view.
 */
class AdminModerationView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminModerationViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top"><h1>Moderation Admin</h1></div>
                ${data.comments.length === 0 ? /* html */`
                    <div class="panel-body rounded-bottom">There are currently no comments to moderate.</div>
                ` : /* html*/`
                    <div id="comments" class="panel-body rounded-bottom">
                        ${data.comments.map((c, index) => /* html */`
                            <div class="grid-tight grid-columns-3 comment${index === data.comments.length - 1 ? " no-bottom-border" : ""}">
                                <div class="left comment-top"><b><span class="comment-username">${AdminModerationView.Encoding.htmlEncode(c.username)}</span></b></div>
                                <div class="left comment-top grid-span-2">
                                    <span class="date">Posted <time class="timeago comment-date" datetime="${new Date(c.dateAdded).toISOString()}">${new Date(c.dateAdded).toUTCString()}</time> on <a href="${c.url}">${AdminModerationView.Encoding.htmlEncode(c.url)}</a></span>
                                </div>
                                <div class="grid-span-2 comment-text">
                                    ${c.comment}
                                </div>
                                <div class="right nowrap">
                                    <button class="btn comment-accept" data-id="${c.id}">Accept</button>
                                    <button class="btn comment-reject" data-id="${c.id}">Reject</button>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                `}
            </div>
        `;
    }

    //              #    ###           #
    //              #     #           # #
    //  ###   ##   ###    #    ###    #     ##
    // #  #  # ##   #     #    #  #  ###   #  #
    //  ##   ##     #     #    #  #   #    #  #
    // #      ##     ##  ###   #  #   #     ##
    //  ###
    /**
     * Gets the rendered info template.
     * @returns {string} An HTML string of the info.
     */
    static getInfo() {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Moderation Admin</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li>Moderation</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Approve or reject comments made across the site.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
AdminModerationView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminModerationView = AdminModerationView;
} else {
    module.exports = AdminModerationView; // eslint-disable-line no-undef
}
