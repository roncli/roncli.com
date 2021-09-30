/**
 * @typedef {import("../../../types/browser/mediaTypes").Media} MediaTypes.Media
 */

//  #   #                #####         #             #   #    #
//  #   #                  #           #             #   #
//   # #    ###   #   #    #    #   #  # ##    ###   #   #   ##     ###   #   #
//    #    #   #  #   #    #    #   #  ##  #  #   #   # #     #    #   #  #   #
//    #    #   #  #   #    #    #   #  #   #  #####   # #     #    #####  # # #
//    #    #   #  #  ##    #    #  ##  ##  #  #       # #     #    #      # # #
//    #     ###    ## #    #     ## #  # ##    ###     #     ###    ###    # #
/**
 * A class that represents the YouTube view.
 */
class YouTubeView {
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
            <iframe id="${media.id}" src="https://www.youtube.com/embed/${media.videoId}?autoplay=1&enablejsapi=1&origin=${media.origin}" allow="autoplay" width="100%" height="100%" scrolling="no" frameborder="no"></iframe>
        `;
    }
}

if (typeof module === "undefined") {
    window.YouTubeView = YouTubeView;
} else {
    module.exports = YouTubeView; // eslint-disable-line no-undef
}
