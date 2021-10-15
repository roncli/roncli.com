/**
 * @typedef {import("../../../types/node/blogTypes").Title} BlogTypes.Title
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static get(title, content) {
        switch (title.blogSource) {
            case "blogger":
                return BlogContentView.blogger(title, content);
            case "tumblr":
                switch (content.type) {
                    case "answer":
                        return BlogContentView.tumblrAnswer(title, content);
                    case "audio":
                        switch (content.audio_type) {
                            case "soundcloud":
                                return BlogContentView.tumblrSoundCloud(title, content);
                            case "tumblr":
                                return BlogContentView.tumblrAudio(title, content);
                        }
                        break;
                    case "link":
                        return BlogContentView.tumblrLink(title, content);
                    case "photo":
                        return BlogContentView.tumblrPhoto(title, content);
                    case "quote":
                        return BlogContentView.tumblrQuote(title, content);
                    case "text":
                        return BlogContentView.tumblrText(title, content);
                    case "video":
                        switch (content.video_type) {
                            case "youtube":
                                return BlogContentView.tumblrYouTube(title, content);
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static blogger(title, content) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top">
                    <h3>${BlogContentView.Encoding.htmlEncode(title.title)}</h3>
                    Posted <time class="local" datetime="${new Date(title.published)}"></time><br />
                    ${title.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${content.content}
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static tumblrAnswer(title, content) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top">
                    Posted <time class="local" datetime="${new Date(title.published)}"></time><br />
                    ${title.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    <blockquote>${content.question}</blockquote>
                    ${content.answer}
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static tumblrAudio(title, content) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top">
                    <h3>${BlogContentView.Encoding.htmlEncode(content.track_name)}</h3>
                    ${content.artist ? /* html */`
                        <h4>by ${content.artist}</h4>
                    ` : ""}
                    Posted <time class="local" datetime="${new Date(title.published)}"></time><br />
                    ${title.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${content.embed}
                    ${content.caption}
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static tumblrLink(title, content) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top">
                    Posted <time class="local" datetime="${new Date(title.published)}"></time><br />
                    ${title.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    <h3 class="link"><a href="${BlogContentView.Encoding.attributeEncode(content.url)}" target="_blank">${BlogContentView.Encoding.htmlEncode(content.title)}</a></h3>
                    ${content.description}
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static tumblrPhoto(title, content) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top">
                    Posted <time class="local" datetime="${new Date(title.published)}"></time><br />
                    ${title.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body">
                    ${content.photos.map((p) => /* html */`
                        <img class="constrain-width" src="${BlogContentView.Encoding.attributeEncode(p.original_size.url)}" />
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${content.caption}
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static tumblrQuote(title, content) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top">
                    Posted <time class="local" datetime="${new Date(title.published)}"></time><br />
                    ${title.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    <blockquote>${content.text}</blockquote>
                    ${content.source}
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static tumblrSoundCloud(title, content) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top">
                    <h3>${BlogContentView.Encoding.htmlEncode(content.track_name)}</h3>
                    Posted <time class="local" datetime="${new Date(title.published)}"></time><br />
                    ${title.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body">
                    ${content.embed}
                    <div class="center">
                        <button class="btn add-to-media-player" data-source="soundcloud" data-url="${BlogContentView.Encoding.attributeEncode(content.audio_url)}"><i class="bi-plus"></i><i class="bi-music-note-beamed"></i> Add To Playlist</button>
                    </div>
                </div>
                <div class="panel-body rounded-bottom">
                     ${content.caption}
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static tumblrText(title, content) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top">
                    ${content.title ? /* html */`
                        <h3>${BlogContentView.Encoding.htmlEncode(content.title)}</h3>
                    ` : ""}
                    Posted <time class="local" datetime="${new Date(title.published)}"></time><br />
                    ${title.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${content.body}
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
     * @param {BlogTypes.Title} title The blog title.
     * @param {any} content The blog content.
     * @returns {string} An HTML string of the page.
     */
    static tumblrYouTube(title, content) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top">
                    Posted <time class="local" datetime="${new Date(title.published)}"></time><br />
                    ${title.categories.map((c) => /* html */`
                        <a class="tag" href="/blog/category/${BlogContentView.Encoding.attributeEncode(c)}">${BlogContentView.Encoding.htmlEncode(c)}</a>
                    `).join("")}
                </div>
                <div class="panel-body rounded-bottom">
                    ${content.player[content.player.length - 1].embed_code}
                    <button class="btn add-to-media-player" data-source="youtube" data-url="${BlogContentView.Encoding.attributeEncode(content.permalink_url)}"><i class="bi-plus"></i><i class="bi-music-note-beamed"></i> Add To Playlist</button>
                    ${content.caption}
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
