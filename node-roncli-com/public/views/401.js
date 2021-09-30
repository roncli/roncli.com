//  #   #                        #     #                      #                      #  #   #    #
//  #   #                        #     #                                             #  #   #
//  #   #  # ##    ###   #   #  ####   # ##    ###   # ##    ##    #####   ###    ## #  #   #   ##     ###   #   #
//  #   #  ##  #      #  #   #   #     ##  #  #   #  ##  #    #       #   #   #  #  ##   # #     #    #   #  #   #
//  #   #  #   #   ####  #   #   #     #   #  #   #  #        #      #    #####  #   #   # #     #    #####  # # #
//  #   #  #   #  #   #  #  ##   #  #  #   #  #   #  #        #     #     #      #  ##   # #     #    #      # # #
//   ###   #   #   ####   ## #    ##   #   #   ###   #       ###   #####   ###    ## #    #     ###    ###    # #
/**
 * A class that represents the 401 view.
 */
class UnauthorizedView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered template.
     * @returns {string} An HTML string of the view.
     */
    static get() {
        return /* html */`
            <div class="panel rounded">
                <div class="panel-title rounded-top"><h1><span id="status-code">401</span> - Unauthorized</h1></div>
                <div class="panel-body rounded-bottom">You must log in to access this page.</div>
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
                <div class="info-panel-title rounded-top">Unauthorized</div>
                <div class="info-panel-body rounded-bottom">
                    This page requires a user account.  Please log in to access this page.
                </div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.UnauthorizedView = UnauthorizedView;
} else {
    module.exports = UnauthorizedView; // eslint-disable-line no-undef
}
