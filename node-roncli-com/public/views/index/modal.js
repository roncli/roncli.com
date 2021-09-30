//  #   #             #          ##    #   #    #
//  #   #             #           #    #   #
//  ## ##   ###    ## #   ###     #    #   #   ##     ###   #   #
//  # # #  #   #  #  ##      #    #     # #     #    #   #  #   #
//  #   #  #   #  #   #   ####    #     # #     #    #####  # # #
//  #   #  #   #  #  ##  #   #    #     # #     #    #      # # #
//  #   #   ###    ## #   ####   ###     #     ###    ###    # #
/**
 * A class that represents the modal view.
 */
class ModalView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered view template.
     * @param {string} text The text to display.
     * @returns {string} An HTML string of the view.
     */
    static get(text) {
        return /* html */`
            <div class="center">
                ${text}<br /><br />
                <button class="ok btn">OK</button>
            </div>
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
ModalView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.ModalView = ModalView;
} else {
    module.exports = ModalView; // eslint-disable-line no-undef
}
