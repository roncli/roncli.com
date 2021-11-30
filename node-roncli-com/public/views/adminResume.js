/**
 * @typedef {import("../../types/browser/viewTypes").AdminResumeViewParameters} ViewTypes.AdminResumeViewParameters
 */

//    #        #           #           ####                                      #   #    #
//   # #       #                       #   #                                     #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ###   #   #  ## #    ###   #   #   ##     ###   #   #
//  #   #  #  ##  # # #    #    ##  #  ####   #   #  #      #   #  # # #  #   #   # #     #    #   #  #   #
//  #####  #   #  # # #    #    #   #  # #    #####   ###   #   #  # # #  #####   # #     #    #####  # # #
//  #   #  #  ##  # # #    #    #   #  #  #   #          #  #  ##  # # #  #       # #     #    #      # # #
//  #   #   ## #  #   #   ###   #   #  #   #   ###   ####    ## #  #   #   ###     #     ###    ###    # #
/**
 * A class that handles the admin résumé page.
 */
class AdminResumeView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.AdminResumeViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top"><h1>Résumé JSON</h1></div>
                <div class="panel-body grid grid-columns-2">
                    <div id="html" class="editor-container" data-html="${AdminResumeView.Encoding.attributeEncode(data.resume.resume)}"></div>
                    <div><button id="fullscreen"><i class="bi-arrows-fullscreen"></i></button></div>
                </div>
                <div class="panel-body center rounded-bottom">
                    <div><button class="btn" id="save-json">Save</button></div>
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
                <div class="info-panel-title rounded-top">Résumé Admin</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li>YouTube</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    Modify the résumé JSON.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
AdminResumeView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AdminResumeView = AdminResumeView;
} else {
    module.exports = AdminResumeView; // eslint-disable-line no-undef
}
