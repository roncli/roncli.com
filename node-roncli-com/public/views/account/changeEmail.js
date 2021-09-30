//    #                                        #      ###   #                                  #####                  #     ##    #   #    #
//   # #                                       #     #   #  #                                  #                             #    #   #
//  #   #   ###    ###    ###   #   #  # ##   ####   #      # ##    ###   # ##    ## #   ###   #      ## #    ###    ##      #    #   #   ##     ###   #   #
//  #   #  #   #  #   #  #   #  #   #  ##  #   #     #      ##  #      #  ##  #  #  #   #   #  ####   # # #      #    #      #     # #     #    #   #  #   #
//  #####  #      #      #   #  #   #  #   #   #     #      #   #   ####  #   #   ##    #####  #      # # #   ####    #      #     # #     #    #####  # # #
//  #   #  #   #  #   #  #   #  #  ##  #   #   #  #  #   #  #   #  #   #  #   #  #      #      #      # # #  #   #    #      #     # #     #    #      # # #
//  #   #   ###    ###    ###    ## #  #   #    ##    ###   #   #   ####  #   #   ###    ###   #####  #   #   ####   ###    ###     #     ###    ###    # #
//                                                                               #   #
//                                                                                ###
/**
 * A class that represents the change email modal.
 */
class AccountChangeEmailView {
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
            <div id="changeEmail-modal">
                <div class="center"><h6>
                    Your email address is your primary form of identification for your account. For your security, you must first confirm your email address change through your current email address, and then you must revalidate your account using the new email address.<br /><br />
                    Please provide the following information below:
                </h6><br /></div>
                <div class="groups">
                    <div class="group">
                        <div class="group-text"><label for="changeEmail-password">Password:</label></div>
                        <input type="password" id="changeEmail-password" class="group-input" placeholder="Secure123!" maxlength="32" autocomplete="off" />
                    </div>
                    <div class="group">
                        <div class="group-text"><label for="changeEmail-captcha">Type the characters below:</label></div>
                        <input type="text" id="changeEmail-captcha" class="group-input" placeholder="Prove you are a human" maxlength="10" autocomplete="off" />
                    </div>
                </div>
                <div class="center">
                    <br />
                    <img id="changeEmail-captcha-image" alt="[Captcha Image]" width="180" height="50" src="/captcha?_=${new Date().getTime()}" /><br />
                    <br />
                    <button class="btn" id="changeEmail-button">Request Email Change</button>
                </div>
                <div id="changeEmail-errors"></div>
            </div>
            <div id="changeEmail-loading" class="hidden center">
                <img src="/images/roncliLoading.gif" />
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.AccountChangeEmailView = AccountChangeEmailView;
} else {
    module.exports = AccountChangeEmailView; // eslint-disable-line no-undef
}
