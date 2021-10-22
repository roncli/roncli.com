/**
 * @typedef {import("../../types/browser/viewTypes").BlogCategoryViewParameters} ViewTypes.BlogCategoryViewParameters
 * @typedef {import("../../types/browser/viewTypes").BlogCategoryViewInfoParameters} ViewTypes.BlogCategoryViewInfoParameters
 */

//  ####    ##                   ###           #                                        #   #    #
//   #  #    #                  #   #          #                                        #   #
//   #  #    #     ###    ## #  #       ###   ####    ###    ## #   ###   # ##   #   #  #   #   ##     ###   #   #
//   ###     #    #   #  #  #   #          #   #     #   #  #  #   #   #  ##  #  #   #   # #     #    #   #  #   #
//   #  #    #    #   #   ##    #       ####   #     #####   ##    #   #  #      #  ##   # #     #    #####  # # #
//   #  #    #    #   #  #      #   #  #   #   #  #  #      #      #   #  #       ## #   # #     #    #      # # #
//  ####    ###    ###    ###    ###    ####    ##    ###    ###    ###   #          #    #     ###    ###    # #
//                       #   #                              #   #                #   #
//                        ###                                ###                  ###
/**
 * A class that represents the blog categories view.
 */
class BlogCategoryView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.BlogCategoryViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const cutoff = data.categories[Math.floor(data.categories.length / 10)].posts;

        return /* html */`
            <div class="grid">
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Blog Posts - ${BlogCategoryView.Encoding.htmlEncode(data.category)}</h1></div>
                    <div id="blog-titles" class="panel-list grid-columns-3">
                        ${BlogCategoryView.BlogTitlesView.get(data.titles, data.category)}
                    </div>
                    <div class="panel-body rounded-bottom grid grid-columns-2-fixed" style="justify-items: center; align-items: center;">
                        <div id="blog-pagination" data-total="${Math.ceil(data.count / data.pageSize)}" data-category="${data.category}">
                            ${BlogCategoryView.PaginationPageView.get({page: 1, total: Math.ceil(data.count / data.pageSize)})}
                        </div>
                        <div>
                            Find posts near: <input type="date" id="blog-date" min="2005-02-18" max="${data.newestDate}" value="${data.newestDate}" data-category="${data.category}" />
                        </div>
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Categories</h1></div>
                    <div id="tag-cloud" class="top-only panel-body" style="display: flex; flex-wrap: wrap; column-gap: 4px; row-gap: 4px; align-items: center;">
                        ${data.categories.sort((a, b) => a.category.localeCompare(b.category)).map((c) => /* html */`
                            <div ${c.posts >= cutoff ? "class=\"top\"" : ""}><a class="tag" style="font-size: ${8 + Math.min(c.posts / 2, 16)}px;" href="/blog/category/${BlogCategoryView.Encoding.attributeEncode(c.category)}">${BlogCategoryView.Encoding.htmlEncode(c.category)}</a></div>
                        `).join("")}
                    </div>
                    <div class="panel-body rounded-bottom center">
                        <button id="toggle-top" class="btn"><i class="bi-chevron-double-down"></i> Show More</button>
                    </div>
                </div>
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
     * @param {ViewTypes.BlogCategoryViewInfoParameters} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        const {categories} = data;

        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">roncli.com Blog</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/blog">Blog</a></li>
                        <li>${BlogCategoryView.Encoding.htmlEncode(data.category)}</li>
                    </ul>
                </div>
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
                    ${categories.sort((a, b) => b.posts - a.posts || a.category.localeCompare(b.category)).map((category) => /* html */`
                        <a class="contents" href="${BlogCategoryView.Encoding.attributeEncode(`/blog/category/${encodeURI(category.category)}`)}">
                            <div class="center">${BlogCategoryView.Encoding.htmlEncode(category.category)} (${category.posts})</div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    }

}

/** @type {typeof import("./blog/titles")} */
// @ts-ignore
BlogCategoryView.BlogTitlesView = typeof BlogTitlesView === "undefined" ? require("./blog/titles") : BlogTitlesView; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
BlogCategoryView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("./pagination/page")} */
// @ts-ignore
BlogCategoryView.PaginationPageView = typeof PaginationPageView === "undefined" ? require("./pagination/page") : PaginationPageView; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.BlogCategoryView = BlogCategoryView;
} else {
    module.exports = BlogCategoryView; // eslint-disable-line no-undef
}
