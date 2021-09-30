/**
 * @typedef {import("../../../types/browser/mediaTypes").Media} MediaTypes.Media
 */

//  #   #             #    #           #   #    #
//  #   #             #                #   #
//  ## ##   ###    ## #   ##     ###   #   #   ##     ###   #   #
//  # # #  #   #  #  ##    #        #   # #     #    #   #  #   #
//  #   #  #####  #   #    #     ####   # #     #    #####  # # #
//  #   #  #      #  ##    #    #   #   # #     #    #      # # #
//  #   #   ###    ## #   ###    ####    #     ###    ###    # #
/**
 * A class that represents the media view.
 */
class MediaView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered template.
     * @param {MediaTypes.Media} media The media to display.
     * @returns {string} An HTML string of the view.
     */
    static get(media) {
        return /* html */`
            <div class="media-player-item">
                <div class="media-player-item-title">
                    <button class="media-player-item-play">
                        ${media.source === "soundcloud" ? /* html */`
                            <i class="bi-music-note-beamed"></i>
                        ` : media.source === "youtube" ? /* html */`
                            <i class="bi-filmed"></i>
                        ` : ""}
                        ${MediaView.Encoding.htmlEncode(media.title)}
                    </button>
                </div>
                <div class="media-player-item-delete">
                    <button class="media-player-item-remove"><i class="bi-x"></i></button>
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
MediaView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.MediaView = MediaView;
} else {
    module.exports = MediaView; // eslint-disable-line no-undef
}
