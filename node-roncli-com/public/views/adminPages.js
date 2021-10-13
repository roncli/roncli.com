/**
 * @typedef {import("../../types/browser/viewTypes").AdminPagesViewParameters} ViewTypes.AdminPagesViewParameters
 */

//    #        #           #           ####                               #   #    #
//   # #       #                       #   #                              #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ###    ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  ####       #  #  #   #   #  #       # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  #       ####   ##    #####   ###    # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #      #   #  #      #          #   # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #  #       ####   ###    ###   ####     #     ###    ###    # #
//                                                   #   #
//                                                    ###
/**
 * A class that represents the admin pages view.
 */
class AdminPagesView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminPagesViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top"><h1>Top Level Pages</h1></div>
                <div class="panel-body grid grid-columns-2-fixed center-items">
                    <div class="grid center-items">
                        <div class="groups">
                            <div class="group">
                                <div class="group-text"><label for="top-level-url">URL:</label></div>
                                <input type="text" id="top-level-url" class="group-input" placeholder="/your/url/here" maxlength="256" autocomplete="off" />
                            </div>
                            <div class="group">
                                <div class="group-text"><label for="top-level-url">Title:</label></div>
                                <input type="text" id="top-level-title" class="group-input" placeholder="Your Page Title Here" maxlength="256" autocomplete="off" />
                            </div>
                        </div>
                        <div>
                            <button class="btn" id="top-level-page-add">Add Top Level Page</button>
                        </div>
                    </div>
                    <div class="grid center-items">
                        <div>
                            <select id="move-page">
                                <option value="" selected="true">-- Select a page to move to the top level --</option>
                                ${data.otherPages.map((p) => /* html */`
                                    <option value="${AdminPagesView.Encoding.attributeEncode(p.url)}">${AdminPagesView.Encoding.htmlEncode(p.title)}</option>
                                `).join("")}
                            </select>
                        </div>
                        <div>
                            <button class="btn" id="top-level-page-move">Move Page to Top Level</button>
                        </div>
                    </div>
                </div>
                <div class="panel-body rounded-bottom">
                    <div>
                        ${data.topLevelPages.map((p) => /* html */`
                            <div class="pill pill-static grid" style="align-items: center; grid-template-columns: 1fr auto;">
                                <div class="title"><a href="/admin/page${AdminPagesView.Encoding.attributeEncode(p.url)}">${AdminPagesView.Encoding.htmlEncode(p.shortTitle)}</a></div>
                                <div class="delete"><button class="btn delete" data-id="${AdminPagesView.Encoding.attributeEncode(p.id)}">Delete</button></div>
                            </div>
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
     * @returns {string} An HTML string of the info.
     */
    static getInfo() {
        return /* html */`
            <div class="info-panel">
                <div class="info-panel-title rounded-top">Pages Admin</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li>Pages</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Add or update pages on the website.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
AdminPagesView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminPagesView = AdminPagesView;
} else {
    module.exports = AdminPagesView; // eslint-disable-line no-undef
}
