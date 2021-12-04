/**
 * @typedef {import("../../types/browser/viewTypes").SteamGameViewParameters} ViewTypes.SteamGameViewParameters
 */

//   ###    #                           ###                        #   #    #
//  #   #   #                          #   #                       #   #
//  #      ####    ###    ###   ## #   #       ###   ## #    ###   #   #   ##     ###   #   #
//   ###    #     #   #      #  # # #  #          #  # # #  #   #   # #     #    #   #  #   #
//      #   #     #####   ####  # # #  #  ##   ####  # # #  #####   # #     #    #####  # # #
//  #   #   #  #  #      #   #  # # #  #   #  #   #  # # #  #       # #     #    #      # # #
//   ###     ##    ###    ####  #   #   ###    ####  #   #   ###     #     ###    ###    # #
/**
 * A class that represents the Steam game view.
 */
class SteamGameView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.SteamGameViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const earnedAchievements = data.game.achievements.achievements.filter((a) => a.achieved).sort((a, b) => a.name.localeCompare(b.name)),
            unearnedAchievements = data.game.achievements.achievements.filter((a) => !a.achieved).sort((a, b) => a.name.localeCompare(b.name));

        return /* html */`
            <div class="grid">
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>${SteamGameView.Encoding.htmlEncode(data.game.name)}</h1></div>
                    <div class="panel-body center">
                        <img src="${data.game.achievements.headerUrl}" />
                    </div>
                    <div class="panel-body center playtime ${data.game.achievements.achievements.length === 0 ? "rounded-bottom" : ""}">
                        <h5>Time played: <b>${SteamGameView.Time.formatSteamTime(data.game.playtimeTotal)}</b></h5>
                        <h5>Last 2 weeks: <b>${SteamGameView.Time.formatSteamTime(data.game.playtimeTwoWeeks)}</b></h5>
                    </div>
                    ${earnedAchievements.length === 0 ? "" : /* html */`
                        <div class="panel-body ${unearnedAchievements.length === 0 ? "rounded-bottom" : ""}">
                            <div class="center"><h3>Earned Achievements</h3></div>
                            <div class="achievements">
                                ${earnedAchievements.map((a) => /* html */`
                                    <div class="tooltip-hover">
                                        <img class="achievement-image" src="${a.icon}" />
                                        <div class="tooltip-content">
                                            <b>${SteamGameView.Encoding.htmlEncode(a.name)}</b>${a.description && a.description.length !== 0 ? /* html */`<br/>${SteamGameView.Encoding.htmlEncode(a.description)}` : ""}
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `}
                    ${unearnedAchievements.length === 0 ? "" : /* html */`
                        <div class="panel-body rounded-bottom">
                            <div class="center"><h3>Unearned Achievements</h3></div>
                            <div class="achievements">
                                ${unearnedAchievements.map((a) => /* html */`
                                    <div class="tooltip-hover">
                                        <img class="achievement-image" src="${a.icongray}" />
                                        <div class="tooltip-content">
                                            <b>${SteamGameView.Encoding.htmlEncode(a.name)}</b>${a.description && a.description.length !== 0 ? /* html */`<br/>${SteamGameView.Encoding.htmlEncode(a.description)}` : ""}
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `}
                </div>
            </div>
            ${data.page ? /* html */`
                <div>
                    ${data.page.page}
                </div>
            ` : ""}
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
     * @param {ViewTypes.SteamGameViewParameters} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Gaming</div>
                <div class="info-panel-body rounded-bottom">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/gaming">Gaming</a></li>
                        <li><a href="/gaming/steam">Steam Games</a></li>
                        <li>${data.game.name}</li>
                    </ul>
                </div>
            </div>
            ${data.page ? /* html */`
                ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${SteamGameView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.siblingPages.map((p) => /* html */`
                                <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                    <div class="center">${SteamGameView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${SteamGameView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.childPages.map((p) => /* html */`
                                <a class="contents" href="${p.url}">
                                    <div class="center">${SteamGameView.Encoding.htmlEncode(p.shortTitle)}</div>
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
SteamGameView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/time")} */
// @ts-ignore
SteamGameView.Time = typeof Time === "undefined" ? require("../js/common/time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.SteamGameView = SteamGameView;
} else {
    module.exports = SteamGameView; // eslint-disable-line no-undef
}
