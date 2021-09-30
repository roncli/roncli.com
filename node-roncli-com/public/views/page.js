/**
 * @typedef {import("../../types/browser/viewTypes").PageViewParameters} ViewTypes.PageViewParameters
 */

//  ####                        #   #    #
//  #   #                       #   #
//  #   #   ###    ## #   ###   #   #   ##     ###   #   #
//  ####       #  #  #   #   #   # #     #    #   #  #   #
//  #       ####   ##    #####   # #     #    #####  # # #
//  #      #   #  #      #       # #     #    #      # # #
//  #       ####   ###    ###     #     ###    ###    # #
//                #   #
//                 ###
/**
 * A class that represents the generic page view.
 */
class PageView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.PageViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return data.page.page;
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
     * @param {ViewTypes.PageViewParameters} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">${PageView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                <div class="info-panel-body rounded-bottom">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        ${data.page.parentPages ? data.page.parentPages.map((p) => /* html */`
                            <li><a href="${p.url}">${PageView.Encoding.htmlEncode(p.shortTitle)}</a></li>
                        `).join("") : ""}
                        <li>${PageView.Encoding.htmlEncode(data.page.shortTitle)}</li>
                    </ul>
                </div>
            </div>
            ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                <div class="info-panel">
                    <div class="info-panel-title rounded-top">${PageView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                    <div class="info-panel-list rounded-bottom">
                        ${data.page.siblingPages.map((p) => /* html */`
                            <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                <div class="center">${PageView.Encoding.htmlEncode(p.shortTitle)}</div>
                            </a>
                        `).join("")}
                    </div>
                </div>
            ` : ""}
            ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                <div class="info-panel">
                    <div class="info-panel-title rounded-top">${PageView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                    <div class="info-panel-list rounded-bottom">
                        ${data.page.childPages.map((p) => /* html */`
                            <a class="contents" href="${p.url}">
                                <div class="center">${PageView.Encoding.htmlEncode(p.shortTitle)}</div>
                            </a>
                        `).join("")}
                    </div>
                </div>
            ` : ""}
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
PageView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.PageView = PageView;
} else {
    module.exports = PageView; // eslint-disable-line no-undef
}
