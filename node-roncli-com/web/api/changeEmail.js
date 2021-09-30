/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user"),

    emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

//   ###   #                                  #####                  #     ##      #    ####    ###
//  #   #  #                                  #                             #     # #   #   #    #
//  #      # ##    ###   # ##    ## #   ###   #      ## #    ###    ##      #    #   #  #   #    #
//  #      ##  #      #  ##  #  #  #   #   #  ####   # # #      #    #      #    #   #  ####     #
//  #      #   #   ####  #   #   ##    #####  #      # # #   ####    #      #    #####  #        #
//  #   #  #   #  #   #  #   #  #      #      #      # # #  #   #    #      #    #   #  #        #
//   ###   #   #   ####  #   #   ###    ###   #####  #   #   ####   ###    ###   #   #  #       ###
//                              #   #
//                               ###
/**
 * A class that handles calls to the change email API.
 */
class ChangeEmailAPI extends RouterBase {
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

        route.path = "/api/change-email";

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
                res.status(401).json({error: "Unauthorized, user not found."});
                return;
            }

            if (!req.session.allowEmailChange || req.session.allowEmailChange !== user.id) {
                res.status(403).json({error: "Forbidden, there is no email address change authorized for this user."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const {email} = req.body;

            // Validate email.
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

            await user.sendChangeEmailValidation(email);

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${ChangeEmailAPI.route.path}.`, {err});
        }
    }
}

module.exports = ChangeEmailAPI;
