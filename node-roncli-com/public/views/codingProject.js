/**
 * @typedef {import("../../types/browser/viewTypes").CodingProjectViewParameters} ViewTypes.CodingProjectViewParameters
 * @typedef {import("../../types/browser/viewTypes").CodingProjectViewInfoParameters} ViewTypes.CodingProjectViewInfoParameters
 */

//   ###              #    #                  ####                    #                  #     #   #    #
//  #   #             #                       #   #                                      #     #   #
//  #       ###    ## #   ##    # ##    ## #  #   #  # ##    ###     ##    ###    ###   ####   #   #   ##     ###   #   #
//  #      #   #  #  ##    #    ##  #  #  #   ####   ##  #  #   #     #   #   #  #   #   #      # #     #    #   #  #   #
//  #      #   #  #   #    #    #   #   ##    #      #      #   #     #   #####  #       #      # #     #    #####  # # #
//  #   #  #   #  #  ##    #    #   #  #      #      #      #   #     #   #      #   #   #  #   # #     #    #      # # #
//   ###    ###    ## #   ###   #   #   ###   #      #       ###   #  #    ###    ###     ##     #     ###    ###    # #
//                                     #   #                       #  #
//                                      ###                         ##
/**
 * A class that represents the coding project view.
 */
class CodingProjectView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.CodingProjectViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid">
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>${CodingProjectView.Encoding.htmlEncode(data.project.title)}</h1></div>
                    <div class="panel-body grid-tight grid-columns-2-fixed">
                        <div>Project Homepage: <a href="${data.project.repository.repository.url}" target="_blank">${CodingProjectView.Encoding.htmlEncode(data.project.repository.repository.url)}</a></div>
                        <div>Created: <time class="timeago" datetime="${new Date(data.project.repository.repository.createdAt).toISOString()}">${new Date(data.project.repository.repository.createdAt).toUTCString()}</time></div>
                        <div>Primary Language: ${data.project.repository.repository.primaryLanguage}</div>
                        <div>Updated: <time class="timeago" datetime="${new Date(data.project.repository.repository.updatedAt).toISOString()}">${new Date(data.project.repository.repository.updatedAt).toUTCString()}</time></div>
                    </div>
                    <div class="panel-body rounded-bottom">${CodingProjectView.Encoding.htmlEncode(data.project.repository.repository.description)}</div>
                </div>
                ${data.page ? /* html */`
                    <div>
                        ${data.page.page}
                    </div>
                ` : ""}
                ${data.project.repository.releases && data.project.repository.releases.length > 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Releases</h1></div>
                        ${data.project.repository.releases.map((r, i) => /* html */`
                            <div class="panel-body">
                                <h4><a href="${r.url}" target="_blank">${CodingProjectView.Encoding.htmlEncode(r.name)}</a></h4>
                                <div><time class="timeago" datetime="${new Date(r.createdAt).toISOString()}">${new Date(r.createdAt).toUTCString()}</time></div>
                            </div>
                            <div class="panel-body ${i === data.project.repository.releases.length - 1 ? "rounded-bottom" : ""}">
                                <div>${r.body.trim().replace(/\r\n/g, "\n").replace(/[\r\n]/g, "<br />")}</div>
                            </div>
                        `).join("")}
                    </div>
                ` : ""}
                ${data.project.repository.commits && data.project.repository.commits.length > 0 ? /* html */`
                    <div class="panel rounded">
                        <div class="panel-title rounded-top"><h1>Commits</h1></div>
                        <div class="panel-body grid-tight grid-columns-3 rounded-bottom" style="grid-template-columns: 1fr auto auto;">
                            ${data.project.repository.commits.map((c) => /* html */`
                                <div class="ellipsis" title="${CodingProjectView.Encoding.attributeEncode(c.description)}">${CodingProjectView.Encoding.htmlEncode(c.description.split("\n").shift())}</div>
                                <div><time class="timeago" datetime="${new Date(c.createdAt).toISOString()}">${new Date(c.createdAt).toUTCString()}</time></div>
                                <div><a href="${c.url}" target="_blank">${c.sha.substr(0, 7)}</a></div>
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
     * @param {ViewTypes.CodingProjectViewInfoParameters} data The info data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Coding</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/coding">Coding</a></li>
                        <li>${CodingProjectView.Encoding.htmlEncode(data.title)}</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    This page is dedicated to showcasing the many software projects that I have created and contributed to.
                </div>
            </div>
            ${data.page ? /* html */`
                ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${CodingProjectView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.siblingPages.map((p) => /* html */`
                                <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="${p.url}">
                                    <div class="center">${CodingProjectView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
                ${data.page.childPages && data.page.childPages.length > 0 ? /* html */`
                    <div class="info-panel">
                        <div class="info-panel-title rounded-top">${CodingProjectView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                        <div class="info-panel-list rounded-bottom">
                            ${data.page.childPages.map((p) => /* html */`
                                <a class="contents" href="${p.url}">
                                    <div class="center">${CodingProjectView.Encoding.htmlEncode(p.shortTitle)}</div>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
            ` : ""}
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Projects</div>
                <div class="info-panel-list rounded-bottom">
                    ${data.projects.map((p) => /* html */`
                        <a class="contents" href="${p.url}">
                            <div class="center">${CodingProjectView.Encoding.htmlEncode(p.title)}</div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
CodingProjectView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.CodingProjectView = CodingProjectView;
} else {
    module.exports = CodingProjectView; // eslint-disable-line no-undef
}
