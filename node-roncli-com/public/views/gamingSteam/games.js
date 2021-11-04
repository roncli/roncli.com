/**
 * @typedef {import("../../../types/browser/viewTypes").GamingSteamGamesViewParameters} ViewTypes.GamingSteamGamesViewParameters
 */

//   ###                   #                   ###    #                           ###                               #   #    #
//  #   #                                     #   #   #                          #   #                              #   #
//  #       ###   ## #    ##    # ##    ## #  #      ####    ###    ###   ## #   #       ###   ## #    ###    ###   #   #   ##     ###   #   #
//  #          #  # # #    #    ##  #  #  #    ###    #     #   #      #  # # #  #          #  # # #  #   #  #       # #     #    #   #  #   #
//  #  ##   ####  # # #    #    #   #   ##        #   #     #####   ####  # # #  #  ##   ####  # # #  #####   ###    # #     #    #####  # # #
//  #   #  #   #  # # #    #    #   #  #      #   #   #  #  #      #   #  # # #  #   #  #   #  # # #  #          #   # #     #    #      # # #
//   ###    ####  #   #   ###   #   #   ###    ###     ##    ###    ####  #   #   ###    ####  #   #   ###   ####     #     ###    ###    # #
//                                     #   #
//                                      ###
/**
 * A class that represents the Steam games view.
 */
class GamingSteamGamesView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.GamingSteamGamesViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            ${data.games.map((game) => /* html */`
                <div class="game">
                    <a class="contents" href="/steam/${game.appId}/${GamingSteamGamesView.Encoding.attributeEncode(encodeURI(game.name))}">
                        <div class="title">${GamingSteamGamesView.Encoding.htmlEncode(game.name)}</div>
                        <div class="logo" style="background-image: url(${game.logoUrl});"></div>
                        <div class="time">${(game.playtimeTotal / 60).toFixed(2)} hour${game.playtimeTotal === 60 ? "" : "s"}</div>
                    </a>
                </div>
            `).join("")}
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
GamingSteamGamesView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.GamingSteamGamesView = GamingSteamGamesView;
} else {
    module.exports = GamingSteamGamesView; // eslint-disable-line no-undef
}
