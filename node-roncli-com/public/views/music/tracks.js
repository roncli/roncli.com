/**
 * @typedef {import("../../../src/models/track")} Track
 */

//  #   #                  #           #####                       #             #   #    #
//  #   #                                #                         #             #   #
//  ## ##  #   #   ###    ##     ###     #    # ##    ###    ###   #   #   ###   #   #   ##     ###   #   #
//  # # #  #   #  #        #    #   #    #    ##  #      #  #   #  #  #   #       # #     #    #   #  #   #
//  #   #  #   #   ###     #    #        #    #       ####  #      ###     ###    # #     #    #####  # # #
//  #   #  #  ##      #    #    #   #    #    #      #   #  #   #  #  #       #   # #     #    #      # # #
//  #   #   ## #  ####    ###    ###     #    #       ####   ###   #   #  ####     #     ###    ###    # #
/**
 * A class that represents the music tracks view.
 */
class MusicTracksView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {Track[]} tracks The data to render the page with.
     * @param {string} [category] The category.
     * @returns {string} An HTML string of the page.
     */
    static get(tracks, category) {
        return /* html */`
            ${tracks.map((track) => /* html */`
                <div class="contents-row">
                    <a class="contents" href="${track.url}" ${category ? `data-category="${MusicTracksView.Encoding.attributeEncode(category)}"` : ""}>
                        <div><div class="track">${MusicTracksView.Encoding.htmlEncode(track.title)}</div></div>
                    </a>
                    <a class="contents" href="${track.url}" ${category ? `data-category="${MusicTracksView.Encoding.attributeEncode(category)}"` : ""}>
                        <div><div class="date"><time class="timeago" datetime="${new Date(track.publishDate).toISOString()}">${new Date(track.publishDate).toUTCString()}</time></div></div>
                    </a>
                     <a class="contents tag-list" href="${track.url}" ${category ? `data-category="${MusicTracksView.Encoding.attributeEncode(category)}"` : ""}>
                        <div style="flex-wrap: wrap; column-gap: 4px; row-gap: 4px;">
                            ${track.tagList.map((c) => /* html */`
                                <div class="tag">${MusicTracksView.Encoding.htmlEncode(c)}</div>
                            `).join("")}
                        </div>
                    </a>
                </div>
            `).join("")}
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
MusicTracksView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.MusicTracksView = MusicTracksView;
} else {
    module.exports = MusicTracksView; // eslint-disable-line no-undef
}
