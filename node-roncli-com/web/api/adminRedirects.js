/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    Redirect = require("../../src/models/redirect"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####              #    #                          #              #    ####    ###
//   # #       #                       #   #             #                               #             # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ##    # ##    ###    ###   ####    ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  ####   #   #  #  ##    #    ##  #  #   #  #   #   #     #      #   #  ####     #
//  #####  #   #  # # #    #    #   #  # #    #####  #   #    #    #      #####  #       #      ###   #####  #        #
//  #   #  #  ##  # # #    #    #   #  #  #   #      #  ##    #    #      #      #   #   #  #      #  #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #   #   ###    ## #   ###   #       ###    ###     ##   ####   #   #  #       ###
/**
 * A class that handles calls to the admin redirects API.
 */
class AdminRedirectsAPI extends RouterBase {
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

        route.path = "/api/admin/redirects";

        return route;
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async delete(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, user not logged in."});
                return;
            }

            if (!await user.is("SiteAdmin")) {
                res.status(403).json({error: "Forbidden."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            if (!req.body.id) {
                res.status(400).json({error: "Bad request, you must send the redirect ID to delete."});
                return;
            }

            const redirect = await Redirect.get(req.body.id);

            if (!redirect) {
                res.status(404).json({error: "Not found, the redirect doesn't exist."});
                return;
            }

            await redirect.delete();

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminRedirectsAPI.route.path}.`, {err});
        }
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

            if (!await user.is("SiteAdmin")) {
                res.status(403).json({error: "Forbidden."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            if (!req.body.fromPath) {
                res.status(400).json({error: "Bad request, you must send the path to redirect from."});
                return;
            }

            if (!req.body.toUrl) {
                res.status(400).json({error: "Bad request, you must send the URL to redirect to."});
                return;
            }

            const existing = await Redirect.getByPath(req.body.fromPath);

            if (existing) {
                res.status(409).json({error: "Conflict, path to redirect from already exists."});
                return;
            }

            const redirect = new Redirect({
                fromPath: req.body.fromPath,
                toUrl: req.body.toUrl,
                dateAdded: new Date()
            });

            await redirect.add();

            const redirects = await Redirect.getAll();

            res.status(200).json(redirects);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminRedirectsAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminRedirectsAPI;
