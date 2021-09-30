//    #        #      #  #####                              #   #    #
//   # #       #      #  #                                  #   #
//  #   #   ## #   ## #  #      # ##   # ##    ###   # ##   #   #   ##     ###   #   #
//  #   #  #  ##  #  ##  ####   ##  #  ##  #  #   #  ##  #   # #     #    #   #  #   #
//  #####  #   #  #   #  #      #      #      #   #  #       # #     #    #####  # # #
//  #   #  #  ##  #  ##  #      #      #      #   #  #       # #     #    #      # # #
//  #   #   ## #   ## #  #####  #      #       ###   #        #     ###    ###    # #
/**
 * A class that represents the add error view.
 */
class AddErrorView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered view template.
     * @param {Error} err The error.
     * @returns {string} An HTML string of the view.
     */
    static get(err) {
        return /* html */`
            <div class="center">
                ${AddErrorView.Encoding.htmlEncode(err.message)}<br /><br />
                <button class="ok btn">OK</button>
            </div>
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
AddErrorView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AddErrorView = AddErrorView;
} else {
    module.exports = AddErrorView; // eslint-disable-line no-undef
}
