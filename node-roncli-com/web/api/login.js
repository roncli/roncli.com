/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  #                      #             #    ####    ###
//  #                                   # #   #   #    #
//  #       ###    ## #   ##    # ##   #   #  #   #    #
//  #      #   #  #  #     #    ##  #  #   #  ####     #
//  #      #   #   ##      #    #   #  #####  #        #
//  #      #   #  #        #    #   #  #   #  #        #
//  #####   ###    ###    ###   #   #  #   #  #       ###
//                #   #
//                 ###
/**
 * A class that handles calls to the login API.
 */
class LoginAPI extends RouterBase {
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

        route.path = "/api/login";

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

            const {email, password, saveLogin} = req.body;

            if (!email) {
                res.status(422).json({error: "Unprocessable, you must include an email address."});
                return;
            }

            if (!password) {
                res.status(422).json({error: "Unprocessable, you must include a password."});
                return;
            }

            if (saveLogin === void 0) {
                res.status(422).json({error: "Unprocessable, you must include whether to save the login."});
                return;
            }

            const loginData = await User.login(req, email, password, saveLogin);

            if (!loginData) {
                res.status(401).json({error: "Unauthorized, invalid email or password."});
                return;
            }

            if (!loginData.user.validated) {
                await loginData.user.sendValidationEmail();
                res.status(403).json({error: "Forbidden, user is not yet validated."});
                return;
            }

            const expire = new Date();
            expire.setDate(expire.getDate() + 30);

            const data = {
                user: loginData.user,
                userLinks: []
            };

            if (data.user) {
                if (await data.user.is("SiteAdmin")) {
                    data.userLinks.push({
                        title: "Admin",
                        href: "/admin"
                    });
                }
            }

            if (saveLogin) {
                res.cookie("roncli", {
                    email,
                    token: loginData.token
                }, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict"
                });
            }

            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${LoginAPI.route.path}.`, {err});
        }
    }
}

module.exports = LoginAPI;
