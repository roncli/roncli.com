/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    Resume = require("../../src/models/resume"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####                                        #    ####    ###
//   # #       #                       #   #                                      # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ###   #   #  ## #    ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  ####   #   #  #      #   #  # # #  #   #  #   #  ####     #
//  #####  #   #  # # #    #    #   #  # #    #####   ###   #   #  # # #  #####  #####  #        #
//  #   #  #  ##  # # #    #    #   #  #  #   #          #  #  ##  # # #  #      #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #   #   ###   ####    ## #  #   #   ###   #   #  #       ###
/**
 * A class that handles calls to the admin résumé API.
 */
class AdminResumeAPI extends RouterBase {
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

        route.path = "/api/admin/r(?:[eé]|%C3%A9)sum([eé]|%C3%A9)";

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
     * @returns {Promise} A promise that resolves when the request is processed.
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

            if (!req.body.json) {
                res.status(400).json({error: "Bad request, you must include a JSON."});
                return;
            }

            try {
                JSON.parse(req.body.json);
            } catch (err) {
                res.status(400).json({error: "Bad request, the JSON is invalid."});
                return;
            }

            const resume = await Resume.get();

            resume.resume = req.body.json;

            resume.save();

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminResumeAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminResumeAPI;
