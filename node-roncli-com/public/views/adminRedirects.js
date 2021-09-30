/**
 * @typedef {import("../../types/browser/viewTypes").AdminRedirectsViewParameters} ViewTypes.AdminRedirectsViewParameters
 */

//    #        #           #           ####              #    #                          #            #   #    #
//   # #       #                       #   #             #                               #            #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ##    # ##    ###    ###   ####    ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  ####   #   #  #  ##    #    ##  #  #   #  #   #   #     #       # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  # #    #####  #   #    #    #      #####  #       #      ###    # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #  #   #      #  ##    #    #      #      #   #   #  #      #   # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #  #   #   ###    ## #   ###   #       ###    ###     ##   ####     #     ###    ###    # #
/**
 * A class that represents the admin redirects view.
 */
class AdminRedirectsView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminRedirectsViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div id="admin-files" class="panel rounded">
                <div class="panel-title rounded-top"><h1>Redirects Admin</h1></div>
                <div class="panel-body grid center-items">
                    <div class="groups">
                        <div class="group">
                            <div class="group-text"><label for="add-redirect-from">Redirect From Path:</label></div>
                            <input type="text" id="add-redirect-from" class="group-input" placeholder="/path/to/redirect" maxlength="256" autocomplete="off" />
                        </div>
                        <div class="group">
                            <div class="group-text"><label for="add-redirect-to">Redirect To URL:</label></div>
                            <input type="text" id="add-redirect-to" class="group-input" placeholder="https://redirect.com/url" maxlength="256" autocomplete="off" />
                        </div>
                    </div>
                    <div>
                        <button class="btn" id="add-redirect">Add Redirect</button>
                    </div>
                </div>
                <div class="panel-body rounded-bottom">
                    ${data.redirects.map((redirect) => /* html */`
                        <div class="pill pill-static grid" style="grid-template-columns: 1fr 3fr auto; align-items: center;">
                            <div class="fromPath">${AdminRedirectsView.Encoding.htmlEncode(redirect.fromPath)}</div>
                            <div class="toUrl wrap-anywhere"><a href="${redirect.toUrl}" target="_blank">${AdminRedirectsView.Encoding.htmlEncode(redirect.toUrl)}</a></div>
                            <div class="actions">
                                <button class="btn delete" data-id="${redirect.id}">Delete</button>
                            </div>
                        </div>
                    `).join("")}
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
                <div class="info-panel-title rounded-top">Redirects Admin</div>
                <div class="info-panel-body rounded-bottom">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li>Redirects</li>
                    </ul>
                    Add or remove ronc.li redirects.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
AdminRedirectsView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminRedirectsView = AdminRedirectsView;
} else {
    module.exports = AdminRedirectsView; // eslint-disable-line no-undef
}
