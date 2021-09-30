/**
 * @typedef {import("../../../types/node/mailTypes").EmailData} MailTypes.EmailData
 */

const Encoding = require("../../../public/js/common/encoding");

//   ###              #                #####                        ##            #
//    #               #                  #                           #            #
//    #    # ##    ## #   ###   #   #    #     ###   ## #   # ##     #     ###   ####    ###
//    #    ##  #  #  ##  #   #   # #     #    #   #  # # #  ##  #    #        #   #     #   #
//    #    #   #  #   #  #####    #      #    #####  # # #  ##  #    #     ####   #     #####
//    #    #   #  #  ##  #       # #     #    #      # # #  # ##     #    #   #   #  #  #
//   ###   #   #   ## #   ###   #   #    #     ###   #   #  #       ###    ####    ##    ###
//                                                          #
//                                                          #
/**
 * A class that represents the master template.
 */
class IndexTemplate {
    // #      #          ##
    // #      #           #
    // ###   ###   # #    #
    // #  #   #    ####   #
    // #  #   #    #  #   #
    // #  #    ##  #  #  ###
    /**
     * Gets the rendered master template for HTML email.
     * @param {string} html The HTML to insert into the master template.
     * @param {MailTypes.EmailData} data The email data to use with the template.
     * @returns {string} The HTML email.
     */
    static html(html, data) {
        return /* html */`
            <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <title></title>
                    <style type="text/css">
                        @import url(https://fonts.googleapis.com/css?family=Archivo%20Narrow);

                        * {
                            font-family: "Archivo Narrow", Arial, sans-serif;
                        }

                        body,
                        #bodyTable {
                            height: 100% !important;
                            width: 100% !important;
                            margin: 0;
                            padding: 0;
                        }

                        body,
                        table,
                        td,
                        p,
                        a,
                        li,
                        blockquote {
                            text-size-adjust: 100%;
                            -ms-text-size-adjust: 100%;
                            -webkit-text-size-adjust: 100%;
                        }

                        .msg-body {
                            width: 100% !important;
                            display: block !important;
                        }

                        .ReadMsgBody
                        .ExternalClass {
                            width: 100%;
                            background-color: #eeeeee;
                        }

                        .ExternalClass,
                        .ExternalClass p,
                        .ExternalClass span,
                        .ExternalClass font,
                        .ExternalClass td,
                        .ExternalClass div {
                            line-height: 100%;
                        }

                        table {
                            border-spacing: 0;
                        }

                        table,
                        td {
                            border-collapse: collapse;
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                        }

                        img {
                            -ms-interpolation-mode: bicubic;
                        }

                        img,
                        a img {
                            border: 0;
                            outline: none;
                            text-decoration: none;
                        }

                        .yshortcuts a {
                            border-bottom: none !important;
                        }

                        a[href^=tel] {
                            color: #000000 !important;
                        }

                        @media only screen and (min-width: 601px) {
                            .email-container {
                                width: 600px !important;
                            }
                        }
                    </style>
                </head>
                <body bgcolor="#191935" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" style="margin: 0; padding: 0; text-size-adjust: none; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; background: #191935;">
                    <table cellpadding="0" cellspacing="0" border="0" height="100%" width="100%" bgcolor="#191935" style="background: #191935;" id="bodyTable">
                        <tr>
                            <td style="min-width: 20px;">&nbsp;</td>
                            <td>
                                <!--[if (gte mso 9)|(IE)]>
                                <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td>
                                <![endif]-->
                                <table border="0" width="100%" cellpadding="0" cellspacing="0" align="center" style="max-width: 600px; margin: auto;" class="email-container">
                                    <tr>
                                        <td height="40" style="font-size: 0; line-height: 0;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table border="0" width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 4px;">
                                                <tr>
                                                    <td height="40" style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td valign="middle" align="center" style="text-align: center; min-width: 240px; max-width: 240px;">
                                                        <a href="https://roncli.com"><img src="https://roncli.com/images/roncliLogo.png" alt="roncli.com" height="40" width="240" border="0" style="height: auto; max-height: 40px; width: 100%; max-width: 240px;"></a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 40px; font-size: 16px; color: #000000;">
                                                        ${html}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 40px 0; font-size: 12px; line-height: 18px; color: white;">
                                            This message was sent to <a href="mailto:${Encoding.attributeEncode(data.email)}" style="color: #5d9125;">${Encoding.htmlEncode(data.email)}</a> from <a href="https://roncli.com" style="color: #5d9125;">roncli.com</a> because ${data.reason}.<br />
                                            &copy;${new Date().getFullYear()} roncli Productions
                                        </td>
                                    </tr>
                                </table>
                                <!--[if (gte mso 9)|(IE)]>
                                        </td>
                                    </tr>
                                </table>
                                <![endif]-->
                            </td>
                            <td style="min-width: 20px;">&nbsp;</td>
                        </tr>
                    </table>
                </body>
            </html>
        `;
    }

    //  #                 #
    //  #                 #
    // ###    ##   #  #  ###
    //  #    # ##   ##    #
    //  #    ##     ##    #
    //   ##   ##   #  #    ##
    /**
     * Gets the rendered master template for text email.
     * @param {string} text The text to insert into the master template.
     * @param {MailTypes.EmailData} data The email data to use in the template.
     * @returns {string} The text email.
     */
    static text(text, data) {
        return `${text}

====================
This message was sent to ${data.email} from roncli.com because ${data.reason}.

©${new Date().getFullYear()} roncli Productions
https://roncli.com`;
    }
}

module.exports = IndexTemplate;
