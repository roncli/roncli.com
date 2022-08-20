/**
 * @typedef {import("../../types/browser/viewTypes").GamingNecroDancerViewParameters} ViewTypes.GamingNecroDancerViewParameters
 * @typedef {import("../../types/browser/viewTypes").GamingNecroDancerViewInfoParameters} ViewTypes.GamingNecroDancerViewInfoParameters
 */

//   ###                   #                  #   #                              ####                                      #   #    #
//  #   #                                     #   #                               #  #                                     #   #
//  #       ###   ## #    ##    # ##    ## #  ##  #   ###    ###   # ##    ###    #  #   ###   # ##    ###    ###   # ##   #   #   ##     ###   #   #
//  #          #  # # #    #    ##  #  #  #   # # #  #   #  #   #  ##  #  #   #   #  #      #  ##  #  #   #  #   #  ##  #   # #     #    #   #  #   #
//  #  ##   ####  # # #    #    #   #   ##    #  ##  #####  #      #      #   #   #  #   ####  #   #  #      #####  #       # #     #    #####  # # #
//  #   #  #   #  # # #    #    #   #  #      #   #  #      #   #  #      #   #   #  #  #   #  #   #  #   #  #      #       # #     #    #      # # #
//   ###    ####  #   #   ###   #   #   ###   #   #   ###    ###   #       ###   ####    ####  #   #   ###    ###   #        #     ###    ###    # #
//                                     #   #
//                                      ###
/**
 * A class that represents the NecroDancer view.
 */
class GamingNecroDancerView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.GamingNecroDancerViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const deathless = data.necroDancer.filter((run) => run.run === "Deathless").sort((a, b) => a.rank - b.rank || b.score - a.score),
            score = data.necroDancer.filter((run) => run.run === "Score").sort((a, b) => a.rank - b.rank || b.score - a.score),
            seededScore = data.necroDancer.filter((run) => run.run === "Seeded Score").sort((a, b) => a.rank - b.rank || b.score - a.score),
            speed = data.necroDancer.filter((run) => run.run === "Speed").sort((a, b) => a.rank - b.rank || b.score - a.score),
            seededSpeed = data.necroDancer.filter((run) => run.run === "Seeded Speed").sort((a, b) => a.rank - b.rank || b.score - a.score);

        return /* html */`
            <div class="grid">
                ${data.page ? /* html */`
                    <div>
                        ${data.page.page}
                    </div>
                ` : ""}
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Crypt of the NecroDancer Runs</h1></div>
                    <div class="panel-body center"><h3>Speedruns</h3></div>
                    <div class="panel-body center-content grid grid-columns-3-min">
                        ${speed.map((run) => /* html */`
                            <div class="right">#${run.rank}</div>
                            <div class="left">${GamingNecroDancerView.Encoding.htmlEncode(run.name)}</div>
                            <div class="right"><a href="${run.url}" target="_blank">${GamingNecroDancerView.Time.formatTimespan(run.score, 3)}</a></div>
                        `).join("")}
                    </div>
                    <div class="panel-body center pad-top"><h3>Deathless Runs</h3></div>
                    <div class="panel-body center-content grid grid-columns-3-min">
                        ${deathless.map((run) => /* html */`
                            <div class="right">#${run.rank}</div>
                            <div class="left">${GamingNecroDancerView.Encoding.htmlEncode(run.name)}</div>
                            <div class="right"><a href="${run.url}" target="_blank">${run.score} Win${run.score === 1 ? "" : "s"}${run.end && run.end.zone && run.end.level ? `, ${run.end.zone}-${run.end.level}` : ""}</a></div>
                        `).join("")}
                    </div>
                    <div class="panel-body center pad-top"><h3>Score Runs</h3></div>
                    <div class="panel-body center-content grid grid-columns-3-min">
                        ${score.map((run) => /* html */`
                            <div class="right">#${run.rank}</div>
                            <div class="left">${GamingNecroDancerView.Encoding.htmlEncode(run.name)}</div>
                            <div class="right"><a href="${run.url}" target="_blank">$${run.score}</a></div>
                        `).join("")}
                    </div>
                    <div class="panel-body center pad-top"><h3>Seeded Speedruns</h3></div>
                    <div class="panel-body center-content grid grid-columns-3-min">
                        ${seededSpeed.map((run) => /* html */`
                            <div class="right">#${run.rank}</div>
                            <div class="left">${GamingNecroDancerView.Encoding.htmlEncode(run.name)}</div>
                            <div class="right"><a href="${run.url}" target="_blank">${GamingNecroDancerView.Time.formatTimespan(run.score, 3)}</a></div>
                        `).join("")}
                    </div>
                    <div class="panel-body center pad-top"><h3>Seeded Score Runs</h3></div>
                    <div class="panel-body rounded-bottom center-content grid grid-columns-3-min">
                        ${seededScore.map((run) => /* html */`
                            <div class="right">#${run.rank}</div>
                            <div class="left">${GamingNecroDancerView.Encoding.htmlEncode(run.name)}</div>
                            <div class="right"><a href="${run.url}" target="_blank">$${run.score}</a></div>
                        `).join("")}
                    </div>
                </div>
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
     * @param {ViewTypes.GamingNecroDancerViewInfoParameters} data The data to render the page with.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Crypt of the NecroDancer Runs</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/gaming">Gaming</a></li>
                        <li>Crypt of the NecroDancer Runs</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    View my scores and records in Crypt of the NecroDancer.
                </div>
            </div>
            ${data.page ? /* html */`
                ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${GamingNecroDancerView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.siblingPages.map((p) => /* html */`
                                <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                    <div class="center">${GamingNecroDancerView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${GamingNecroDancerView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.childPages.map((p) => /* html */`
                                <a class="contents" href="${p.url}">
                                    <div class="center">${GamingNecroDancerView.Encoding.htmlEncode(p.shortTitle)}</div>
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
GamingNecroDancerView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/time")} */
// @ts-ignore
GamingNecroDancerView.Time = typeof Time === "undefined" ? require("../js/common/time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.GamingNecroDancerView = GamingNecroDancerView;
} else {
    module.exports = GamingNecroDancerView; // eslint-disable-line no-undef
}
