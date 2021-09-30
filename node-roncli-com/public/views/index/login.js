//  #                      #           #   #    #
//  #                                  #   #
//  #       ###    ## #   ##    # ##   #   #   ##     ###   #   #
//  #      #   #  #  #     #    ##  #   # #     #    #   #  #   #
//  #      #   #   ##      #    #   #   # #     #    #####  # # #
//  #      #   #  #        #    #   #   # #     #    #      # # #
//  #####   ###    ###    ###   #   #    #     ###    ###    # #
//                #   #
//                 ###
/**
 * A class that represents the login modal.
 */
class LoginView {
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
            <div id="login-modal">
                <div class="center"><h6>Log in, or register with roncli.com for free.</h6><br /></div>
                <div class="tabs">
                    <input type="radio" name="login-tabs" id="login-tabs-login" hidden aria-hidden="true" checked />
                    <input type="radio" name="login-tabs" id="login-tabs-register" hidden aria-hidden="true" />
                    <input type="radio" name="login-tabs" id="login-tabs-recover-password" hidden aria-hidden="true" />
                    <ul hidden aria-hidden="true">
                        <li><label for="login-tabs-login">Login</label></li>
                        <li><label for="login-tabs-register">Register</label></li>
                        <li><label for="login-tabs-recover-password">Recover Password</label></li>
                    </ul>
                    <div>
                        <section id="section-login">
                            <h2>Login</h2>
                            <div class="groups">
                                <div class="group">
                                    <div class="group-text"><label for="login-email">Email:</label></div>
                                    <input type="text" id="login-email" class="group-input" placeholder="yourname@domain.com" maxlength="256" autocomplete="off" />
                                </div>
                                <div class="group">
                                    <div class="group-text"><label for="login-password">Password:</label></div>
                                    <input type="password" id="login-password" class="group-input" placeholder="Secure123!" maxlength="32" autocomplete="off" />
                                </div>
                            </div>
                            <div class="center">
                                <br />
                                <div class="vertical-align-middle">
                                    <input type="checkbox" id="login-save-login" />
                                    <label for="login-save-login"> Save Login</label>
                                </div>
                                <br />
                                <button class="btn" id="login-button">Login</button>
                            </div>
                            <div id="login-errors"></div>
                        </section>
                        <section id="section-register">
                            <h2>Register</h2>
                            <div class="groups">
                                <div class="group">
                                    <div class="group-text"><label for="register-email">Email:</label></div>
                                    <input type="text" id="register-email" class="group-input" placeholder="yourname@domain.com" maxlength="256" autocomplete="off" />
                                </div>
                                <div class="group">
                                    <div class="group-text"><label for="register-password">Password:</label></div>
                                    <input type="password" id="register-password" class="group-input" placeholder="Secure123!" maxlength="32" autocomplete="off" />
                                </div>
                                <div class="group">
                                    <div class="group-text"><label for="register-retype-password">Retype password:</label></div>
                                    <input type="password" id="register-retype-password" class="group-input" placeholder="Secure123!" maxlength="32" autocomplete="off" />
                                </div>
                                <div class="group">
                                    <div class="group-text"><label for="register-alias">Alias:</label></div>
                                    <input type="text" id="register-alias" class="group-input" placeholder="Your nickname" maxlength="50" autocomplete="off" />
                                </div>
                                <div class="group">
                                    <div class="group-text"><label for="register-dob">(<a href="https://www.onguardonline.gov/articles/0031-protecting-your-childs-privacy-online" target="_blank">COPPA</a> compliance) Date of birth:</label></div>
                                    <input type="date" id="register-dob" class="group-input" placeholder="Must be 13 years or older" autocomplete="off" min="1900-01-01" max="${new Date().getFullYear()}-01-01" />
                                </div>
                                <div class="group">
                                    <div class="group-text"><label for="register-captcha">Type the characters below:</label></div>
                                    <input type="text" id="register-captcha" class="group-input" placeholder="Prove you are a human" maxlength="10" autocomplete="off" />
                                </div>
                            </div>
                            <div class="center">
                                <br />
                                <img id="register-captcha-image" alt="[Captcha Image]" width="180" height="50" src="/captcha?_=${new Date().getTime()}" /><br />
                                <br />
                                <button class="btn" id="register-button">Register</button>
                            </div>
                            <div id="register-errors"></div>
                        </section>
                        <section id="section-recover">
                            <h2>Recover Password</h2>
                            <div class="center">
                                <h6>To recover your password, enter your email address below.  You will be sent an email that will include a link that you can use to change your password.</h6><br />
                            </div>
                            <div class="groups">
                                <div class="group">
                                    <div class="group-text"><label for="recover-email">Email:</label></div>
                                    <input type="text" id="recover-email" class="group-input" placeholder="yourname@domain.com" maxlength="256" autocomplete="off" />
                                </div>
                            </div>
                            <div class="center">
                                <br />
                                <button class="btn" id="recover-button">Recover Password</button>
                            </div>
                            <div id="recover-errors"></div>
                        </section>
                    </div>
                </div>
            </div>
            <div id="login-loading" class="hidden center">
                <img src="/images/roncliLoading.gif" />
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.LoginView = LoginView;
} else {
    module.exports = LoginView; // eslint-disable-line no-undef
}
