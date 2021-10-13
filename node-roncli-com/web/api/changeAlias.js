/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//   ###   #                                    #     ##      #                    #    ####    ###
//  #   #  #                                   # #     #                          # #   #   #    #
//  #      # ##    ###   # ##    ## #   ###   #   #    #     ##     ###    ###   #   #  #   #    #
//  #      ##  #      #  ##  #  #  #   #   #  #   #    #      #        #  #      #   #  ####     #
//  #      #   #   ####  #   #   ##    #####  #####    #      #     ####   ###   #####  #        #
//  #   #  #   #  #   #  #   #  #      #      #   #    #      #    #   #      #  #   #  #        #
//   ###   #   #   ####  #   #   ###    ###   #   #   ###    ###    ####  ####   #   #  #       ###
//                              #   #
//                               ###
/**
 * A class that handles calls to the change alias API.
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

        route.path = "/api/change-alias";

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

            const alias = req.body.alias;

            if (!alias) {
                res.status(422).json({error: "Unprocessable, you must enter an alias.", validation: {
                    "changeAlias-alias": "You must enter an alias."
                }});
                return;
            }

            if (alias.length < 3) {
                res.status(422).json({error: "Unprocessable, your alias must be at least 3 characters.", validation: {
                    "changeAlias-alias": "Your alias must be at least 3 characters."
                }});
                return;
            }

            if (alias.length > 50) {
                res.status(422).json({error: "Unprocessable, your alias must be at most 50 characters.", validation: {
                    "changeAlias-alias": "Your alias must be at most 50 characters."
                }});
                return;
            }

            const data = await User.checkEmailOrUsernameExists(void 0, alias);

            if (data.usernameExists) {
                res.status(422).json({error: "Unprocessable, the username is already in use.", validation: {
                    "changeAlias-alias": "The alias is already in use."
                }});
                return;
            }

            await user.changeUsername(req, alias);

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${ChangeAliasAPI.route.path}.`, {err});
        }
    }
}

module.exports = ChangeAliasAPI;
