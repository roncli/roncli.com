/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Album = require("../../src/models/album"),
    Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase;

//    #     ##    #                      #    ####    ###
//   # #     #    #                     # #   #   #    #
//  #   #    #    # ##   #   #  ## #   #   #  #   #    #
//  #   #    #    ##  #  #   #  # # #  #   #  ####     #
//  #####    #    #   #  #   #  # # #  #####  #        #
//  #   #    #    ##  #  #  ##  # # #  #   #  #        #
//  #   #   ###   # ##    ## #  #   #  #   #  #       ###
/**
 * A class that handles calls to the album API.
 */
class AlbumAPI extends RouterBase {
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

        route.path = "/api/album";

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
            if (!req.query && !req.query.id) {
                res.status(400).json({error: "Bad request, you must send an album ID."});
                return;
            }

            const album = await Album.getAlbum(`${req.query.id}`);

            if (!album) {
                res.status(404).json({error: "Not found, the album ID does not exist."});
                return;
            }

            await album.loadPhotos();

            if (album.photos.length === 0) {
                res.status(404).json({error: "Not found, there are no photos in this album."});
                return;
            }

            res.status(200).send(album);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AlbumAPI.route.path}.`, {err});
        }
    }
}

module.exports = AlbumAPI;
