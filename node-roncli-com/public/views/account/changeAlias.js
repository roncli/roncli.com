//    #                                        #      ###   #                                    #     ##      #                  #   #    #
//   # #                                       #     #   #  #                                   # #     #                         #   #
//  #   #   ###    ###    ###   #   #  # ##   ####   #      # ##    ###   # ##    ## #   ###   #   #    #     ##     ###    ###   #   #   ##     ###   #   #
//  #   #  #   #  #   #  #   #  #   #  ##  #   #     #      ##  #      #  ##  #  #  #   #   #  #   #    #      #        #  #       # #     #    #   #  #   #
//  #####  #      #      #   #  #   #  #   #   #     #      #   #   ####  #   #   ##    #####  #####    #      #     ####   ###    # #     #    #####  # # #
//  #   #  #   #  #   #  #   #  #  ##  #   #   #  #  #   #  #   #  #   #  #   #  #      #      #   #    #      #    #   #      #   # #     #    #      # # #
//  #   #   ###    ###    ###    ## #  #   #    ##    ###   #   #   ####  #   #   ###    ###   #   #   ###    ###    ####  ####     #     ###    ###    # #
//                                                                               #   #
//                                                                                ###
/**
 * A class that represents the change alias modal.
 */
class AccountChangeAliasView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered view template.
     * @returns {string} An HTML string of the view.
     */
    static get() {
        return /* html */`
            <div id="changeAlias-modal">
                <div class="center"><h6>Please enter your desired alias.</h6><br /></div>
                <div class="groups">
                    <div class="group">
                        <div class="group-text"><label for="changeAlias-alias">New Alias:</label></div>
                        <input type="text" id="changeAlias-alias" class="group-input" placeholder="Secure123!" maxlength="50" autocomplete="off" />
                    </div>
                </div>
                <div class="center">
                    <br />
                    <button class="btn" id="changeAlias-button">Change Alias</button>
                </div>
                <div id="changeAlias-errors"></div>
            </div>
            <div id="changeAlias-loading" class="hidden center">
                <img src="/images/roncliLoading.gif" />
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.AccountChangeAliasView = AccountChangeAliasView;
} else {
    module.exports = AccountChangeAliasView; // eslint-disable-line no-undef
}
