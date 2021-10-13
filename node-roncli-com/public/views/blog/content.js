/**
 * @typedef {import("../../../src/models/blog")} Blog
 */

//  ####    ##                   ###                  #                    #     #   #    #
//   #  #    #                  #   #                 #                    #     #   #
//   #  #    #     ###    ## #  #       ###   # ##   ####    ###   # ##   ####   #   #   ##     ###   #   #
//   ###     #    #   #  #  #   #      #   #  ##  #   #     #   #  ##  #   #      # #     #    #   #  #   #
//   #  #    #    #   #   ##    #      #   #  #   #   #     #####  #   #   #      # #     #    #####  # # #
//   #  #    #    #   #  #      #   #  #   #  #   #   #  #  #      #   #   #  #   # #     #    #      # # #
//  ####    ###    ###    ###    ###    ###   #   #    ##    ###   #   #    ##     #     ###    ###    # #
//                       #   #
//                        ###
/**
 * A class that represents the blog content view.
 */
class BlogContentView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {Blog} blog The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(blog) {
        switch (blog.post.blogSource) {
            case "blogger":
                return BlogContentView.blogger(blog);
            case "tumblr":
                switch (blog.content.type) {
                    case "answer":
                        return BlogContentView.tumblrAnswer(blog);
                    case "audio":
                        switch (blog.content.audio_type) {
                            case "soundcloud":
                                return BlogContentView.tumblrSoundCloud(blog);
                            case "tumblr":
                                return BlogContentView.tumblrAudio(blog);
                        }
                        break;
                    case "link":
                        return BlogContentView.tumblrLink(blog);
                    case "photo":
                        return BlogContentView.tumblrPhoto(blog);
                    case "quote":
                        return BlogContentView.tumblrQuote(blog);
                    case "text":
                        return BlogContentView.tumblrText(blog);
                    case "video":
                        switch (blog.content.video_type) {
                            case "youtube":
                                return BlogContentView.tumblrYouTube(blog);
                        }
                        break;
                }
                break;
        }

