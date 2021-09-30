/**
 * @typedef {import("../../types/browser/viewTypes").BlogViewParameters} ViewTypes.BlogViewParameters
 * @typedef {import("../../types/browser/viewTypes").BlogViewInfoParameters} ViewTypes.BlogViewInfoParameters
 */

//  ####    ##                  #   #    #
//   #  #    #                  #   #
//   #  #    #     ###    ## #  #   #   ##     ###   #   #
//   ###     #    #   #  #  #    # #     #    #   #  #   #
//   #  #    #    #   #   ##     # #     #    #####  # # #
//   #  #    #    #   #  #       # #     #    #      # # #
//  ####    ###    ###    ###     #     ###    ###    # #
//                       #   #
//                        ###
/**
 * A class that represents the blog view.
 */
class BlogView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.BlogViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
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
     * @param {ViewTypes.BlogViewInfoParameters} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        const {categories} = data;

        // TODO: Add back in the old roncli.com scroll bar.
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">roncli.com Blog</div>
                <div class="info-panel-body rounded-bottom">
                    This is my blog where I give my thoughts and opinions on various topics and share my creative endeavors with the world.  I run two personal blogs, but combine them here for ease of access.<br /><br />
                    <b>Blogger</b> - My oldest blog using the Blogger platform contains posts full of opinions, gaming, and code.<br /><br />
                    <b>Tumblr</b> - Tumblr posts are all about my creative side, containing music, videos, writings, and updates on my web creations.<br /><br />
                    You can select a category below to view the latest post, or browse thorugh the posts using the navigation found at the top and bottom of each post.
                </div>
            </div>
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Categories</div>
                <div class="info-panel-list rounded-bottom">
                    ${categories.map((category) => /* html */`
                        <a class="contents" href="${BlogView.Encoding.attributeEncode(`/blog/category/${encodeURI(category)}`)}" target="_blank">
                            <div class="center">${BlogView.Encoding.htmlEncode(category)}</div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
BlogView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.BlogView = BlogView;
} else {
    module.exports = BlogView; // eslint-disable-line no-undef
}
