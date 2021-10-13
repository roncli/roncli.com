/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  #                                   #       #    ####    ###
//  #                                   #      # #   #   #    #
//  #       ###    ## #   ###   #   #  ####   #   #  #   #    #
//  #      #   #  #  #   #   #  #   #   #     #   #  ####     #
//  #      #   #   ##    #   #  #   #   #     #####  #        #
//  #      #   #  #      #   #  #  ##   #  #  #   #  #        #
//  #####   ###    ###    ###    ## #    ##   #   #  #       ###
//                #   #
//                 ###
/**
 * A class that handles calls to the logout API.
 */
class LogoutAPI extends RouterBase {
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

        route.path = "/api/logout";

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
                res.status(403).json({error: "Forbidden, you are not logged in."});
                return;
            }

            await User.logout(req, res);

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${LogoutAPI.route.path}.`, {err});
        }
    }
}

module.exports = LogoutAPI;
