/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    GamingView = require("../../public/views/gaming"),
    NecroDancer = require("../../src/models/necrodancer"),
    Page = require("../../src/models/page"),
    Profile = require("../../src/models/profile"),
    RouterBase = require("hot-router").RouterBase,
    Speedrun = require("../../src/models/speedrun"),
    SteamGame = require("../../src/models/steamGame"),
    User = require("../../src/models/user");

//   ###                   #
//  #   #
//  #       ###   ## #    ##    # ##    ## #
//  #          #  # # #    #    ##  #  #  #
//  #  ##   ####  # # #    #    #   #   ##
//  #   #  #   #  # # #    #    #   #  #
//   ###    ####  #   #   ###   #   #   ###
//                                     #   #
//                                      ###
/**
 * A class that represents the gaming page.
 */
class Gaming extends RouterBase {
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

        route.path = "/gaming";

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
        const [user, page, {recentSteamGames, steamGames}, speedruns, necrodancer, ff14, d3, wow] = await Promise.all([
            User.getCurrent(req),
            (async () => {
                const result = await Page.getByPath(req.path);
                if (result) {
                    await result.loadMetadata();
                }

                return result;
            })(),
            (async () => {
                const recentGames = await SteamGame.getRecentGames(0, 10),
                    games = await SteamGame.getGames(0, 10);

                return {recentSteamGames: recentGames, steamGames: games};
            })(),
            Speedrun.getSpeedruns(0, 10),
            NecroDancer.getRuns(0, 10),
            Profile.getFF14Profile(),
            Profile.getD3Profiles(),
            Profile.getWowProfile()
        ]);

        const data = {
            page,
            recentSteamGames,
            steamGames,
            speedruns,
            necrodancer,
            ff14,
            d3,
            wow
        };

        const info = {
            page
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Gaming - roncli.com",
                css: [],
                js: [],
                views: [
                    {
                        name: "GamingView",
                        path: "/views/gaming.js"
                    }
                ],
                view: "GamingView",
                data,
                info
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Gaming - roncli.com</title>
                    <meta name="og:description" content="All about roncli Gaming." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Gaming" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="All about roncli Gaming." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Gaming" />
                `,
                void 0,
                {},
                GamingView.get(data),
                GamingView.getInfo(info),
                req,
                user
            ));
        }
    }
}

module.exports = Gaming;
