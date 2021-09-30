/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user"),

    emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

//  ####                                               #    ####    ###
//  #   #                                             # #   #   #    #
//  #   #   ###    ###    ###   #   #   ###   # ##   #   #  #   #    #
//  ####   #   #  #   #  #   #  #   #  #   #  ##  #  #   #  ####     #
//  # #    #####  #      #   #   # #   #####  #      #####  #        #
//  #  #   #      #   #  #   #   # #   #      #      #   #  #        #
//  #   #   ###    ###    ###     #     ###   #      #   #  #       ###
/**
 * A class that handles calls to the recover API.
 */
class RecoverAPI extends RouterBase {
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

        route.path = "/api/recover";

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
            {
                const user = await User.getCurrent(req);

                if (user) {
                    res.status(406).json({error: "Not acceptable, you are already logged in."});
                    return;
                }
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const email = req.body.email;

            if (!email || email.length === 0) {
                res.status(422).json({error: "Unprocessable, you must enter your email address.", validation: {
                    "recover-email": "You must enter your email address."
                }});
                return;
            }

            if (email.length > 256) {
                res.status(422).json({error: "Unprocessable, your email address must be at most 256 characters.", validation: {
                    "recover-email": "Your email address must be at most 256 characters."
                }});
                return;
            }

            if (!emailRegex.test(email)) {
                res.status(422).json({error: "Unprocessable, you must enter a valid email address.", validation: {
                    "recover-email": "You must enter a valid email address."
                }});
                return;
            }

            const user = await User.getByEmail(email);

            if (!user) {
                res.status(422).json({error: "Unprocessable, could not find a user with this email address.", validation: {
                    "recover-email": "Could not find a user with this email address."
                }});
                return;
            }

            if (!user.validated) {
                await user.sendValidationEmail();
                res.status(403).json({error: "Forbidden, user is not yet validated."});
                return;
            }

            await user.sendChangePasswordEmail("a password recovery request was made for this email address");

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${RecoverAPI.route.path}.`, {err});
        }
    }
}

module.exports = RecoverAPI;
