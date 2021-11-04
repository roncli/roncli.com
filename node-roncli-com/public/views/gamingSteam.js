/**
 * @typedef {import("../../types/browser/viewTypes").GamingSteamViewParameters} ViewTypes.GamingSteamViewParameters
 */

//   ###                   #                   ###    #                          #   #    #
//  #   #                                     #   #   #                          #   #
//  #       ###   ## #    ##    # ##    ## #  #      ####    ###    ###   ## #   #   #   ##     ###   #   #
//  #          #  # # #    #    ##  #  #  #    ###    #     #   #      #  # # #   # #     #    #   #  #   #
//  #  ##   ####  # # #    #    #   #   ##        #   #     #####   ####  # # #   # #     #    #####  # # #
//  #   #  #   #  # # #    #    #   #  #      #   #   #  #  #      #   #  # # #   # #     #    #      # # #
//   ###    ####  #   #   ###   #   #   ###    ###     ##    ###    ####  #   #    #     ###    ###    # #
//                                     #   #
//                                      ###
/**
 * A class that represents the Steam view.
 */
class GamingSteamView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.GamingSteamViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid">
                ${!data.steamGames || data.steamGames.length === 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded">Steam Games Temporarily Unavailable</div>
                    </div>
                ` : /* html */`
                    <div id="steam-games-list" class="grid grid-columns-4-fixed">
                        ${GamingSteamView.GamingSteamGamesView.get({games: data.steamGames})}
                    </div>
                    <div class="panel rounded">
                        <div class="panel-body rounded center">
                            <div id="steam-pagination" data-total="${Math.ceil(data.count / data.pageSize)}">
                                ${GamingSteamView.PaginationPageView.get({page: 1, total: Math.ceil(data.count / data.pageSize)})}
                            </div>
                        </div>
                    </div>
                `}
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
                <div class="info-panel-title rounded-top">Steam Games</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/gaming">Gaming</a></li>
                        <li>Steam Games</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Here is a list of the Steam games I own.  Click on one to view details about the game, including my achievement progress.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("./gamingSteam/games")} */
// @ts-ignore
GamingSteamView.GamingSteamGamesView = typeof GamingSteamGamesView === "undefined" ? require("./gamingSteam/games") : GamingSteamGamesView; // eslint-disable-line no-undef

/** @type {typeof import("./pagination/page")} */
// @ts-ignore
GamingSteamView.PaginationPageView = typeof PaginationPageView === "undefined" ? require("./pagination/page") : PaginationPageView; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.GamingSteamView = GamingSteamView;
} else {
    module.exports = GamingSteamView; // eslint-disable-line no-undef
}
