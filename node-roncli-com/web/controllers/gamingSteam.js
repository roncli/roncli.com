/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    GamingSteamView = require("../../public/views/gamingSteam"),
    RouterBase = require("hot-router").RouterBase,
    SteamGame = require("../../src/models/steamGame"),
    User = require("../../src/models/user");

//   ###                   #                   ###    #
//  #   #                                     #   #   #
//  #       ###   ## #    ##    # ##    ## #  #      ####    ###    ###   ## #
//  #          #  # # #    #    ##  #  #  #    ###    #     #   #      #  # # #
//  #  ##   ####  # # #    #    #   #   ##        #   #     #####   ####  # # #
//  #   #  #   #  # # #    #    #   #  #      #   #   #  #  #      #   #  # # #
//   ###    ####  #   #   ###   #   #   ###    ###     ##    ###    ####  #   #
//                                     #   #
//                                      ###
/**
 * A class that represents the Steam page.
 */
class GamingSteam extends RouterBase {
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

        route.path = "/gaming/steam";

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
     * @returns {Promise} A promise that resolves when the request has been processed.
     */
    static async get(req, res) {
        const [user, {steamGames, count}] = await Promise.all([
            User.getCurrent(req),
            (async () => {
                const games = await SteamGame.getGames(0, SteamGame.pageSize),
                    total = await SteamGame.countGames();

                return {steamGames: games, count: total};
            })()
        ]);

        const data = {
            steamGames,
            count,
            pageSize: SteamGame.pageSize
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: ["/css/gamingSteam.css"],
                js: ["/js/gamingSteam.js"],
                views: [
                    {
                        name: "GamingSteamGamesView",
                        path: "/views/gamingSteam/games.js"
                    },
                    {
                        name: "PaginationPageView",
                        path: "/views/pagination/page.js"
                    },
                    {
                        name: "GamingSteamView",
                        path: "/views/gamingSteam.js"
                    }
                ],
                view: "GamingSteamView",
                jsClass: "GamingSteam",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {
                    css: ["/css/gamingSteam.css"],
                    js: ["/views/pagination/page.js", "/views/gamingSteam/games.js", "/js/gamingSteam.js"]
                },
                GamingSteamView.get(data),
                GamingSteamView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = GamingSteam;
