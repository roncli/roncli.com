/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    GamingSpeedrunsView = require("../../public/views/gamingSpeedruns"),
    RouterBase = require("hot-router").RouterBase,
    Speedrun = require("../../src/models/speedrun"),
    User = require("../../src/models/user");

//   ###                   #                   ###                            #
//  #   #                                     #   #                           #
//  #       ###   ## #    ##    # ##    ## #  #      # ##    ###    ###    ## #  # ##   #   #  # ##    ###
//  #          #  # # #    #    ##  #  #  #    ###   ##  #  #   #  #   #  #  ##  ##  #  #   #  ##  #  #
//  #  ##   ####  # # #    #    #   #   ##        #  ##  #  #####  #####  #   #  #      #   #  #   #   ###
//  #   #  #   #  # # #    #    #   #  #      #   #  # ##   #      #      #  ##  #      #  ##  #   #      #
//   ###    ####  #   #   ###   #   #   ###    ###   #       ###    ###    ## #  #       ## #  #   #  ####
//                                     #   #         #
//                                      ###          #
/**
 * A class that represents the speedruns page.
 */
class GamingSpeedruns extends RouterBase {
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

        route.path = "/gaming/speedruns";

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
        const [user, speedrunsByGame] = await Promise.all([
            User.getCurrent(req),
            Speedrun.getSpeedrunsByGame()
        ]);

        const data = {
            speedrunsByGame
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: [],
                js: [],
                views: [
                    {
                        name: "GamingSpeedrunsView",
                        path: "/views/gamingSpeedruns.js"
                    }
                ],
                view: "GamingSpeedrunsView",
                data,
                info: data
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {},
                GamingSpeedrunsView.get(data),
                GamingSpeedrunsView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = GamingSpeedruns;
