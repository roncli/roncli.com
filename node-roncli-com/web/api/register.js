/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user"),

    emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

//  ####                   #            #                     #    ####    ###
//  #   #                               #                    # #   #   #    #
//  #   #   ###    ## #   ##     ###   ####    ###   # ##   #   #  #   #    #
//  ####   #   #  #  #     #    #       #     #   #  ##  #  #   #  ####     #
//  # #    #####   ##      #     ###    #     #####  #      #####  #        #
//  #  #   #      #        #        #   #  #  #      #      #   #  #        #
//  #   #   ###    ###    ###   ####     ##    ###   #      #   #  #       ###
//                #   #
//                 ###
/**
 * A class that handles calls to the register API.
 */
class RegisterAPI extends RouterBase {
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

        route.path = "/api/register";

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

            if (user) {
                res.status(406).json({error: "Not acceptable, you are already logged in."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const {email, password, retypePassword, alias, dob, captcha} = req.body;

            if (!email || email.length === 0) {
                res.status(422).json({error: "Unprocessable, you must enter your email address.", validation: {
                    "register-email": "You must enter your email address."
                }});
                return;
            }

            if (email.length > 256) {
                res.status(422).json({error: "Unprocessable, your email address must be at most 256 characters.", validation: {
                    "register-email": "Your email address must be at most 256 characters."
                }});
                return;
            }

            if (!emailRegex.test(email)) {
                res.status(422).json({error: "Unprocessable, you must enter a valid email address.", validation: {
                    "register-email": "You must enter a valid email address."
                }});
                return;
            }

            if (!password || password.length === 0) {
                res.status(422).json({error: "Unprocessable, you must enter a password.", validation: {
                    "register-password": "You must enter a password."
                }});
                return;
            }

            if (password.length < 6) {
                res.status(422).json({error: "Unprocessable, your password must be at least 6 characters.", validation: {
                    "register-password": "Your password must be at least 6 characters."
                }});
                return;
            }

            if (password.length > 32) {
                res.status(422).json({error: "Unprocessable, your password must be at most 32 characters.", validation: {
                    "register-password": "Your password must be at most 32 characters."
                }});
                return;
            }

            if (retypePassword !== password) {
                res.status(422).json({error: "Unprocessable, your passwords must match.", validation: {
                    "register-retype-password": "Your passwords must match."
                }});
                return;
            }

            if (!alias) {
                res.status(422).json({error: "Unprocessable, you must enter an alias.", validation: {
                    "register-alias": "You must enter an alias."
                }});
                return;
            }

            if (alias.length < 3) {
                res.status(422).json({error: "Unprocessable, your alias must be at least 3 characters.", validation: {
                    "register-alias": "Your alias must be at least 3 characters."
                }});
                return;
            }

            if (alias.length > 50) {
                res.status(422).json({error: "Unprocessable, your alias must be at most 50 characters.", validation: {
                    "register-alias": "Your alias must be at most 50 characters."
                }});
                return;
            }

            const dobDate = new Date(dob);

            if (!dob || isNaN(dobDate.getTime())) {
                res.status(422).json({error: "Unprocessable, you must be at least 13 years old to register.", validation: {
                    "register-dob": "You must be at least 13 years old to register."
                }});
                return;
            }

            const now = new Date();

            if (now.getFullYear() - dobDate.getFullYear() < 13 || now.getFullYear() - dobDate.getFullYear() === 13 && now.getMonth() < dobDate.getMonth() || now.getFullYear() - dobDate.getFullYear() === 13 && now.getMonth() === dobDate.getMonth() && now.getDate() < dobDate.getDate()) {
                res.status(422).json({error: "Unprocessable, you must enter your date of birth.", validation: {
                    "register-dob": "You must enter your date of birth."
                }});
                return;
            }

            if (dobDate.getFullYear() < 1900) {
                res.status(422).json({error: "Unprocessable, you must enter a valid date of birth.", validation: {
                    "register-dob": "You must enter a valid date of birth."
                }});
                return;
            }

            if (!captcha) {
                res.status(422).json({error: "Unprocessable, you must enter the characters shown below the form.", validation: {
                    "register-captcha": "You must enter the characters shown below the form."
                }});
                return;
            }

            if (!req.session.captcha || req.session.captcha.expires < now) {
                res.status(422).json({error: "Unprocessable, the validation characters have expired, please reload the page.", validation: {
                    "register-captcha": "The validation characters have expired, please reload the page."
                }});
                return;
            }

            if (req.session.captcha.text !== captcha) {
                res.status(422).json({error: "Unprocessable, the validation characters do not match.", validation: {
                    "register-captcha": "The validation characters do not match."
                }});
                return;
            }

            const data = await User.checkEmailOrUsernameExists(email, alias);

            if (data.emailExists && data.usernameExists) {
                res.status(422).json({error: "Unprocessable, the email address and username are already in use.", validation: {
                    "register-email": "The email address is already in use.",
                    "register-alias": "The alias is already in use."
                }});
                return;
            } else if (data.emailExists) {
                res.status(422).json({error: "Unprocessable, the email address is already in use.", validation: {
                    "register-email": "The email address is already in use."
                }});
                return;
            } else if (data.usernameExists) {
                res.status(422).json({error: "Unprocessable, the username is already in use.", validation: {
                    "register-alias": "The alias is already in use."
                }});
                return;
            }

            const newUser = await User.register(email, password, alias, dobDate);

            if (!newUser) {
                res.status(500).json({error: "Server error, registration failed."});
                return;
            }

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${RegisterAPI.route.path}.`, {err});
        }
    }
}

module.exports = RegisterAPI;
