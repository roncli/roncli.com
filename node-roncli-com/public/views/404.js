//  #   #          #     #####                           #  #   #    #
//  #   #          #     #                               #  #   #
//  ##  #   ###   ####   #       ###   #   #  # ##    ## #  #   #   ##     ###   #   #
//  # # #  #   #   #     ####   #   #  #   #  ##  #  #  ##   # #     #    #   #  #   #
//  #  ##  #   #   #     #      #   #  #   #  #   #  #   #   # #     #    #####  # # #
//  #   #  #   #   #  #  #      #   #  #  ##  #   #  #  ##   # #     #    #      # # #
//  #   #   ###     ##   #       ###    ## #  #   #   ## #    #     ###    ###    # #
/**
 * A class that represents the 404 view.
 */
class NotFoundView {
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
                <div class="panel-title rounded-top"><h1><span id="status-code">404</span> - Not Found</h1></div>
                <div class="panel-body rounded-bottom">This page doesn't exist.</div>
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
                <div class="info-panel-title rounded-top">Page Not Found</div>
                <div class="info-panel-body rounded-bottom">
                    This page doesn't exist.  If you believe this to be in error, please <a href="mailto:roncli@roncli.com">contact me</a>.
                </div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.NotFoundView = NotFoundView;
} else {
    module.exports = NotFoundView; // eslint-disable-line no-undef
}
