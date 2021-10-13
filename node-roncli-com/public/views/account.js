/**
 * @typedef {import("../../src/models/user")} User
 */

//    #                                        #     #   #    #
//   # #                                       #     #   #
//  #   #   ###    ###    ###   #   #  # ##   ####   #   #   ##     ###   #   #
//  #   #  #   #  #   #  #   #  #   #  ##  #   #      # #     #    #   #  #   #
//  #####  #      #      #   #  #   #  #   #   #      # #     #    #####  # # #
//  #   #  #   #  #   #  #   #  #  ##  #   #   #  #   # #     #    #      # # #
//  #   #   ###    ###    ###    ## #  #   #    ##     #     ###    ###    # #
/**
 * A class that represents the account view.
 */
class AccountView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {User} user The user data.
     * @returns {string} An HTML string of the page.
     */
    static get(user) {
        return /* html */`
            <div class="grid grid-columns-2-fixed">
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h2>Your Account Information</h2></div>
                    <div class="panel-body rounded-bottom">
                        <div class="groups">
                            <div class="group">
                                <div class="group-text">Email:</div>
                                <div class="group-text value">${AccountView.Encoding.htmlEncode(user.email)}</div>
                            </div>
                            <div class="group">
                                <div class="group-text">Alias:</div>
                                <div class="group-text value" id="account-alias">${AccountView.Encoding.htmlEncode(user.username)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="panel rounded">
                    <div class="panel-title rounded-top"><h2>Update Your Information</h2></div>
                    <div class="panel-body rounded-bottom center">
                        <button class="btn" id="change-email">Change Your Email Address</button><br /><br />
                        <button class="btn" id="change-alias">Change Your Alias</button><br /><br />
                        <button class="btn" id="change-password">Change Your Password</button>
                    </div>
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
                <div class="info-panel-title rounded-top">Welcome</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li>Account</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    From here, you can view or change your account information, including your email, alias, and password.  Please note that changing your password will require email verification, and changing your email address will require email verification both with your existing email address and with your new email address.
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
AccountView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AccountView = AccountView;
} else {
    module.exports = AccountView; // eslint-disable-line no-undef
}
