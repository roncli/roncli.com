/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AllowedPlaylist = require("../../src/models/allowedPlaylist"),
    Log = require("node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           #   #                #####         #               #    ####    ###
//   # #       #                       #   #                  #           #              # #   #   #    #
//  #   #   ## #  ## #    ##    # ##    # #    ###   #   #    #    #   #  # ##    ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #    #    #   #  #   #    #    #   #  ##  #  #   #  #   #  ####     #
//  #####  #   #  # # #    #    #   #    #    #   #  #   #    #    #   #  #   #  #####  #####  #        #
//  #   #  #  ##  # # #    #    #   #    #    #   #  #  ##    #    #  ##  ##  #  #      #   #  #        #
//  #   #   ## #  #   #   ###   #   #    #     ###    ## #    #     ## #  # ##    ###   #   #  #       ###
/**
 * A class that handles calls to the admin YouTube API.
 */
class AdminYouTubeAPI extends RouterBase {
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

        route.path = "/api/admin/youtube";

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
                res.status(400).json({error: "Bad request, you must send the playlist ID to delete."});
                return;
            }

            const playlist = await AllowedPlaylist.get(req.body.id);

            if (!playlist) {
                res.status(404).json({error: "Not found, the playlist is not currently allowed."});
                return;
            }

            await playlist.delete();

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminYouTubeAPI.route.path}.`, {err});
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

            if (!req.body.id) {
                res.status(400).json({error: "Bad request, you must send the playlist ID."});
                return;
            }

            const existing = await AllowedPlaylist.get(req.body.id);

            if (existing) {
                res.status(409).json({error: "Conflict, playlist is already allowed."});
                return;
            }

            const playlist = new AllowedPlaylist({
                playlistId: req.body.id
            });

            await playlist.add();

            const playlists = (await AllowedPlaylist.getAll()).sort((a, b) => a.id.localeCompare(b.id));

            res.status(200).json({playlists});
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminYouTubeAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminYouTubeAPI;
