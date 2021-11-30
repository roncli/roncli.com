/**
 * @typedef {import("../../types/browser/viewTypes").GamingSpeedrunsViewParameters} ViewTypes.GamingSpeedrunsViewParameters
 */

//   ###                   #                   ###                            #                              #   #    #
//  #   #                                     #   #                           #                              #   #
//  #       ###   ## #    ##    # ##    ## #  #      # ##    ###    ###    ## #  # ##   #   #  # ##    ###   #   #   ##     ###   #   #
//  #          #  # # #    #    ##  #  #  #    ###   ##  #  #   #  #   #  #  ##  ##  #  #   #  ##  #  #       # #     #    #   #  #   #
//  #  ##   ####  # # #    #    #   #   ##        #  ##  #  #####  #####  #   #  #      #   #  #   #   ###    # #     #    #####  # # #
//  #   #  #   #  # # #    #    #   #  #      #   #  # ##   #      #      #  ##  #      #  ##  #   #      #   # #     #    #      # # #
//   ###    ####  #   #   ###   #   #   ###    ###   #       ###    ###    ## #  #       ## #  #   #  ####     #     ###    ###    # #
//                                     #   #         #
//                                      ###          #
/**
 * A class that represents the speedruns view.
 */
class GamingSpeedrunsView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.GamingSpeedrunsViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid">
                ${!data.speedrunsByGame || Object.keys(data.speedrunsByGame).length === 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded">Speedruns Temporarily Unavailable</div>
                    </div>
                ` : /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Speedruns</h1></div>
                        ${Object.keys(data.speedrunsByGame).sort().map((game, index) => /* html */`
                            <div class="panel-body center" ${index === 0 ? "" : "style=\"padding-top: 8px;\""}><h3><a href="/speedrun/${GamingSpeedrunsView.Encoding.attributeEncode(data.speedrunsByGame[game][0].gameId)}/${GamingSpeedrunsView.Encoding.slugEncode(data.speedrunsByGame[game][0].game)}">${GamingSpeedrunsView.Encoding.htmlEncode(data.speedrunsByGame[game][0].game)}</a></h3></div>
                            <div class="panel-body center-content grid grid-columns-5-min ${index === Object.keys(data.speedrunsByGame).length - 1 ? "rounded-bottom" : ""}" style="grid-template-columns: min-content auto auto min-content min-content;">
                                ${data.speedrunsByGame[game].map((speedrun) => /* html */`
                                    <div class="right">#${speedrun.place}</div>
                                    <div class="ellipsis-overflow">${GamingSpeedrunsView.Encoding.htmlEncode(speedrun.category)}</div>
                                    <div class="ellipsis-overflow">${!speedrun.variables || speedrun.variables.length === 0 ? "" : speedrun.variables.map((variable) => GamingSpeedrunsView.Encoding.htmlEncode(variable)).join(", ")}</div>
                                    <div class="right"><a href="${speedrun.url}" target="_blank">${GamingSpeedrunsView.Time.formatTimespan(speedrun.time, 3)}</a></div>
                                    <div>${speedrun.date ? /* html */`
                                        <time class="timeago" datetime="${new Date(speedrun.date).toISOString()}">${new Date(speedrun.date).toUTCString()}</time>
                                    ` : ""}</div>
                                `).join("")}
                            </div>                        
                        `).join("")}
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
                <div class="info-panel-title rounded-top">Speedrunning</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/gaming">Gaming</a></li>
                        <li>Speedrunning</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Here is a list of all games that I have done speedruns for and have submitted to <a href="https://speedrun.com/user/roncli" target="_blank">speedrun.com</a>.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
GamingSpeedrunsView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/time")} */
// @ts-ignore
GamingSpeedrunsView.Time = typeof Time === "undefined" ? require("../js/common/time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.GamingSpeedrunsView = GamingSpeedrunsView;
} else {
    module.exports = GamingSpeedrunsView; // eslint-disable-line no-undef
}
