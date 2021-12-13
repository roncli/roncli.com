/**
 * @typedef {import("../../types/browser/viewTypes").IndexViewParameters} ViewTypes.IndexViewParameters
 */

//   ###              #                #   #    #
//    #               #                #   #
//    #    # ##    ## #   ###   #   #  #   #   ##     ###   #   #
//    #    ##  #  #  ##  #   #   # #    # #     #    #   #  #   #
//    #    #   #  #   #  #####    #     # #     #    #####  # # #
//    #    #   #  #  ##  #       # #    # #     #    #      # # #
//   ###   #   #   ## #   ###   #   #    #     ###    ###    # #
/**
 * A class that represents the general website template.
 */
class IndexView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.IndexViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const {head, pageHtml, infoHtml, host, originalUrl, year, version, user, userLinks, contacts, comments} = data;

        return /* html */`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <meta name="og:site_name" content="roncli.com" />
                    <meta name="og:url" content="https://${host}${encodeURI(originalUrl)}" />
                    <meta name="twitter:creator" content="@roncli" />
                    <meta name="twitter:url" content="https://${host}${encodeURI(originalUrl)}" />
                    <script src="https://w.soundcloud.com/player/api.js"></script>
                    <script src="https://www.youtube.com/iframe_api"></script>
                    ${head}
                    <script>
                        Index.user = ${JSON.stringify(user)}
                    </script>
                </head>
                <body>
                    <div id="page">
                        <div id="page-body">
                            <div id="menu" class="rounded">
                                <ul>
                                    <li><a href="/">Home</a></li>
                                    <li><a href="/blog">Blog</a></li>
                                    <li><a href="/music">Music</a></li>
                                    <li><a href="/coding">Coding</a></li>
                                    <li><a href="/gaming">Gaming</a></li>
                                    <li><a href="/life">Life</a></li>
                                    ${IndexView.UserView.get({user, userLinks})}
                                </ul>
                            </div>
                            <div id="header" class="rounded">
                                <div id="logo"></div>
                                Music. Coding. Gaming. Life.
                            </div>
                            <div id="page-html">
                                ${pageHtml}
                                ${comments ? IndexView.CommentsView.get({comments}) : ""}
                            </div>
                            <div id="loading" class="hidden center">
                                <img src="/images/roncliLoading.gif" />
                            </div>
                            <div id="page-info">
                                ${infoHtml}
                            </div>
                            <div id="share">
                                <div class="info-panel">
                                    <div class="info-panel-title rounded-top">Share This Page</div>
                                    <div class="info-panel-body rounded-bottom center">
                                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://${host}${originalUrl}`)}" target="_blank" id="share-facebook"><img src="/images/facebook.png" /></a>
                                        <a href="https://twitter.com/home?status=${encodeURIComponent(`https://${host}${originalUrl}`)}" target="_blank" id="share-tumblr"><img src="/images/tumblr.png" /></a>
                                        <a href="https://www.tumblr.com/share/link?url=${encodeURIComponent(`https://${host}${originalUrl}`)}" target="_blank" id="share-twitter"><img src="/images/twitter.png" /></a>
                                    </div>
                                </div>
                            </div>
                            <div id="twitter">
                                <div class="info-panel">
                                    <div class="info-panel-title rounded-top">Twitter</div>
                                    <div class="info-panel-body" style="padding: 0;">
                                        <a class="twitter-timeline" data-width="180" data-height="350" data-chrome="transparent noheader nofooter" data-theme="light" href="https://twitter.com/roncli?ref_src=twsrc%5Etfw">Tweets by roncli</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
                                    </div>
                                    <div class="info-panel-list rounded-bottom">
                                        <a class="contents" href="https://twitter.com/roncli" target="_blank">
                                            <div class="center">@roncli</div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            ${contacts.length === 0 ? "" : /* html */`
                                <div id="contacts">
                                    <div class="info-panel">
                                        <div class="info-panel-title rounded-top">Contacts</div>
                                        <div class="info-panel-list rounded-bottom">
                                            ${contacts.map((contact) => /* html */`
                                                <a class="contents" rel="me" href="${IndexView.Encoding.attributeEncode(contact.value)}" target="_blank">
                                                    <div class="center">${IndexView.Encoding.htmlEncode(contact.title)}</div>
                                                </a>
                                            `).join("")}
                                        </div>
                                    </div>
                                </div>
                            `}
                            <div id="discord">
                                <div class="info-panel">
                                    <div class="info-panel-title rounded-top">Join roncli on Discord!</div>
                                    <div class="info-panel-body rounded-bottom">
                                        Join the roncli Gaming Discord server for discussion about gaming, development, and more!
                                        <div class="center"><a href="https://ronc.li/discord" target="_blank"><img src="/images/discord.png" /></a></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="copyright">
                            <div class="left">
                                Content &copy;${+year > 2000 ? "2000-" : ""}${year} Ronald M. Clifford<br />
                                Website Version ${version}, &copy;${+year > 2021 ? "2021-" : ""}${year} roncli Productions
                            </div>
                            <div class="right">
                                Bugs?  <a href="https://github.com/roncli/roncli.com/issues" target="_blank">Report on GitHub</a>
                            </div>
                        </div>
                    </div>
                    <div id="media-player-panel" class="">
                        <div id="media-player-body" class="">
                            <div style="display: inline-block; float: left; width: 28px; height: 65px;"></div>
                            <div id="media-player-title" class="center"><h6>roncli.com Media Player</h6></div>
                            <div id="media-player-now-playing" class="center"></div>
                            <div style="clear: both;"></div>
                            <div id="media-player-content">
                                <div id="media-player-background"></div>
                                <div id="media-player-content-player"></div>
                            </div>
                            <div id="media-player-buttons" class="center">
                                <button id="media-player-back" class="media-player-button"><i class="bi-skip-backward-fill"></i></button>
                                <button id="media-player-pause" class="media-player-button"><i class="bi-pause-fill"></i></button>
                                <button id="media-player-play" class="media-player-button"><i class="bi-play-fill"></i></button>
                                <button id="media-player-forward" class="media-player-button"><i class="bi-skip-forward-fill"></i></button>
                            </div>
                            <div id="media-player-playlist-container">
                                <div id="media-player-playlist"></div>
                            </div>
                        </div>
                    </div>
                    <div id="media-player-trigger" class="">
                        <div class="">
                            <button id="media-player-trigger-button"><i class="bi-music-note-beamed"></i><br /><i class="bi-list"></button>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }
}

/** @type {typeof import("./comment/comments")} */
// @ts-ignore
IndexView.CommentsView = typeof UserView === "undefined" ? require("./comment/comments") : CommentsView; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
IndexView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("./index/user")} */
// @ts-ignore
IndexView.UserView = typeof UserView === "undefined" ? require("./index/user") : UserView; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.IndexView = IndexView;
} else {
    module.exports = IndexView; // eslint-disable-line no-undef
}
