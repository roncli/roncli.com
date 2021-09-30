//   ###                                      #####                              #   #    #
//  #   #                                     #                                  #   #
//  #       ###   # ##   #   #   ###   # ##   #      # ##   # ##    ###   # ##   #   #   ##     ###   #   #
//   ###   #   #  ##  #  #   #  #   #  ##  #  ####   ##  #  ##  #  #   #  ##  #   # #     #    #   #  #   #
//      #  #####  #       # #   #####  #      #      #      #      #   #  #       # #     #    #####  # # #
//  #   #  #      #       # #   #      #      #      #      #      #   #  #       # #     #    #      # # #
//   ###    ###   #        #     ###   #      #####  #      #       ###   #        #     ###    ###    # #
/**
 * A class that represents the 500 view.
 */
class ServerErrorView {
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
                <div class="panel-title rounded-top"><h1><span id="status-code">500</span> - Server Error</h1></div>
                <div class="panel-body rounded-bottom">Something broke.  The error that caused this has been logged.  Please try your request again later.</div>
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
                <div class="info-panel-title rounded-top">Server Error</div>
                <div class="info-panel-body rounded-bottom">
                    If this error occurs frequently, please <a href="mailto:roncli@roncli.com">contact me</a>.
                </div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.ServerErrorView = ServerErrorView;
} else {
    module.exports = ServerErrorView; // eslint-disable-line no-undef
}
