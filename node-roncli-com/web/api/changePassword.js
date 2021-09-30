/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//   ###   #                                  ####                                                 #    #    ####    ###
//  #   #  #                                  #   #                                                #   # #   #   #    #
//  #      # ##    ###   # ##    ## #   ###   #   #   ###    ###    ###   #   #   ###   # ##    ## #  #   #  #   #    #
//  #      ##  #      #  ##  #  #  #   #   #  ####       #  #      #      #   #  #   #  ##  #  #  ##  #   #  ####     #
//  #      #   #   ####  #   #   ##    #####  #       ####   ###    ###   # # #  #   #  #      #   #  #####  #        #
//  #   #  #   #  #   #  #   #  #      #      #      #   #      #      #  # # #  #   #  #      #  ##  #   #  #        #
//   ###   #   #   ####  #   #   ###    ###   #       ####  ####   ####    # #    ###   #       ## #  #   #  #       ###
//                              #   #
//                               ###
/**
 * A class that handles calls to the change password API.
 */
class ChangePasswordAPI extends RouterBase {
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

        route.path = "/api/change-password";

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
            let user = await User.getCurrent(req),
                loggedIn = true;

            if (!user) {
                user = await User.get(req.session.allowPasswordChange);
                loggedIn = false;
            }

            if (!user) {
                res.status(401).json({error: "Unauthorized, user not found."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const {oldPassword, password, retypePassword, captcha} = req.body;

            if (loggedIn) {
                if (!oldPassword || oldPassword.length === 0) {
                    res.status(422).json({error: "Unprocessable, you must include your current password.", validation: {
                        "changePassword-current-password": "You must enter your current password."
                    }});
                    return;
                }

                if (oldPassword.length < 6) {
                    res.status(422).json({error: "Unprocessable, your current password must be at least 6 characters.", validation: {
                        "changePassword-current-password": "Your current password must be at least 6 characters."
                    }});
                    return;
                }

                if (oldPassword.length > 32) {
                    res.status(422).json({error: "Unprocessable, your current password must be at most 32 characters.", validation: {
                        "changePassword-current-password": "Your new current password must be at most 32 characters."
                    }});
                    return;
                }
            }

            if (!password || password.length === 0) {
                res.status(422).json({error: "Unprocessable, you must enter a password.", validation: {
                    "changePassword-new-password": "You must enter a new password.",
                    "change-password": "You must enter a new password."
                }});
                return;
            }

            if (password.length < 6) {
                res.status(422).json({error: "Unprocessable, your password must be at least 6 characters.", validation: {
                    "changePassword-new-password": "Your new password must be at least 6 characters.",
                    "change-password": "Your new password must be at least 6 characters."
                }});
                return;
            }

            if (password.length > 32) {
                res.status(422).json({error: "Unprocessable, your password must be at most 32 characters.", validation: {
                    "changePassword-new-password": "Your new password must be at most 32 characters.",
                    "change-password": "Your new password must be at most 32 characters."
                }});
                return;
            }

            if (retypePassword !== password) {
                res.status(422).json({error: "Unprocessable, your passwords must match.", validation: {
                    "changePassword-retype-password": "Your passwords must match.",
                    "change-retype-password": "Your passwords must match."
                }});
                return;
            }

            if (loggedIn) {
                if (!req.session.captcha || req.session.captcha.expires < new Date()) {
                    res.status(422).json({error: "Unprocessable, the validation characters have expired, please reload the page.", validation: {
                        "changePassword-captcha": "The validation characters have expired, please reload the page."
                    }});
                    return;
                }

                if (req.session.captcha.text !== captcha) {
                    res.status(422).json({error: "Unprocessable, the validation characters do not match.", validation: {
                        "changePassword-captcha": "The validation characters do not match."
                    }});
                    return;
                }

                const validateUser = User.getByLogin(user.email, oldPassword);

                if (!validateUser) {
                    res.status(422).json({error: "Unprocessable, the old password is not correct.", validation: {
                        "changePassword-current-password": "The password you entered in incorrect."
                    }});
                    return;
                }
            }

            await user.changePassword(password);

            await User.logout(req, res);

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${ChangePasswordAPI.route.path}.`, {err});
        }
    }
}

module.exports = ChangePasswordAPI;
