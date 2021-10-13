/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    Video = require("../../src/models/video");

//  #   #                #####         #               #    ####    ###
//  #   #                  #           #              # #   #   #    #
//   # #    ###   #   #    #    #   #  # ##    ###   #   #  #   #    #
//    #    #   #  #   #    #    #   #  ##  #  #   #  #   #  ####     #
//    #    #   #  #   #    #    #   #  #   #  #####  #####  #        #
//    #    #   #  #  ##    #    #  ##  ##  #  #      #   #  #        #
//    #     ###    ## #    #     ## #  # ##    ###   #   #  #       ###
/**
 * A class that handles calls to the YouTube API.
 */
class YouTubeAPI extends RouterBase {
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

        route.path = "/api/youtube/:videoId";

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
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async get(req, res) {
        try {
            if (!req.params.videoId) {
                res.status(400).json({error: "Bad request, you must include a video ID."});
                return;
            }

            const video = await Video.get(req.params.videoId);

            if (!video) {
                res.status(404).json({error: "Not found, video does not exist."});
                return;
            }

            res.status(200).json(video);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${YouTubeAPI.route.path}.`, {err});
        }
    }
}

module.exports = YouTubeAPI;
