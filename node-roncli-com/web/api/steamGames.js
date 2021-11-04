/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    SteamGame = require("../../src/models/steamGame");

//   ###    #                           ###
//  #   #   #                          #   #
//  #      ####    ###    ###   ## #   #       ###   ## #    ###    ###
//   ###    #     #   #      #  # # #  #          #  # # #  #   #  #
//      #   #     #####   ####  # # #  #  ##   ####  # # #  #####   ###
//  #   #   #  #  #      #   #  # # #  #   #  #   #  # # #  #          #
//   ###     ##    ###    ####  #   #   ###    ####  #   #   ###   ####
/**
 * A class that handles calls to the Steam games API.
 */
class SteamGames extends RouterBase {
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

        route.path = "/api/steam-game";

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
            const page = +req.query.page;

            if (!isFinite(page) || page < 1 || page % 1 !== 0) {
                res.status(400).json({error: "Bad request, invalid page number."});
                return;
            }

            const count = await SteamGame.countGames();

            if (page > Math.ceil(count / SteamGame.pageSize)) {
                res.status(404).json({error: "Not found, page does not exist."});
                return;
            }

            const games = await SteamGame.getGames(page * SteamGame.pageSize - SteamGame.pageSize, SteamGame.pageSize);

            res.status(200).json(games);
            return;
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${SteamGames.route.path}.`, {err});
        }
    }
}

module.exports = SteamGames;