        return "";
    }

    // #     ##
    // #      #
    // ###    #     ##    ###   ###   ##   ###
    // #  #   #    #  #  #  #  #  #  # ##  #  #
    // #  #   #    #  #   ##    ##   ##    #
    // ###   ###    ##   #     #      ##   #
    //                    ###   ###
    /**
     * Gets the rendered blog post.
     * @param {Blog} blog The blog post.
     * @returns {string} An HTML string of the page.
     */
    static blogger(blog) {
        return /* html */`
            <div class="panel">
                <div class="panel-title rounded-top">
                    <h3>${BlogContentView.Encoding.htmlEncode(blog.post.title)}</h3>
                    Posted <script>document.write(window.Time.formatDate(new Date(${blog.post.published})));</script><br />
                    ${blog.post.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${blog.content.content}
                </div>
            </div>
        `;
    }

    //  #                #     ##           ##
    //  #                #      #          #  #
    // ###   #  #  # #   ###    #    ###   #  #  ###    ###   #  #   ##   ###
    //  #    #  #  ####  #  #   #    #  #  ####  #  #  ##     #  #  # ##  #  #
    //  #    #  #  #  #  #  #   #    #     #  #  #  #    ##   ####  ##    #
    //   ##   ###  #  #  ###   ###   #     #  #  #  #  ###    ####   ##   #
    /**
     * Gets the rendered blog post.
     * @param {Blog} blog The blog post.
     * @returns {string} An HTML string of the page.
     */
    static tumblrAnswer(blog) {
        return /* html */`
            <div class="panel">
                <div class="panel-title rounded-top">
                    Posted ${BlogContentView.Time.formatDate(new Date(blog.post.published))}<br />
                    ${blog.post.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    <blockquote>${blog.content.question}</blockquote>
                    ${blog.content.answer}
                </div>
            </div>
        `;
    }

    //  #                #     ##           ##            #   #
    //  #                #      #          #  #           #
    // ###   #  #  # #   ###    #    ###   #  #  #  #   ###  ##     ##
    //  #    #  #  ####  #  #   #    #  #  ####  #  #  #  #   #    #  #
    //  #    #  #  #  #  #  #   #    #     #  #  #  #  #  #   #    #  #
    //   ##   ###  #  #  ###   ###   #     #  #   ###   ###  ###    ##
    /**
     * Gets the rendered blog post.
     * @param {Blog} blog The blog post.
     * @returns {string} An HTML string of the page.
     */
    static tumblrAudio(blog) {
        return /* html */`
            <div class="panel">
                <div class="panel-title rounded-top">
                    <h3>${BlogContentView.Encoding.htmlEncode(blog.content.track_name)}</h3>
                    ${blog.content.artist ? /* html */`
                        <h4>by ${blog.content.artist}</h4>
                    ` : ""}
                    Posted ${BlogContentView.Time.formatDate(new Date(blog.post.published))}<br />
                    ${blog.post.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${blog.content.embed}
                    ${blog.content.caption}
                </div>
            </div>
        `;
    }

    //  #                #     ##          #      #          #
    //  #                #      #          #                 #
    // ###   #  #  # #   ###    #    ###   #     ##    ###   # #
    //  #    #  #  ####  #  #   #    #  #  #      #    #  #  ##
    //  #    #  #  #  #  #  #   #    #     #      #    #  #  # #
    //   ##   ###  #  #  ###   ###   #     ####  ###   #  #  #  #
    /**
     * Gets the rendered blog post.
     * @param {Blog} blog The blog post.
     * @returns {string} An HTML string of the page.
     */
    static tumblrLink(blog) {
        return /* html */`
            <div class="panel">
                <div class="panel-title rounded-top">
                    Posted ${BlogContentView.Time.formatDate(new Date(blog.post.published))}<br />
                    ${blog.post.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    <h3 class="link"><a href="${BlogContentView.Encoding.attributeEncode(blog.content.url)}">${BlogContentView.Encoding.htmlEncode(blog.content.title)}</a></h4>
                    ${blog.content.description}
                </div>
            </div>
        `;
    }

    //  #                #     ##          ###   #            #
    //  #                #      #          #  #  #            #
    // ###   #  #  # #   ###    #    ###   #  #  ###    ##   ###    ##
    //  #    #  #  ####  #  #   #    #  #  ###   #  #  #  #   #    #  #
    //  #    #  #  #  #  #  #   #    #     #     #  #  #  #   #    #  #
    //   ##   ###  #  #  ###   ###   #     #     #  #   ##     ##   ##
    /**
     * Gets the rendered blog post.
     * @param {Blog} blog The blog post.
     * @returns {string} An HTML string of the page.
     */
    static tumblrPhoto(blog) {
        return /* html */`
            <div class="panel">
                <div class="panel-title rounded-top">
                    Posted ${BlogContentView.Time.formatDate(new Date(blog.post.published))}<br />
                    ${blog.post.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${blog.content.photos.map((p) => /* html */`
                        <img class="constrain-width" src="${BlogContentView.Encoding.attributeEncode(p.original_size.url)}" />
                    `).join("")}
                    ${blog.content.caption}
                </div>
            </div>
        `;
    }

    //  #                #     ##           ##                #
    //  #                #      #          #  #               #
    // ###   #  #  # #   ###    #    ###   #  #  #  #   ##   ###    ##
    //  #    #  #  ####  #  #   #    #  #  #  #  #  #  #  #   #    # ##
    //  #    #  #  #  #  #  #   #    #     ## #  #  #  #  #   #    ##
    //   ##   ###  #  #  ###   ###   #      ##    ###   ##     ##   ##
    //                                        #
    /**
     * Gets the rendered blog post.
     * @param {Blog} blog The blog post.
     * @returns {string} An HTML string of the page.
     */
    static tumblrQuote(blog) {
        return /* html */`
            <div class="panel">
                <div class="panel-title rounded-top">
                    Posted ${BlogContentView.Time.formatDate(new Date(blog.post.published))}<br />
                    ${blog.post.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    <blockquote>${blog.content.text}</blockquote>
                    ${blog.content.source}
                </div>
            </div>
        `;
    }

    //  #                #     ##           ##                        #   ##   ##                   #
    //  #                #      #          #  #                       #  #  #   #                   #
    // ###   #  #  # #   ###    #    ###    #     ##   #  #  ###    ###  #      #     ##   #  #   ###
    //  #    #  #  ####  #  #   #    #  #    #   #  #  #  #  #  #  #  #  #      #    #  #  #  #  #  #
    //  #    #  #  #  #  #  #   #    #     #  #  #  #  #  #  #  #  #  #  #  #   #    #  #  #  #  #  #
    //   ##   ###  #  #  ###   ###   #      ##    ##    ###  #  #   ###   ##   ###    ##    ###   ###
    /**
     * Gets the rendered blog post.
     * @param {Blog} blog The blog post.
     * @returns {string} An HTML string of the page.
     */
    static tumblrSoundCloud(blog) {
        return /* html */`
            <div class="panel">
                <div class="panel-title rounded-top">
                    <h3>${BlogContentView.Encoding.htmlEncode(blog.content.track_name)}</h3>
                    Posted ${BlogContentView.Time.formatDate(new Date(blog.post.published))}<br />
                    ${blog.post.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${blog.content.embed}
                    <button class="btn add-to-media-player" data-source="soundcloud" data-url="${BlogContentView.Encoding.attributeEncode(blog.content.audio_url)}">🎵 Add To Playlist</button>
                    ${blog.content.caption}
                </div>
            </div>
        `;
    }

    //  #                #     ##          ###                #
    //  #                #      #           #                 #
    // ###   #  #  # #   ###    #    ###    #     ##   #  #  ###
    //  #    #  #  ####  #  #   #    #  #   #    # ##   ##    #
    //  #    #  #  #  #  #  #   #    #      #    ##     ##    #
    //   ##   ###  #  #  ###   ###   #      #     ##   #  #    ##
    /**
     * Gets the rendered blog post.
     * @param {Blog} blog The blog post.
     * @returns {string} An HTML string of the page.
     */
    static tumblrText(blog) {
        return /* html */`
            <div class="panel">
                <div class="panel-title rounded-top">
                    ${blog.content.title ? /* html */`
                        <h3>${BlogContentView.Encoding.htmlEncode(blog.content.title)}</h3>
                    ` : ""}
                    Posted ${BlogContentView.Time.formatDate(new Date(blog.post.published))}<br />
                    ${blog.post.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${blog.content.body}
                </div>
            </div>
        `;
    }

    //  #                #     ##          # #               ###         #
    //  #                #      #          # #                #          #
    // ###   #  #  # #   ###    #    ###   # #    ##   #  #   #    #  #  ###    ##
    //  #    #  #  ####  #  #   #    #  #   #    #  #  #  #   #    #  #  #  #  # ##
    //  #    #  #  #  #  #  #   #    #      #    #  #  #  #   #    #  #  #  #  ##
    //   ##   ###  #  #  ###   ###   #      #     ##    ###   #     ###  ###    ##
    /**
     * Gets the rendered blog post.
     * @param {Blog} blog The blog post.
     * @returns {string} An HTML string of the page.
     */
    static tumblrYouTube(blog) {
        return /* html */`
            <div class="panel">
                <div class="panel-title rounded-top">
                    Posted ${BlogContentView.Time.formatDate(new Date(blog.post.published))}<br />
                    ${blog.post.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${blog.content.player[blog.content.player.length - 1].embed_code}
                    <button class="btn add-to-media-player" data-source="youtube" data-url="${BlogContentView.Encoding.attributeEncode(blog.content.permalink_url)}">🎵 Add To Playlist</button>
                    ${blog.content.caption}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
BlogContentView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../../js/common/time")} */
// @ts-ignore
BlogContentView.Time = typeof Time === "undefined" ? require("../../js/common/time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.BlogContentView = BlogContentView;
} else {
    module.exports = BlogContentView; // eslint-disable-line no-undef
}
