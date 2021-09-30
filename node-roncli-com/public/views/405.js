//  #   #          #     #                 #  #   #          #       #     ##     ##                             #  #   #    #
//  #   #          #     #                 #  #   #          #      # #     #      #                             #  #   #
//  ## ##   ###   ####   # ##    ###    ## #  ##  #   ###   ####   #   #    #      #     ###   #   #   ###    ## #  #   #   ##     ###   #   #
//  # # #  #   #   #     ##  #  #   #  #  ##  # # #  #   #   #     #   #    #      #    #   #  #   #  #   #  #  ##   # #     #    #   #  #   #
//  #   #  #####   #     #   #  #   #  #   #  #  ##  #   #   #     #####    #      #    #   #  # # #  #####  #   #   # #     #    #####  # # #
//  #   #  #       #  #  #   #  #   #  #  ##  #   #  #   #   #  #  #   #    #      #    #   #  # # #  #      #  ##   # #     #    #      # # #
//  #   #   ###     ##   #   #   ###    ## #  #   #   ###     ##   #   #   ###    ###    ###    # #    ###    ## #    #     ###    ###    # #
/**
 * A class that represents the 405 view.
 */
class MethodNotAllowedView {
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
                <div class="panel-title rounded-top"><h1><span id="status-code">405</span> - Method Not Allowed</h1></div>
                <div class="panel-body rounded-bottom">This page was accessed incorrectly.</div>
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
                <div class="info-panel-title rounded-top">Method Not Allowed</div>
                <div class="info-panel-body rounded-bottom">
                    This page was accessed incorrectly.  If you believe this to be in error, please <a href="mailto:roncli@roncli.com">contact me</a>.
                </div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.MethodNotAllowedView = MethodNotAllowedView;
} else {
    module.exports = MethodNotAllowedView; // eslint-disable-line no-undef
}
