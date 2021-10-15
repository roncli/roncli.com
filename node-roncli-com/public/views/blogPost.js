/**
 * @typedef {import("../../types/browser/viewTypes").BlogPostViewParameters} ViewTypes.BlogPostViewParameters
 * @typedef {import("../../types/browser/viewTypes").BlogPostViewInfoParameters} ViewTypes.BlogPostViewInfoParameters
 */

//  ####    ##                  ####                  #     #   #    #
//   #  #    #                  #   #                 #     #   #
//   #  #    #     ###    ## #  #   #   ###    ###   ####   #   #   ##     ###   #   #
//   ###     #    #   #  #  #   ####   #   #  #       #      # #     #    #   #  #   #
//   #  #    #    #   #   ##    #      #   #   ###    #      # #     #    #####  # # #
//   #  #    #    #   #  #      #      #   #      #   #  #   # #     #    #      # # #
//  ####    ###    ###    ###   #       ###   ####     ##     #     ###    ###    # #
//                       #   #
//                        ###
/**
 * A class that represents the blog view.
 */
class BlogPostView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.BlogPostViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const navs = data.category ? data.categoryNavs[data.category] : data.mainNav;

        return /* html */`
            <div class="grid">
                <div class="grid grid-columns-2-fixed">
                    ${navs.prev ? /* html */`
                        <a href="${navs.prev.url}" class="contents blog-nav-link" ${data.category ? `data-category="${BlogPostView.Encoding.attributeEncode(data.category)}"` : ""}>
                            <div class="pill grid grid-columns-2" style="grid-template-columns: max-content auto;">
                                <div style="grid-row-end: span 2"><i class="bi-caret-left-fill"></i></div>
                                <div class="blog-nav">${data.category ? `Previously in ${BlogPostView.Encoding.htmlEncode(data.category)}` : "Previous post"}:</div>
                                <div class="blog-nav-title">${BlogPostView.Encoding.htmlEncode(navs.prev.title)}</div>
                            </div>
                        </a>
                    ` : /* html */`
                        <div></div>
                    `}
                    ${navs.next ? /* html */`
                        <a href="${navs.next.url}" class="contents blog-nav-link" ${data.category ? `data-category="${BlogPostView.Encoding.attributeEncode(data.category)}"` : ""}>
                            <div class="pill grid grid-columns-2" style="grid-template-columns: auto max-content;">
                                <div class="blog-nav">Next${data.category ? ` in ${BlogPostView.Encoding.htmlEncode(data.category)}` : " post"}:</div>
                                <div style="grid-row-end: span 2"><i class="bi-caret-right-fill"></i></div>
                                <div class="blog-nav-title">${BlogPostView.Encoding.htmlEncode(navs.next.title)}</div>
                            </div>
                        </a>
                    ` : /* html */`
                        <div></div>
                    `}
                </div>
                <div id="blog-post">
                    ${BlogPostView.BlogContentView.get(data.title, data.content)}
                </div>
                <div class="grid grid-columns-2-fixed">
                    ${data.category ? /* html */`
                        ${data.categoryNavs[data.category].prev ? /* html */`
                            <a href="${data.categoryNavs[data.category].prev.url}" class="contents blog-nav-link" data-category="${BlogPostView.Encoding.attributeEncode(data.category)}">
                                <div class="pill grid grid-columns-2" style="grid-template-columns: max-content auto;">
                                    <div style="grid-row-end: span 2"><i class="bi-caret-left-fill"></i></div>
                                    <div class="blog-nav">Previously in ${BlogPostView.Encoding.htmlEncode(data.category)}:</div>
                                    <div class="blog-nav-title">${BlogPostView.Encoding.htmlEncode(data.categoryNavs[data.category].prev.title)}</div>
                                </div>
                            </a>
                        ` : /* html */`
                            <div></div>
                        `}
                        ${data.categoryNavs[data.category].next ? /* html */`
                            <a href="${data.categoryNavs[data.category].next.url}" class="contents blog-nav-link" data-category="${BlogPostView.Encoding.attributeEncode(data.category)}">
                                <div class="pill grid grid-columns-2" style="grid-template-columns: auto max-content;">
                                    <div class="blog-nav">Next in ${BlogPostView.Encoding.htmlEncode(data.category)}:</div>
                                    <div style="grid-row-end: span 2"><i class="bi-caret-right-fill"></i></div>
                                    <div class="blog-nav-title">${BlogPostView.Encoding.htmlEncode(data.categoryNavs[data.category].next.title)}</div>
                                </div>
                            </a>
                        ` : /* html */`
                            <div></div>
                        `}
                    ` : ""}
                    ${data.mainNav.prev ? /* html */`
                        <a href="${data.mainNav.prev.url}" class="contents blog-nav-link">
                            <div class="pill grid grid-columns-2" style="grid-template-columns: max-content auto;">
                                <div style="grid-row-end: span 2"><i class="bi-caret-left-fill"></i></div>
                                <div class="blog-nav">Previous post:</div>
                                <div class="blog-nav-title">${BlogPostView.Encoding.htmlEncode(data.mainNav.prev.title)}</div>
                            </div>
                        </a>
                    ` : /* html */`
                        <div></div>
                    `}
                    ${data.mainNav.next ? /* html */`
                        <a href="${data.mainNav.next.url}" class="contents blog-nav-link">
                            <div class="pill grid grid-columns-2" style="grid-template-columns: auto max-content;">
                                <div class="blog-nav">Next post:</div>
                                <div style="grid-row-end: span 2"><i class="bi-caret-right-fill"></i></div>
                                <div class="blog-nav-title">${BlogPostView.Encoding.htmlEncode(data.mainNav.next.title)}</div>
                            </div>
                        </a>
                    ` : /* html */`
                        <div></div>
                    `}
                    ${Object.keys(data.categoryNavs).map((category) => /* html */`
                        ${category === data.category ? "" : /* html */`
                            ${data.categoryNavs[category].prev ? /* html */`
                                <a href="${data.categoryNavs[category].prev.url}" class="contents blog-nav-link" data-category="${BlogPostView.Encoding.attributeEncode(category)}">
                                    <div class="pill grid grid-columns-2" style="grid-template-columns: max-content auto;">
                                        <div style="grid-row-end: span 2"><i class="bi-caret-left-fill"></i></div>
                                        <div class="blog-nav">Previously in ${BlogPostView.Encoding.htmlEncode(category)}:</div>
                                        <div class="blog-nav-title">${BlogPostView.Encoding.htmlEncode(data.categoryNavs[category].prev.title)}</div>
                                    </div>
                                </a>
                            ` : /* html */`
                                <div></div>
                            `}
                            ${data.categoryNavs[category].next ? /* html */`
                                <a href="${data.categoryNavs[category].next.url}" class="contents blog-nav-link" data-category="${BlogPostView.Encoding.attributeEncode(category)}">
                                    <div class="pill grid grid-columns-2" style="grid-template-columns: auto max-content;">
                                        <div class="blog-nav">Next in ${BlogPostView.Encoding.htmlEncode(category)}:</div>
                                        <div style="grid-row-end: span 2"><i class="bi-caret-right-fill"></i></div>
                                        <div class="blog-nav-title">${BlogPostView.Encoding.htmlEncode(data.categoryNavs[category].next.title)}</div>
                                    </div>
                                </a>
                            ` : /* html */`
                                <div></div>
                            `}
                        `}
                    `).join("")}
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
     * @param {ViewTypes.BlogPostViewInfoParameters} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        const {title, category, categories} = data;

        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">roncli.com Blog</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/blog">Blog</a></li>
                        ${category ? /* html */`
                            <li><a href="/blog/category/${BlogPostView.Encoding.attributeEncode(category)}">Blog</a></li>
                        ` : ""}
                        <li>${BlogPostView.Encoding.htmlEncode(title.title)}</li>
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
                    ${categories.sort((a, b) => b.posts - a.posts || a.category.localeCompare(b.category)).map((cat) => /* html */`
                        <a class="contents" href="${BlogPostView.Encoding.attributeEncode(`/blog/category/${encodeURI(cat.category)}`)}" target="_blank">
                            <div class="center">${BlogPostView.Encoding.htmlEncode(cat.category)} (${cat.posts})</div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("./blog/content")} */
// @ts-ignore
BlogPostView.BlogContentView = typeof BlogContentView === "undefined" ? require("./blog/content") : BlogContentView; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
BlogPostView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.BlogPostView = BlogPostView;
} else {
    module.exports = BlogPostView; // eslint-disable-line no-undef
}
