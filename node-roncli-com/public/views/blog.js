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
        const cutoff = data.categories[Math.floor(data.categories.length / data.pageSize)].posts;

        return /* html */`
            ${!data.titles || data.titles.length === 0 ? /* html */`
                <div class="panel rounded">
                    <div class="panel-title rounded">Blog Temporarily Unavailable</div>
                </div>
            ` : /* html */`
                <div class="grid">
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Blog Posts</h1></div>
                        <div id="blog-titles" class="panel-list grid-columns-3">
                            ${BlogView.BlogTitlesView.get(data.titles)}
                        </div>
                        <div class="panel-body rounded-bottom grid grid-columns-2-fixed" style="justify-items: center; align-items: center;">
                            <div id="blog-pagination" data-total="${Math.ceil(data.count / data.pageSize)}">
                                ${BlogView.PaginationPageView.get({page: 1, total: Math.ceil(data.count / data.pageSize)})}
                            </div>
                            <div>
                                Find posts near: <input type="date" id="blog-date" min="2005-02-18" max="${data.newestDate}" value="${data.newestDate}" />
                            </div>
                        </div>
                    </div>
                    <div class="panel">
                        <div class="panel-title rounded-top"><h1>Categories</h1></div>
                        <div id="tag-cloud" class="top-only panel-body" style="display: flex; flex-wrap: wrap; column-gap: 4px; row-gap: 4px; align-items: center;">
                            ${data.categories.sort((a, b) => a.category.localeCompare(b.category)).map((c) => /* html */`
                                <div ${c.posts >= cutoff ? "class=\"top\"" : ""}><a class="tag" style="font-size: ${8 + Math.min(c.posts / 2, 16)}px;" href="/blog/category/${BlogView.Encoding.attributeEncode(c.category)}">${BlogView.Encoding.htmlEncode(c.category)}</a></div>
                            `).join("")}
                        </div>
                        <div class="panel-body rounded-bottom center">
                            <button id="toggle-top" class="btn"><i class="bi-chevron-double-down"></i> Show More</button>
                        </div>
                    </div>
                </div>
            `}
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

        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">roncli.com Blog</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li>Blog</li>
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
                    ${categories.sort((a, b) => b.posts - a.posts).map((category) => /* html */`
                        <a class="contents" href="${BlogView.Encoding.attributeEncode(`/blog/category/${encodeURI(category.category)}`)}" target="_blank">
                            <div class="center">${BlogView.Encoding.htmlEncode(category.category)} (${category.posts})</div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("./blog/titles")} */
// @ts-ignore
BlogView.BlogTitlesView = typeof BlogTitlesView === "undefined" ? require("./blog/titles") : BlogTitlesView; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
BlogView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("./pagination/page")} */
// @ts-ignore
BlogView.PaginationPageView = typeof PaginationPageView === "undefined" ? require("./pagination/page") : PaginationPageView; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.BlogView = BlogView;
} else {
    module.exports = BlogView; // eslint-disable-line no-undef
}
