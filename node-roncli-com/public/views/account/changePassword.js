//    #                                        #      ###   #                                  ####                                                 #  #   #    #
//   # #                                       #     #   #  #                                  #   #                                                #  #   #
//  #   #   ###    ###    ###   #   #  # ##   ####   #      # ##    ###   # ##    ## #   ###   #   #   ###    ###    ###   #   #   ###   # ##    ## #  #   #   ##     ###   #   #
//  #   #  #   #  #   #  #   #  #   #  ##  #   #     #      ##  #      #  ##  #  #  #   #   #  ####       #  #      #      #   #  #   #  ##  #  #  ##   # #     #    #   #  #   #
//  #####  #      #      #   #  #   #  #   #   #     #      #   #   ####  #   #   ##    #####  #       ####   ###    ###   # # #  #   #  #      #   #   # #     #    #####  # # #
//  #   #  #   #  #   #  #   #  #  ##  #   #   #  #  #   #  #   #  #   #  #   #  #      #      #      #   #      #      #  # # #  #   #  #      #  ##   # #     #    #      # # #
//  #   #   ###    ###    ###    ## #  #   #    ##    ###   #   #   ####  #   #   ###    ###   #       ####  ####   ####    # #    ###   #       ## #    #     ###    ###    # #
//                                                                               #   #
//                                                                                ###
/**
 * A class that represents the change password modal.
 */
class AccountChangePasswordView {
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
            <div id="changePassword-modal">
                <div class="center"><h6>Please provide the following information below to change your password.</h6><br /></div>
                <div class="groups">
                    <div class="group">
                        <div class="group-text"><label for="changePassword-current-password">Current Password:</label></div>
                        <input type="password" id="changePassword-current-password" class="group-input" placeholder="Secure123!" maxlength="32" autocomplete="off" />
                    </div>
                    <div class="group">
                        <div class="group-text"><label for="changePassword-new-password">New Password:</label></div>
                        <input type="password" id="changePassword-new-password" class="group-input" placeholder="Secure123!" maxlength="32" autocomplete="off" />
                    </div>
                    <div class="group">
                        <div class="group-text"><label for="changePassword-retype-password">Retype password:</label></div>
                        <input type="password" id="changePassword-retype-password" class="group-input" placeholder="Secure123!" maxlength="32" autocomplete="off" />
                    </div>
                    <div class="group">
                        <div class="group-text"><label for="changePassword-captcha">Type the characters below:</label></div>
                        <input type="text" id="changePassword-captcha" class="group-input" placeholder="Prove you are a human" maxlength="10" autocomplete="off" />
                    </div>
                </div>
                <div class="center">
                    <br />
                    <img id="changePassword-captcha-image" alt="[Captcha Image]" width="180" height="50" src="/captcha?_=${new Date().getTime()}" /><br />
                    <br />
                    <button class="btn" id="changePassword-button">Change Password</button>
                </div>
                <div id="changePassword-errors"></div>
            </div>
            <div id="changePassword-loading" class="hidden center">
                <img src="/images/roncliLoading.gif" />
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.AccountChangePasswordView = AccountChangePasswordView;
} else {
    module.exports = AccountChangePasswordView; // eslint-disable-line no-undef
}
