/**
 * @typedef {import("../../../types/node/mailTypes").EmailData} MailTypes.EmailData
 * @typedef {{user: User, code: string} & MailTypes.EmailData} ValidationTemplateData
 * @typedef {import("../../models/user")} User}
 */

const Encoding = require("../../../public/js/common/encoding"),
    Template = require(".");

//  #   #          ##      #        #          #       #                  #####                        ##            #
//  #   #           #               #          #                            #                           #            #
//  #   #   ###     #     ##     ## #   ###   ####    ##     ###   # ##     #     ###   ## #   # ##     #     ###   ####    ###
//   # #       #    #      #    #  ##      #   #       #    #   #  ##  #    #    #   #  # # #  ##  #    #        #   #     #   #
//   # #    ####    #      #    #   #   ####   #       #    #   #  #   #    #    #####  # # #  ##  #    #     ####   #     #####
//   # #   #   #    #      #    #  ##  #   #   #  #    #    #   #  #   #    #    #      # # #  # ##     #    #   #   #  #  #
//    #     ####   ###    ###    ## #   ####    ##    ###    ###   #   #    #     ###   #   #  #       ###    ####    ##    ###
//                                                                                             #
//                                                                                             #
/**
 * A class that represents the validation template.
 */
class ValidationTemplate {
    // #      #          ##
    // #      #           #
    // ###   ###   # #    #
    // #  #   #    ####   #
    // #  #   #    #  #   #
    // #  #    ##  #  #  ###
    /**
     * Gets the rendered template for HTML email.
     * @param {ValidationTemplateData} data The data to use with the template.
     * @returns {string} The HTML email.
     */
    static html(data) {
        return Template.html(/* html */`
            <table border="0" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        ${Encoding.htmlEncode(data.user.username)},<br/><br/>
                        Thank you for successfully registering with <a href="https://roncli.com" style="color: #5d9125;">roncli.com</a>! Please click the link below to validate your account to begin using it.
                    </td>
                </tr>
                <tr>
                    <td height="40">&nbsp;</td>
                </tr>
                <tr>
                    <td valign="middle" align="center" style="text-align: center;">
                        <div>
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://roncli.com/?go=validation&u=${data.user.id}&v=${data.code}" style="height: 40px; v-text-anchor: middle; width: 300px;" arcsize="10%" stroke="f" fillcolor="#22225a">
                                <w:anchorlock />
                                <center style="color:#ffffff; font-size: 20px; font-weight: bold;">Validate Your Email</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!---->
                            <table cellspacing="0" cellpadding="0" align="center">
                                <tr>
                                    <td align="center" width="300" height="40" bgcolor="#22225a" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;">
                                        <a href="https://roncli.com/?go=validation&u=${data.user.id}&v=${data.code}" style="color: #ffffff; font-size: 20px; font-weight: bold; text-decoration: none; line-height: 40px; width: 100%; display: inline-block;">
                                            Validate Your Email
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
     * @param {ValidationTemplateData} data The data to use with the template.
     * @returns {string} The text email.
     */
    static text(data) {
        return Template.text(`${data.user.username},

Thank you for successfully registering with roncli.com! Please visit the link below to validate your account to begin using it.

Validate Your Email: https://roncli.com/?go=validation&u=${data.user.id}&v=${data.code}`, {email: data.email, reason: data.reason});
    }
}

module.exports = ValidationTemplate;
