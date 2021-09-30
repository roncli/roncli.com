/**
 * @typedef {{[x: string]: string}} Validation
 */

//  #####                              ####                         ##    #   #    #
//  #                                  #   #                         #    #   #
//  #      # ##   # ##    ###   # ##   #   #   ###   # ##    ###     #    #   #   ##     ###   #   #
//  ####   ##  #  ##  #  #   #  ##  #  ####       #  ##  #  #   #    #     # #     #    #   #  #   #
//  #      #      #      #   #  #      #       ####  #   #  #####    #     # #     #    #####  # # #
//  #      #      #      #   #  #      #      #   #  #   #  #        #     # #     #    #      # # #
//  #####  #      #       ###   #      #       ####  #   #   ###    ###     #     ###    ###    # #
/**
 * A class that represents the error panel view template.
 */
class ErrorPanelView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered view template.
     * @param {Validation} validation The validation to display.
     * @returns {string} An HTML string of the view.
     */
    static get(validation) {
        const noError = validation["login-button"] && validation["login-button"].indexOf("Please log in") !== -1;

        return /* html */`
            <br />
            <div class="error-panel ${noError ? "noerror" : ""}">
                <div class="error-panel-title rounded-top">${noError ? "Log In" : "The following validation errors occurred:"}</div>
                <div class="error-panel-body rounded-bottom center">
                    ${Object.keys(validation).map((key) => /* html */`
                        ${ErrorPanelView.Encoding.htmlEncode(validation[key])}
                    `).join("<br />")}
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
ErrorPanelView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.ErrorPanelView = ErrorPanelView;
} else {
    module.exports = ErrorPanelView; // eslint-disable-line no-undef
}
