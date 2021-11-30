/**
 * @typedef {import("../../types/browser/viewTypes").SpeedrunGameViewParameters} ViewTypes.SpeedrunGameViewParameters
 * @typedef {import("../../types/browser/viewTypes").SpeedrunGameViewInfoParameters} ViewTypes.SpeedrunGameViewInfoParameters
 */

//   ###                            #                        ###                        #   #    #
//  #   #                           #                       #   #                       #   #
//  #      # ##    ###    ###    ## #  # ##   #   #  # ##   #       ###   ## #    ###   #   #   ##     ###   #   #
//   ###   ##  #  #   #  #   #  #  ##  ##  #  #   #  ##  #  #          #  # # #  #   #   # #     #    #   #  #   #
//      #  ##  #  #####  #####  #   #  #      #   #  #   #  #  ##   ####  # # #  #####   # #     #    #####  # # #
//  #   #  # ##   #      #      #  ##  #      #  ##  #   #  #   #  #   #  # # #  #       # #     #    #      # # #
//   ###   #       ###    ###    ## #  #       ## #  #   #   ###    ####  #   #   ###     #     ###    ###    # #
//         #
//         #
/**
 * A class that represents the speedrun game view.
 */
class SpeedrunGameView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.SpeedrunGameViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid">
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>${SpeedrunGameView.Encoding.htmlEncode(data.speedruns.name)} Speedruns</h1></div>
                    <div class="panel-body rounded-bottom center-content grid grid-columns-5-min" style="grid-template-columns: min-content auto auto min-content min-content">
                        ${data.speedruns.runs.map((speedrun) => /* html */`
                            <div class="right">#${speedrun.place}</div>
                            <div class="ellipsis-overflow">${SpeedrunGameView.Encoding.htmlEncode(speedrun.category)}</div>
                            <div class="ellipsis-overflow">${!speedrun.variables || speedrun.variables.length === 0 ? "" : speedrun.variables.map((variable) => SpeedrunGameView.Encoding.htmlEncode(variable)).join(", ")}</div>
                            <div class="right"><a href="${speedrun.url}" target="_blank">${SpeedrunGameView.Time.formatTimespan(speedrun.time, 3)}</a></div>
                            <div>${speedrun.date ? /* html */`
                                <time class="timeago" datetime="${new Date(speedrun.date).toISOString()}">${new Date(speedrun.date).toUTCString()}</time>
                            ` : ""}</div>
                        `).join("")}
                    </div>
                </div>
                ${data.page ? /* html */`
                    <div>
                        ${data.page.page}
                    </div>
                ` : ""}
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
     * @param {ViewTypes.SpeedrunGameViewInfoParameters} data The data to render the page with.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Speedrunning</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/gaming">Gaming</a></li>
                        <li><a href="/gaming/speedruns">Speedrunning</a></li>
                        <li>${SpeedrunGameView.Encoding.htmlEncode(data.name)} Speedruns</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    This is one of the many games that I have done speedruns for and have submitted to <a href="https://speedrun.com/user/roncli" target="_blank">speedrun.com</a>.
                </div>
            </div>
            ${data.page ? /* html */`
                ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${SpeedrunGameView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.siblingPages.map((p) => /* html */`
                                <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                    <div class="center">${SpeedrunGameView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${SpeedrunGameView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.childPages.map((p) => /* html */`
                                <a class="contents" href="${p.url}">
                                    <div class="center">${SpeedrunGameView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
            ` : ""}
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
SpeedrunGameView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/time")} */
// @ts-ignore
SpeedrunGameView.Time = typeof Time === "undefined" ? require("../js/common/time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.SpeedrunGameView = SpeedrunGameView;
} else {
    module.exports = SpeedrunGameView; // eslint-disable-line no-undef
}
