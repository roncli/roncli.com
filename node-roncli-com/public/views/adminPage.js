/**
 * @typedef {import("../../types/browser/viewTypes").AdminPageViewParameters} ViewTypes.AdminPageViewParameters
 */

//    #        #           #           ####                        #   #    #
//   # #       #                       #   #                       #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  ####       #  #  #   #   #   # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  #       ####   ##    #####   # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #      #   #  #      #       # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #  #       ####   ###    ###     #     ###    ###    # #
//                                                   #   #
//                                                    ###
/**
 * A class that represents the admin page view.
 */
class AdminPageView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminPageViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="grid">
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Page: <span id="page-url">${AdminPageView.Encoding.htmlEncode(data.page.url)}</span></h1></div>
                    <div class="panel-body grid center-items">
                        <div class="groups">
                            <div class="group">
                                <div class="group-text"><label for="page-title">Title</label></div>
                                <input type="text" id="page-title" class="group-input" placeholder="Page Title" maxlength="256" autocomplete="off" value="${AdminPageView.Encoding.attributeEncode(data.page.title)}" />
                            </div>
                            <div class="group">
                                <div class="group-text"><label for="page-short-title">Short Title</label></div>
                                <input type="text" id="page-short-title" class="group-input" placeholder="Short Page Title" maxlength="256" autocomplete="off" value="${AdminPageView.Encoding.attributeEncode(data.page.shortTitle)}" />
                            </div>
                        </div>
                        <div>
                            <button class="btn" id="page-update">Update</button>
                        </div>
                    </div>
                    <div class="panel-body grid grid-columns-2-fixed center-items">
                        <div class="grid center-items">
                            <div class="groups">
                                <div class="group">
                                    <div class="group-text"><label for="child-url">URL:</label></div>
                                    <input type="text" id="child-url" class="group-input" placeholder="/your/url/here" maxlength="256" autocomplete="off" />
                                </div>
                                <div class="group">
                                    <div class="group-text"><label for="child-url">Title:</label></div>
                                    <input type="text" id="child-title" class="group-input" placeholder="Your Page Title Here" maxlength="256" autocomplete="off" />
                                </div>
                            </div>
                            <div>
                                <button class="btn" id="child-page-add" data-parent="${AdminPageView.Encoding.attributeEncode(data.page.id)}">Add Child Page</button>
                            </div>
                        </div>
                        <div class="grid center-items">
                            <div>
                                <select id="move-page">
                                    <option value="" selected="true">-- Select a page to make a child of this page --</option>
                                    ${data.otherPages.map((p) => /* html */`
                                        <option value="${AdminPageView.Encoding.attributeEncode(p.url)}">${AdminPageView.Encoding.htmlEncode(p.title)}</option>
                                    `).join("")}
                                </select>
                            </div>
                            <div>
                                <button class="btn" id="child-page-move" data-parent="${AdminPageView.Encoding.attributeEncode(data.page.id)}">Make Page a Child of This Page</button>
                            </div>
                        </div>
                    </div>
                    <div class="panel-body rounded-bottom">
                        <div id="child-pages">
                            ${data.childPages.map((p) => /* html */`
                                <div class="pill pill-sortable grid" style="align-items: center; grid-template-columns: 1fr auto;" data-id="${p.id}">
                                    <div class="title"><a href="/admin/page${AdminPageView.Encoding.attributeEncode(p.url)}">${AdminPageView.Encoding.htmlEncode(p.shortTitle)}</a></div>
                                    <div class="delete"><button class="btn delete" data-id="${AdminPageView.Encoding.attributeEncode(p.id)}">Delete</button></div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Content</h1></div>
                    <div class="panel-body grid grid-columns-2">
                        <div id="html" class="editor-container" data-html="${AdminPageView.Encoding.attributeEncode(data.page.page)}"></div>
                        <div><button id="fullscreen"><i class="bi-arrows-fullscreen"></i></button></div>
                    </div>
                    <div class="panel-body center rounded-bottom">
                        <div><button class="btn" id="save-page">Save</button></div>
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h1>Preview</h1></div>
                </div>
                <div id="preview"></div>
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
     * @param {ViewTypes.AdminPageViewParameters} data The page data.
     * @returns {string} An HTML string of the info.
     */
    static getInfo(data) {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">${AdminPageView.Encoding.htmlEncode(data.page.shortTitle)}</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li><a href="/admin/pages">Pages</a></li>
                        ${data.page.parentPages ? data.page.parentPages.map((p) => /* html */`
                            <li><a href="/admin/page${p.url}">${AdminPageView.Encoding.htmlEncode(p.shortTitle)}</a></li>
                        `).join("") : ""}
                        <li class="info-short-title">${AdminPageView.Encoding.htmlEncode(data.page.shortTitle)}</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Add or update pages on the website.
                </div>
            </div>
            ${data.page.parentPageId && data.page.siblingPages && data.page.siblingPages.length > 1 ? /* html */`
                <div class="info-panel">
                    <div class="info-panel-title rounded-top">${AdminPageView.Encoding.htmlEncode(data.page.parentPages[data.page.parentPages.length - 1].shortTitle)}</div>
                    <div class="info-panel-list rounded-bottom">
                        ${data.page.siblingPages.map((p) => /* html */`
                            <a class="contents ${data.page.url === p.url ? "selected" : ""}" href="/admin/page${p.url}">
                                <div class="center">${AdminPageView.Encoding.htmlEncode(p.shortTitle)}</div>
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
AdminPageView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminPageView = AdminPageView;
} else {
    module.exports = AdminPageView; // eslint-disable-line no-undef
}
