/**
 * @typedef {{subject: string, from: string}} SMTPSettings
 */

const Nodemailer = require("nodemailer"),

    transport = Nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: +process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === "465",
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD
        }
    });

//  #   #           #     ##
//  #   #                  #
//  ## ##   ###    ##      #
//  # # #      #    #      #
//  #   #   ####    #      #
//  #   #  #   #    #      #
//  #   #   ####   ###    ###
/**
 * A class that handles mail functions.
 */
class Mail {
    //                       #
    //                       #
    //  ###    ##   ###    ###
    // ##     # ##  #  #  #  #
    //   ##   ##    #  #  #  #
    // ###     ##   #  #   ###
    /**
     * Sends mail through the SMTP server.
     * @param {Nodemailer.SendMailOptions} options The options for the SMTP server.
     * @returns {Promise} A promise that resolves when the mail has been sent.
     */
    static async send(options) {
        if (options.subject) {
            options.subject = `[roncli.com] ${options.subject}`;
        } else {
            options.subject = "[roncli.com]";
        }

        if (!options.from) {
            options.from = {address: "roncli@roncli.com", name: "Ronald M. Clifford"};
        }

        await transport.sendMail(options);
    }
}

module.exports = Mail;
