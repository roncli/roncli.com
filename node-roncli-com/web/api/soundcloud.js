/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    Track = require("../../src/models/track");

//   ###                            #   ###    ##                      #    #    ####    ###
//  #   #                           #  #   #    #                      #   # #   #   #    #
//  #       ###   #   #  # ##    ## #  #        #     ###   #   #   ## #  #   #  #   #    #
//   ###   #   #  #   #  ##  #  #  ##  #        #    #   #  #   #  #  ##  #   #  ####     #
//      #  #   #  #   #  #   #  #   #  #        #    #   #  #   #  #   #  #####  #        #
//  #   #  #   #  #  ##  #   #  #  ##  #   #    #    #   #  #  ##  #  ##  #   #  #        #
//   ###    ###    ## #  #   #   ## #   ###    ###    ###    ## #   ## #  #   #  #       ###
/**
 * A class that handles calls to the SoundCloud API.
 */
class SoundCloudAPI extends RouterBase {
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

        route.path = "/api/soundcloud/:trackId";

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
            if (!req.params.trackId) {
                res.status(400).json({error: "Bad request, you must include a track ID."});
                return;
            }

            const track = await Track.getTrackById(req.params.trackId);

            if (!track) {
                res.status(404).json({error: "Not found, track does not exist."});
                return;
            }

            res.status(200).json(track);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${SoundCloudAPI.route.path}.`, {err});
        }
    }
}

module.exports = SoundCloudAPI;
