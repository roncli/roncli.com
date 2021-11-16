//    #     ##    #                    #   #    #
//   # #     #    #                    #   #
//  #   #    #    # ##   #   #  ## #   #   #   ##     ###   #   #
//  #   #    #    ##  #  #   #  # # #   # #     #    #   #  #   #
//  #####    #    #   #  #   #  # # #   # #     #    #####  # # #
//  #   #    #    ##  #  #  ##  # # #   # #     #    #      # # #
//  #   #   ###   # ##    ## #  #   #    #     ###    ###    # #
/**
 * A class that represents the album view.
 */
class AlbumView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered view template.
     * @param {string} uid The UID of the album.
     * @returns {string} An HTML string of the view.
     */
    static get(uid) {
        return /* html */`
            <div class="slideshow" data-id="${uid}">
                <div class="slide">
                    <div class="image"></div>
                    <div class="count"><span class="number">1</span> / <span class="total"></span></div>
                    <div class="title"></div>
                    <div class="description"></div>

                    <a class="fullscreen" href="#"><i class="bi-arrows-fullscreen"></i></a>
                    <a class="prev" href="#"><i class="bi-caret-left-fill"></i></a>
                    <a class="next" href="#"><i class="bi-caret-right-fill"></i></a>
                </div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.AlbumView = AlbumView;
} else {
    module.exports = AlbumView; // eslint-disable-line no-undef
}
