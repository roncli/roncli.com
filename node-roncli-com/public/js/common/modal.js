//  #   #             #          ##
//  #   #             #           #
//  ## ##   ###    ## #   ###     #
//  # # #  #   #  #  ##      #    #
//  #   #  #   #  #   #   ####    #
//  #   #  #   #  #  ##  #   #    #
//  #   #   ###    ## #   ####   ###
/**
 * A class to create a modal dialog.
 */
class Modal {
    //       ##
    //        #
    //  ##    #     ##    ###    ##
    // #      #    #  #  ##     # ##
    // #      #    #  #    ##   ##
    //  ##   ###    ##   ###     ##
    /**
     * Closes the modal dialog.
     * @returns {void}
     */
    close() {
        this.el.parentNode.removeChild(this.el);
    }

    //    #   #                 ##
    //    #                      #
    //  ###  ##     ###   ###    #     ###  #  #
    // #  #   #    ##     #  #   #    #  #  #  #
    // #  #   #      ##   #  #   #    # ##   # #
    //  ###  ###   ###    ###   ###    # #    #
    //                    #                  #
    /**
     * Display a modal dialog.
     * @param {string} title The HTML of the title to display.
     * @param {string} body The HTML of the body to display.
     * @returns {void}
     */
    display(title, body) {
        const modal = /* html */`
            <div class="content panel">
                <div class="panel-title rounded-top">
                    ${title}
                    <button class="close"><i class="bi-x"></i></button>
                </div>
                <div class="panel-body rounded-bottom">${body}</div>
            </div>
        `;

        const oldEl = document.getElementById("modal");

        if (oldEl) {
            oldEl.parentNode.removeChild(oldEl);
        }

        this.el = document.createElement("div");

        this.el.id = "modal";
        this.el.innerHTML = modal;

        document.getElementById("page-body").appendChild(this.el);

        document.querySelector("#modal .close").addEventListener("click", () => {
            this.close();
        });
    }
}

if (typeof module === "undefined") {
    window.Modal = Modal;
} else {
    module.exports = Modal; // eslint-disable-line no-undef
}
