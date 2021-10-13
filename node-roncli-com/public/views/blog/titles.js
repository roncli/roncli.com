/**
 * @typedef {import("../../../types/node/blogTypes").Title} BlogTypes.Title
 */

//  ####    ##                  #####    #     #      ##                  #   #    #
//   #  #    #                    #            #       #                  #   #
//   #  #    #     ###    ## #    #     ##    ####     #     ###    ###   #   #   ##     ###   #   #
//   ###     #    #   #  #  #     #      #     #       #    #   #  #       # #     #    #   #  #   #
//   #  #    #    #   #   ##      #      #     #       #    #####   ###    # #     #    #####  # # #
//   #  #    #    #   #  #        #      #     #  #    #    #          #   # #     #    #      # # #
//  ####    ###    ###    ###     #     ###     ##    ###    ###   ####     #     ###    ###    # #
//                       #   #
//                        ###
/**
 * A class that represents the blog titles content view.
 */
class BlogTitlesView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {BlogTypes.Title[]} titles The data to render the page with.
     * @param {string} [category] The category.
     * @returns {string} An HTML string of the page.
     */
    static get(titles, category) {
        return /* html */`
            ${titles.map((title) => /* html */`
                <div class="contents-row">
                    <a class="contents" href="${BlogTitlesView.Encoding.attributeEncode(title.url)}" ${category ? `data-category="${BlogTitlesView.Encoding.attributeEncode(category)}"` : ""}>
                        <div><div class="title">${BlogTitlesView.Encoding.htmlEncode(title.title)}</div></div>
                    </a>
                    <a class="contents" href="${BlogTitlesView.Encoding.attributeEncode(title.url)}" ${category ? `data-category="${BlogTitlesView.Encoding.attributeEncode(category)}"` : ""}>
                        <div><div class="date"><time class="timeago" datetime="${new Date(title.published).toISOString()}">${new Date(title.published).toUTCString()}</time></div></div>
                    </a>
                    <a class="contents" href="${BlogTitlesView.Encoding.attributeEncode(title.url)}" ${category ? `data-category="${BlogTitlesView.Encoding.attributeEncode(category)}"` : ""}>
                        <div style="flex-wrap: wrap; column-gap: 4px; row-gap: 4px;">
                            ${title.categories.map((c) => /* html */`
                                <div class="tag">${BlogTitlesView.Encoding.htmlEncode(c)}</div>
                            `).join("")}
                        </div>
                    </a>
                </div>
            `).join("")}
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
BlogTitlesView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.BlogTitlesView = BlogTitlesView;
} else {
    module.exports = BlogTitlesView; // eslint-disable-line no-undef
}
