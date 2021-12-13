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
                title: "Speedrunning Records - Gaming - roncli.com",
                css: [],
                js: [],
                views: [
                    {
                        name: "GamingSpeedrunsView",
                        path: "/views/gamingSpeedruns.js"
                    }
                ],
                view: "GamingSpeedrunsView",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Speedrunning Records - Gaming - roncli.com</title>
                    <meta name="og:description" content="A list of all of roncli's speedrunning records." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Speedrunning Records - Gaming" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="A list of all of roncli's speedrunning records." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Speedrunning Records - Gaming" />
                `,
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
