/**
 * @typedef {import("../../types/browser/viewTypes").CodingViewParameters} ViewTypes.CodingViewParameters
 * @typedef {import("../../types/browser/viewTypes").CodingViewInfoParameters} ViewTypes.CodingViewInfoParameters
 */

//   ###              #    #                  #   #    #
//  #   #             #                       #   #
//  #       ###    ## #   ##    # ##    ## #  #   #   ##     ###   #   #
//  #      #   #  #  ##    #    ##  #  #  #    # #     #    #   #  #   #
//  #      #   #  #   #    #    #   #   ##     # #     #    #####  # # #
//  #   #  #   #  #  ##    #    #   #  #       # #     #    #      # # #
//   ###    ###    ## #   ###   #   #   ###     #     ###    ###    # #
//                                     #   #
//                                      ###
/**
 * A class that represents the coding view.
 */
class CodingView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.CodingViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid">
                <div>
                    ${data.page.page}
                </div>
                ${!data.projects || data.projects.length === 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded">Projects Temporarily Unavailable</div>
                    </div>
                ` : /* html */`
                    <div id="projects">
                        <div class="grid grid-columns-3-fixed">
                            ${data.projects.map((p) => /* html */`
                                <a class="content" href="/music/category/Classic">
                                    <div class="pill center">
                                        <h3>${CodingView.Encoding.htmlEncode(p.title)}</h3>
                                        <div>${CodingView.Encoding.htmlEncode(p.description)}</div>
                                    </div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                `}
                ${data.releases && data.releases.length > 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Latest Releases</h1></div>
                        <div class="panel-body grid-tight grid-columns-4 rounded-bottom">
                            ${data.releases.map((r) => /* html */`
                                <div>${CodingView.Encoding.htmlEncode(r.name)}</div>
                                <div title="${CodingView.Encoding.attributeEncode(r.body)}">${CodingView.Encoding.htmlEncode(r.body.split("/n").shift())}</div>
                                <div><time class="timeago" datetime="${new Date(r.createdAt).toISOString()}">${new Date(r.createdAt).toUTCString()}</time></div>
                                <div><a href="${r.url}" ${r.url.startsWith("http") ? "target=\"blank\"" : ""}>${CodingView.Encoding.htmlEncode(r.repo.name)}</a></div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.commits && data.commits.length > 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Latest Commits</h1></div>
                        <div class="panel-body grid-tight grid-columns-3 rounded-bottom">
                            ${data.commits.map((c) => /* html */`
                                <div class="ellipsis" title="${CodingView.Encoding.attributeEncode(c.message)}">${CodingView.Encoding.htmlEncode(c.message.split("/n").shift())}</div>
                                <div><time class="timeago" datetime="${new Date(c.createdAt).toISOString()}">${new Date(c.createdAt).toUTCString()}</time></div>
                                <div><a href="${c.url}" ${c.url.startsWith("http") ? "target=\"blank\"" : ""}>${CodingView.Encoding.htmlEncode(c.repo.name)}</a></div>
                            `).join("")}
                        </div>
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
     * @param {ViewTypes.CodingViewInfoParameters} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Coding</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li>Coding</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    This page is dedicated to showcasing the many software projects that I have created and contributed to.
                </div>
            </div>
            ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                <div class="info-panel">
                    <div class="info-panel-title rounded-top">${CodingView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                    <div class="info-panel-list rounded-bottom">
                        ${data.page.siblingPages.map((p) => /* html */`
                            <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                <div class="center">${CodingView.Encoding.htmlEncode(p.shortTitle)}</div>
                            </a>
                        `).join("")}
                    </div>
                </div>
            ` : ""}
            ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                <div class="info-panel">
                    <div class="info-panel-title rounded-top">${CodingView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                    <div class="info-panel-list rounded-bottom">
                        ${data.page.childPages.map((p) => /* html */`
                            <a class="contents" href="${p.url}">
                                <div class="center">${CodingView.Encoding.htmlEncode(p.shortTitle)}</div>
                            </a>
                        `).join("")}
                    </div>
                </div>
            ` : ""}
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Projects</div>
                <div class="info-panel-list rounded-bottom">
                    ${data.projects.map((p) => /* html */`
                        <a class="contents" href="${p.url}">
                            <div class="center">${CodingView.Encoding.htmlEncode(p.title)}</div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
CodingView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.CodingView = CodingView;
} else {
    module.exports = CodingView; // eslint-disable-line no-undef
}
