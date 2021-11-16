/**
 * @typedef {import("../../../types/browser/mediaTypes").Media} MediaTypes.Media
 */

//   ###                            #   ###    ##                      #  #   #    #
//  #   #                           #  #   #    #                      #  #   #
//  #       ###   #   #  # ##    ## #  #        #     ###   #   #   ## #  #   #   ##     ###   #   #
//   ###   #   #  #   #  ##  #  #  ##  #        #    #   #  #   #  #  ##   # #     #    #   #  #   #
//      #  #   #  #   #  #   #  #   #  #        #    #   #  #   #  #   #   # #     #    #####  # # #
//  #   #  #   #  #  ##  #   #  #  ##  #   #    #    #   #  #  ##  #  ##   # #     #    #      # # #
//   ###    ###    ## #  #   #   ## #   ###    ###    ###    ## #   ## #    #     ###    ###    # #
/**
 * A class that represents the SoundCloud view.
 */
class SoundCloudView {
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
            <iframe id="${media.id}" src="https://w.soundcloud.com/player/?auto_play=true&buying=true&liking=true&download=true&sharing=true&show_artwork=true&show_comments=true&show_playcount=true&show_user=true&hide_related=true&visual=true&start_track=0&callback=true&color=191935&url=${media.resolvedUrl}" allow="autoplay" width="100%" height="100%" scrolling="no" frameborder="no"></iframe>
        `;
    }
}

if (typeof module === "undefined") {
    window.SoundCloudView = SoundCloudView;
} else {
    module.exports = SoundCloudView; // eslint-disable-line no-undef
}
