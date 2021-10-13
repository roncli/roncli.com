/**
 * @typedef {import("../../types/browser/viewTypes").PlaylistViewParameters} ViewTypes.PlaylistViewParameters
 */

//  ####    ##                   ##      #            #     #   #    #
//  #   #    #                    #                   #     #   #
//  #   #    #     ###   #   #    #     ##     ###   ####   #   #   ##     ###   #   #
//  ####     #        #  #   #    #      #    #       #      # #     #    #   #  #   #
//  #        #     ####  #  ##    #      #     ###    #      # #     #    #####  # # #
//  #        #    #   #   ## #    #      #        #   #  #   # #     #    #      # # #
//  #       ###    ####      #   ###    ###   ####     ##     #     ###    ###    # #
//                       #   #
//                        ###
/**
 * A class that represents the playlist view.
 */
class PlaylistView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.PlaylistViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            ${data.page ? /* html */`
                <div>${data.page.page}</div>
            ` : ""}
            <div class="panel rounded">
                <div class="panel-title rounded-top"><h1>${PlaylistView.Encoding.htmlEncode(data.playlist.title)}</h1></div>
                <div class="panel-body rounded-bottom grid center-items">
                    <div class="large">by <a href="https://youtube.com/channel/${data.playlist.channelId}">${PlaylistView.Encoding.htmlEncode(data.playlist.channelTitle)}</a></div>
                    <div>
                        <button class="btn" id="add-all"><i class="bi-plus"></i><i class="bi-music-note-beamed"></i> Add All To Playlist</button>
                    </div>
                    ${data.playlist.description ? /* html */`
                        <div style="justify-self: left;">${PlaylistView.Encoding.htmlEncode(data.playlist.description).replace(/\r\n/g, "\r").replace(/[\r\n]/g, "<br />")}</div>
                    ` : ""}
                    <div class="large">${PlaylistView.Encoding.htmlEncode(data.playlist.title)}</div>
                    <div id="youtube-playlist-item" style="width: 100%; height: 200px;"></div>
                    <div id="playlist-videos" style="width: 100%;">
                        ${data.playlist.videos.map((v) => /* html */`
                            <div class="pill pill-static grid" style="align-items: center; grid-template-columns: 1fr auto auto;">
                                <div class="title large">${PlaylistView.Encoding.htmlEncode(v.title)}</div>
                                <div class="play"><button class="btn play-video" data-id="${PlaylistView.Encoding.attributeEncode(v.id)}"><i class="bi-play-fill"></i> Play</button></div>
                                <div class="add"><button class="btn add-to-media-player" data-source="youtube" data-url="https://youtube.com/watch?v=${PlaylistView.Encoding.attributeEncode(v.id)}"><i class="bi-plus"></i><i class="bi-music-note-beamed"></i> Add To Playlist</button></div>
                            </div>
                        `).join("")}
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
     * @returns {string} An HTML string of the info.
     */
    static getInfo() {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Playlist</div>
                <div class="info-panel-body rounded-bottom">
                    This is a playlist of videos from YouTube.  You can view them here, and comment on the playlist below.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
PlaylistView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("./media/youtube")} */
// @ts-ignore
PlaylistView.YouTubeView = typeof YouTubeView === "undefined" ? require("./media/youtube") : YouTubeView; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.PlaylistView = PlaylistView;
} else {
    module.exports = PlaylistView; // eslint-disable-line no-undef
}
