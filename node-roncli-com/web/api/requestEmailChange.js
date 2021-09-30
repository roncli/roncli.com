/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");


//  ####                                       #     #####                  #     ##     ###   #
//  #   #                                      #     #                             #    #   #  #
//  #   #   ###    ## #  #   #   ###    ###   ####   #      ## #    ###    ##      #    #      # ##    ###   # ##    ## #   ###
//  ####   #   #  #  ##  #   #  #   #  #       #     ####   # # #      #    #      #    #      ##  #      #  ##  #  #  #   #   #
//  # #    #####  #  ##  #   #  #####   ###    #     #      # # #   ####    #      #    #      #   #   ####  #   #   ##    #####
//  #  #   #       ## #  #  ##  #          #   #  #  #      # # #  #   #    #      #    #   #  #   #  #   #  #   #  #      #
//  #   #   ###       #   ## #   ###   ####     ##   #####  #   #   ####   ###    ###    ###   #   #   ####  #   #   ###    ###
//                    #                                                                                             #   #
//                    #                                                                                              ###
/**
 * A class that handles calls to the request email change API.
 */
class ChangeAliasAPI extends RouterBase {
    //                    #
    //                    #
    // ###    ##   #  #  ###    ##
    // #  #  #  #  #  #   #    # ##
    // #     #  #  #  #   #    ##
    // #      ##    ###    ##   ##
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/api/request-email-change";

        return route;
    }

    //                     #
    //                     #
    // ###    ##    ###   ###
    // #  #  #  #  ##      #
    // #  #  #  #    ##    #
    // ###    ##   ###      ##
    // #
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async post(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, user not logged in."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const password = req.body.password,
                captcha = req.body.captcha;

            if (!password || password.length === 0) {
                res.status(422).json({error: "Unprocessable, you must enter a password.", validation: {
                    "changeEmail-password": "You must enter a new password."
                }});
                return;
            }

            if (password.length < 6) {
                res.status(422).json({error: "Unprocessable, your password must be at least 6 characters.", validation: {
                    "changeEmail-password": "Your new password must be at least 6 characters."
                }});
                return;
            }

            if (password.length > 32) {
                res.status(422).json({error: "Unprocessable, your password must be at most 32 characters.", validation: {
                    "changeEmail-password": "Your new password must be at most 32 characters."
                }});
                return;
            }

            if (!req.session.captcha || req.session.captcha.expires < new Date()) {
                res.status(422).json({error: "Unprocessable, the validation characters have expired, please reload the page.", validation: {
                    "changeEmail-captcha": "The validation characters have expired, please reload the page."
                }});
                return;
            }

            if (req.session.captcha.text !== captcha) {
                res.status(422).json({error: "Unprocessable, the validation characters do not match.", validation: {
                    "changeEmail-captcha": "The validation characters do not match."
                }});
                return;
            }

            const validateUser = User.getByLogin(user.email, password);

            if (!validateUser) {
                res.status(422).json({error: "Unprocessable, the old password is not correct.", validation: {
                    "changeEmail-password": "The password you entered in incorrect."
                }});
                return;
            }

            await user.sendChangeEmailRequest();

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${ChangeAliasAPI.route.path}.`, {err});
        }
    }
}

module.exports = ChangeAliasAPI;
