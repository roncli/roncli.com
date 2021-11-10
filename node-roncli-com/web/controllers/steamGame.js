/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    Page = require("../../src/models/page"),
    RouterBase = require("hot-router").RouterBase,
    SteamGameModel = require("../../src/models/steamGame"),
    SteamGameView = require("../../public/views/steamGame"),
    User = require("../../src/models/user");

//   ###    #                           ###
//  #   #   #                          #   #
//  #      ####    ###    ###   ## #   #       ###   ## #    ###
//   ###    #     #   #      #  # # #  #          #  # # #  #   #
//      #   #     #####   ####  # # #  #  ##   ####  # # #  #####
//  #   #   #  #  #      #   #  # # #  #   #  #   #  # # #  #
//   ###     ##    ###    ####  #   #   ###    ####  #   #   ###
/**
 * A class that represents the Steam game controller.
 */
class SteamGame extends RouterBase {
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

        route.path = "/steam/:id/:name";

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
        const appId = +req.params.id,
            user = await User.getCurrent(req);

        if (!isFinite(appId) || appId % 1 !== 0) {
            await Common.notFound(req, res, user);
            return;
        }

        const game = await SteamGameModel.get(appId);

        if (!game) {
            await Common.notFound(req, res, user);
            return;
        }

        await game.loadAchievements();

        const page = await Page.getByPath(req.path);
        if (page) {
            await page.loadMetadata();
        }

        const data = {
            game,
            page
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: ["/css/steamGame.css"],
                js: [],
                views: [
                    {
                        name: "SteamGameView",
                        path: "/views/steamGame.js"
                    }
                ],
                view: "SteamGameView",
                data,
                info: data
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {css: ["/css/steamGame.css"]},
                SteamGameView.get(data),
                SteamGameView.getInfo(data),
                req,
                user
            ));
        }
    }
}

module.exports = SteamGame;
