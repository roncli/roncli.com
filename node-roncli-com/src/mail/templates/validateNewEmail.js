/**
 * @typedef {import("../../../types/node/changeAuthorizationTypes").ChangeAuthorizationData} ChangeAuthorizationTypes.ChangeAuthorizationData
 * @typedef {{authorizationCode: string, changeAuthorization: ChangeAuthorizationTypes.ChangeAuthorizationData, user: User} & MailTypes.EmailData} ValidateNewEmailTemplateData
 * @typedef {import("../../../types/node/mailTypes").EmailData} MailTypes.EmailData
 * @typedef {import("../../models/user")} User}
 */

const Encoding = require("../../../public/js/common/encoding"),
    Template = require(".");

//  #   #          ##      #        #          #            #   #                #####                  #     ##    #####                        ##            #
//  #   #           #               #          #            #   #                #                             #      #                           #            #
//  #   #   ###     #     ##     ## #   ###   ####    ###   ##  #   ###   #   #  #      ## #    ###    ##      #      #     ###   ## #   # ##     #     ###   ####    ###
//   # #       #    #      #    #  ##      #   #     #   #  # # #  #   #  #   #  ####   # # #      #    #      #      #    #   #  # # #  ##  #    #        #   #     #   #
//   # #    ####    #      #    #   #   ####   #     #####  #  ##  #####  # # #  #      # # #   ####    #      #      #    #####  # # #  ##  #    #     ####   #     #####
//   # #   #   #    #      #    #  ##  #   #   #  #  #      #   #  #      # # #  #      # # #  #   #    #      #      #    #      # # #  # ##     #    #   #   #  #  #
//    #     ####   ###    ###    ## #   ####    ##    ###   #   #   ###    # #   #####  #   #   ####   ###    ###     #     ###   #   #  #       ###    ####    ##    ###
//                                                                                                                                       #
//                                                                                                                                       #
/**
 * A class that represents the change email template.
 */
class ValidateNewEmailTemplate {
    // #      #          ##
    // #      #           #
    // ###   ###   # #    #
    // #  #   #    ####   #
    // #  #   #    #  #   #
    // #  #    ##  #  #  ###
    /**
     * Gets the rendered template for HTML email.
     * @param {ValidateNewEmailTemplateData} data The data to use with the template.
     * @returns {string} The HTML email.
     */
    static html(data) {
        return Template.html(/* html */`
            <table border="0" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        ${Encoding.htmlEncode(data.user.username)},<br/><br/>
                        Someone requested to change the email address for their account at <a href="https://roncli.com" style="color: #5d9125;">roncli.com</a> to this email address.<br /><br />
                        <ul>
                            <li>If you did not make this request, simply delete this email.<br /><br /></li>
                            <li>If you wish to complete your email address change, please visit the link below to complete the change.</li>
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
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://roncli.com/?go=emailValidate&u=${data.user.id}&a=${data.authorizationCode}" style="height: 40px; v-text-anchor: middle; width: 300px;" arcsize="10%" stroke="f" fillcolor="#22225a">
                                <w:anchorlock />
                                <center style="color:#ffffff; font-size: 20px; font-weight: bold;">Complete Your Email Address Change</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!---->
                            <table cellspacing="0" cellpadding="0" align="center">
                                <tr>
                                    <td align="center" width="300" height="40" bgcolor="#22225a" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;">
                                        <a href="https://roncli.com/?go=emailValidate&u=${data.user.id}&a=${data.authorizationCode}" style="color: #ffffff; font-size: 20px; font-weight: bold; text-decoration: none; line-height: 40px; width: 100%; display: inline-block;">
                                            Complete Your Email Address Change
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
     * @param {ValidateNewEmailTemplateData} data The data to use with the template.
     * @returns {string} The text email.
     */
    static text(data) {
        return Template.text(`${data.user.username},

Someone requested to change the email address for their account at roncli.com to this email address.

* If you did not make this request, simply delete this email.
* If you wish to complete your email address change, please visit the link below to complete the change.

Complete Your Email Address Change: https://roncli.com/?go=emailValidate&u=${data.user.id}&a=${data.authorizationCode}`, {email: data.email, reason: data.reason});
    }
}

module.exports = ValidateNewEmailTemplate;
