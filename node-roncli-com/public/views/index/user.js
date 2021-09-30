/**
 * @typedef {import("../../../src/models/user")} User
 * @typedef {import("../../../types/browser/viewTypes").UserViewParameters} ViewTypes.UserViewParameters
 */

//  #   #                       #   #    #
//  #   #                       #   #
//  #   #   ###    ###   # ##   #   #   ##     ###   #   #
//  #   #  #      #   #  ##  #   # #     #    #   #  #   #
//  #   #   ###   #####  #       # #     #    #####  # # #
//  #   #      #  #      #       # #     #    #      # # #
//   ###   ####    ###   #        #     ###    ###    # #
/**
 * A class that represents the user view template.
 */
class UserView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered view template.
     * @param {ViewTypes.UserViewParameters} data The user to render the view with.
     * @returns {string} An HTML string of the view.
     */
    static get(data) {
        return data.user ? /* html */`
            <li class="login">
                <a href="#" id="log-out">Log Out</a>
            </li>
            <li class="login">
                <a href="/account">Your Account</a>
            </li>
            ${data.userLinks && data.userLinks.length > 0 ? data.userLinks.map((link) => /* html */`
                <li class="login">
                    <a href="${link.href}">${UserView.Encoding.htmlEncode(link.title)}</a>
                </li>
            `).reverse().join("") : ""}
            <li class="login no-link">
                Welcome, <span id="alias">${UserView.Encoding.htmlEncode(data.user.username)}</span>!
            </li>
        ` : /* html */`
            <li class="login">
                <a href="#" id="log-in">Login</a>
            </li>
        `;
    }
}

/** @type {typeof import("../../js/common/encoding")} */
// @ts-ignore
UserView.Encoding = typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.UserView = UserView;
} else {
    module.exports = UserView; // eslint-disable-line no-undef
}
