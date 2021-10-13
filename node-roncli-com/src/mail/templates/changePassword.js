/**
 * @typedef {import("../../../types/node/changeAuthorizationTypes").ChangeAuthorizationData} ChangeAuthorizationTypes.ChangeAuthorizationData
 * @typedef {{authorizationCode: string, changeAuthorization: ChangeAuthorizationTypes.ChangeAuthorizationData, user: User} & MailTypes.EmailData} ChangePasswordTemplateData
 * @typedef {import("../../../types/node/mailTypes").EmailData} MailTypes.EmailData
 * @typedef {import("../../models/user")} User}
 */

const Encoding = require("../../../public/js/common/encoding"),
    Template = require(".");

//   ###   #                                  ####                                                 #  #####                        ##            #
//  #   #  #                                  #   #                                                #    #                           #            #
//  #      # ##    ###   # ##    ## #   ###   #   #   ###    ###    ###   #   #   ###   # ##    ## #    #     ###   ## #   # ##     #     ###   ####    ###
//  #      ##  #      #  ##  #  #  #   #   #  ####       #  #      #      #   #  #   #  ##  #  #  ##    #    #   #  # # #  ##  #    #        #   #     #   #
//  #      #   #   ####  #   #   ##    #####  #       ####   ###    ###   # # #  #   #  #      #   #    #    #####  # # #  ##  #    #     ####   #     #####
//  #   #  #   #  #   #  #   #  #      #      #      #   #      #      #  # # #  #   #  #      #  ##    #    #      # # #  # ##     #    #   #   #  #  #
//   ###   #   #   ####  #   #   ###    ###   #       ####  ####   ####    # #    ###   #       ## #    #     ###   #   #  #       ###    ####    ##    ###
//                              #   #                                                                                      #
//                               ###                                                                                       #
/**
 * A class that represents the change password template.
 */
class ChangePasswordTemplate {
    // #      #          ##
    // #      #           #
    // ###   ###   # #    #
    // #  #   #    ####   #
    // #  #   #    #  #   #
    // #  #    ##  #  #  ###
    /**
     * Gets the rendered template for HTML email.
     * @param {ChangePasswordTemplateData} data The data to use with the template.
     * @returns {string} The HTML email.
     */
    static html(data) {
        return Template.html(/* html */`
            <table border="0" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        ${Encoding.htmlEncode(data.user.username)},<br/><br/>
                        Someone requested to change the password for this email address's account at <a href="https://roncli.com" style="color: #5d9125;">roncli.com</a>.<br /><br />
                        <ul>
                            <li>If you did not make this request, simply delete this email. Your account is as secure as your email account, as this is the only link that exists to reset your password. If you feel your email account may have been compromised, you should use this link to change your password now.<br /><br /></li>
                            <li>If you wish to change your password, please visit the link below to change your password.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td height="40">&nbsp;</td>
                </tr>
                <tr>
                    <td valign="middle" align="center" style="text-align: center;">
                        <div>
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://roncli.com/?go=passwordReset&u=${data.user.id}&a=${data.authorizationCode}" style="height: 40px; v-text-anchor: middle; width: 300px;" arcsize="10%" stroke="f" fillcolor="#22225a">
                                <w:anchorlock />
                                <center style="color:#ffffff; font-size: 20px; font-weight: bold;">Change Your Password</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!---->
                            <table cellspacing="0" cellpadding="0" align="center">
                                <tr>
                                    <td align="center" width="300" height="40" bgcolor="#22225a" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;">
                                        <a href="https://roncli.com/?go=passwordReset&u=${data.user.id}&a=${data.authorizationCode}" style="color: #ffffff; font-size: 20px; font-weight: bold; text-decoration: none; line-height: 40px; width: 100%; display: inline-block;">
                                            Change Your Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <!--[endif]-->
                        </div>
                    </td>
                </tr>
            </table>
        `, {email: data.email, reason: data.reason});
    }

    //  #                 #
    //  #                 #
    // ###    ##   #  #  ###
    //  #    # ##   ##    #
    //  #    ##     ##    #
    //   ##   ##   #  #    ##
    /**
     * Gets the rendered template for text email.
     * @param {ChangePasswordTemplateData} data The data to use with the template.
     * @returns {string} The text email.
     */
    static text(data) {
        return Template.text(`${data.user.username},

Someone requested a password reset for this email address's account at roncli.com.

* If you did not make this request, simply delete this email.  Your account is as secure as your email account, as this is the only link that exists to reset your password.  If you feel your email account may have been compromised, you should use this link to change your password now.
* If you wish to change your password, please visit the link below to change your password.

Change Your Password: https://roncli.com/?go=passwordReset&u=${data.user.id}&a=${data.authorizationCode}`, {email: data.email, reason: data.reason});
    }
}

module.exports = ChangePasswordTemplate;
