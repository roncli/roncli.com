/**
 * @typedef {import("../../../src/models/microblog")} Microblog
 */

//  #   #    #                         #       ##                  #   #    #
//  #   #                              #        #                  #   #
//  ## ##   ##     ###   # ##    ###   # ##     #     ###    ## #  #   #   ##     ###   #   #
//  # # #    #    #   #  ##  #  #   #  ##  #    #    #   #  #  #    # #     #    #   #  #   #
//  #   #    #    #      #      #   #  #   #    #    #   #   ##     # #     #    #####  # # #
//  #   #    #    #   #  #      #   #  ##  #    #    #   #  #       # #     #    #      # # #
//  #   #   ###    ###   #       ###   # ##    ###    ###    ###     #     ###    ###    # #
//                                                          #   #
//                                                           ###
/**
 * A class that represents the microblog view.
 */
class MicroblogView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered view template.
     * @param {Microblog[]} microblog The microblog.
     * @returns {string} An HTML string of the view.
     */
    static get(microblog) {
        return /* html */`
            ${microblog.map((post) => /* html */`
                <div class="microblog-post">
                    <a class="contents" href="${post.url}" target="_blank">
                        <div class="microblog-post-avatar"><img src="${post.avatarUrl}" /></div>
                        <div class="microblog-post-name">${MicroblogView.Encoding.htmlEncode(post.name)}</div>
                        <div class="microblog-post-username">
                            <div><img class="microblog-logo" src="/images/mastodon-logo.png" /></div>
                            <div>${MicroblogView.Encoding.htmlEncode(post.username.replace(/@/g, " @").trim())}</div>
                        </div>
                    </a>
                    <div class="microblog-post-text">
                        ${post.inReplyToUrl && post.inReplyToUsername ? /* html */`
                            <a href="${post.inReplyToUrl}" target="_blank">Replying to ${MicroblogView.Encoding.htmlEncode(post.inReplyToUsername)}</a><br /><br />
                        ` : ""}
                        ${post.post}
                    </div>
                    <div class="microblog-post-media">
                        ${post.media.map((media) => /* html */`
                            <div class="microblog-post-media-item">
                                ${media.type && ["animated_gif", "video", "gifv"].indexOf(media.type) !== -1 ? /* html */`
                                    <video src="${media.url}"></video>
                                ` : media.type && ["photo", "image"].indexOf(media.type) !== -1 ? /* html */`
                                    <img src="${media.url}" />
                                ` : ""}
                            </div>
                        `).join("")}
                    </div>
                    <div class="microblog-post-actions center">
                        <a href="https://mastodon.social/interact/${post.id}?type=reply" target="_blank"><img src="/images/mastodon-reply.png" alt="Reply" /></a>
                        <a href="https://mastodon.social/interact/${post.id}?type=reblog" target="_blank"><img src="/images/mastodon-boost.png" alt="Boost" /></a>
                        <a href="https://mastodon.social/interact/${post.id}?type=favourite" target="_blank"><img src="/images/mastodon-favorite.png" alt="Favorite" /></a>
                    </div>
                    <div class="microblog-post-date"><time class="timeago" datetime="${new Date(post.displayDate).toISOString()}">${new Date(post.displayDate).toUTCString()}</time></div>
                </div>
            `).join("")}
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
MicroblogView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.MicroblogView = MicroblogView;
} else {
    module.exports = MicroblogView; // eslint-disable-line no-undef
}
