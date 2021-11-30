//  ####                                      #   #    #
//  #   #                                     #   #
//  #   #   ###    ###   #   #  ## #    ###   #   #   ##     ###   #   #
//  ####   #   #  #      #   #  # # #  #   #   # #     #    #   #  #   #
//  # #    #####   ###   #   #  # # #  #####   # #     #    #####  # # #
//  #  #   #          #  #  ##  # # #  #       # #     #    #      # # #
//  #   #   ###   ####    ## #  #   #   ###     #     ###    ###    # #
/**
 * A class that handles the admin résumé page.
 */
class ResumeView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @returns {string} An HTML string of the page.
     */
    static get() {
        return /* html */`
            <div id="json-root">
                <div id="back-link"><a href="/life/resume">&lt; Back to roncli.com</a></div>
                <div id="front-brace">{</div>
                <div id="back-brace">}</div>
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
        return "";
    }
}

if (typeof module === "undefined") {
    window.ResumeView = ResumeView;
} else {
    module.exports = ResumeView; // eslint-disable-line no-undef
}
