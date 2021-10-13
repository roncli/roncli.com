//   ###   #                                  #####                  #     ##    #   #    #
//  #   #  #                                  #                             #    #   #
//  #      # ##    ###   # ##    ## #   ###   #      ## #    ###    ##      #    #   #   ##     ###   #   #
//  #      ##  #      #  ##  #  #  #   #   #  ####   # # #      #    #      #     # #     #    #   #  #   #
//  #      #   #   ####  #   #   ##    #####  #      # # #   ####    #      #     # #     #    #####  # # #
//  #   #  #   #  #   #  #   #  #      #      #      # # #  #   #    #      #     # #     #    #      # # #
//   ###   #   #   ####  #   #   ###    ###   #####  #   #   ####   ###    ###     #     ###    ###    # #
//                              #   #
//                               ###
/**
 * A class that represents the change email view.
 */
class ChangeEmailView {
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
            <div id="change-email-panel" class="panel rounded">
                <div class="panel-title rounded-top"><h1>Change Your Email Address</h1></div>
                <div class="panel-body rounded-bottom">
                    <div class="center">You may now use this form to change your email address.<br /><br /></div>
                    <div class="groups">
                        <div class="group">
                            <div class="group-text"><label for="change-email">Email:</label></div>
                            <input type="text" id="change-email" class="group-input" placeholder="yourname@domain.com" maxlength="256" autocomplete="off" />
                        </div>
                    </div>
                    <div class="center">
                        <br />
                        <button class="btn" id="change-button">Change Email</button>
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
                <div class="info-panel-title rounded-top">Change Your Email Address</div>
                <div class="info-panel-body">
                    <ul class="breadcrumb">
                        <li><a href="/">Home</a></li>
                        <li>Change Your Email Address</li>
                    </ul>
                </div>
                <div class="info-panel-body rounded-bottom">
                    You can use this page to change the email address associated with your account.  You will need to validate your new email address before you can log in with it.
                </div>
            </div>
        `;
    }

}

if (typeof module === "undefined") {
    window.ChangeEmailView = ChangeEmailView;
} else {
    module.exports = ChangeEmailView; // eslint-disable-line no-undef
}
