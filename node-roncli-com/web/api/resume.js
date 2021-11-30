/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    Resume = require("../../src/models/resume"),
    RouterBase = require("hot-router").RouterBase;


//  ####                                        #    ####    ###
//  #   #                                      # #   #   #    #
//  #   #   ###    ###   #   #  ## #    ###   #   #  #   #    #
//  ####   #   #  #      #   #  # # #  #   #  #   #  ####     #
//  # #    #####   ###   #   #  # # #  #####  #####  #        #
//  #  #   #          #  #  ##  # # #  #      #   #  #        #
//  #   #   ###   ####    ## #  #   #   ###   #   #  #       ###
/**
 * A class that handles calls to the résumé API.
 */
class ResumeAPI extends RouterBase {
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

        route.path = "/api/r(?:[eé]|%C3%A9)sum([eé]|%C3%A9)";

        return route;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        try {
            const resume = await Resume.get();

            res.status(200).json({resume: resume.resume});
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${ResumeAPI.route.path}.`, {err});
        }
    }
}

module.exports = ResumeAPI;
