//   ###   #                                  ####                                                 #  #   #    #
//  #   #  #                                  #   #                                                #  #   #
//  #      # ##    ###   # ##    ## #   ###   #   #   ###    ###    ###   #   #   ###   # ##    ## #  #   #   ##     ###   #   #
//  #      ##  #      #  ##  #  #  #   #   #  ####       #  #      #      #   #  #   #  ##  #  #  ##   # #     #    #   #  #   #
//  #      #   #   ####  #   #   ##    #####  #       ####   ###    ###   # # #  #   #  #      #   #   # #     #    #####  # # #
//  #   #  #   #  #   #  #   #  #      #      #      #   #      #      #  # # #  #   #  #      #  ##   # #     #    #      # # #
//   ###   #   #   ####  #   #   ###    ###   #       ####  ####   ####    # #    ###   #       ## #    #     ###    ###    # #
//                              #   #
//                               ###
/**
 * A class that represents the change password view.
 */
class ChangePasswordView {
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
            <div id="change-password-panel" class="panel rounded">
                <div class="panel-title rounded-top"><h1>Change Your Password</h1></div>
                <div class="panel-body rounded-bottom">
                    <div class="center">You may now use this form to change your password.<br /><br /></div>
                    <div class="groups">
                        <div class="group">
                            <div class="group-text"><label for="change-password">Password:</label></div>
                            <input type="password" id="change-password" class="group-input" placeholder="Secure123!" maxlength="32" autocomplete="off" />
                        </div>
                        <div class="group">
                            <div class="group-text"><label for="change-retype-password">Retype password:</label></div>
                            <input type="password" id="change-retype-password" class="group-input" placeholder="Secure123!" maxlength="32" autocomplete="off" />
                        </div>
                    </div>
                    <div class="center">
                        <br />
                        <button class="btn" id="change-button">Change Password</button>
                    </div>
                    <div id="change-errors"></div>
                </div>
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
                <div class="info-panel-title rounded-top">Change Your Password</div>
                <div class="info-panel-body rounded-bottom">
                    You can use this page to change your password.  It is recommended to use a unique password that you haven't used before.
                </div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.ChangePasswordView = ChangePasswordView;
} else {
    module.exports = ChangePasswordView; // eslint-disable-line no-undef
}
