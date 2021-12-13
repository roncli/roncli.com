/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    Encoding = require("../../public/js/common/encoding"),
    SpeedrunGameView = require("../../public/views/speedrunGame"),
    Page = require("../../src/models/page"),
    RouterBase = require("hot-router").RouterBase,
    Speedrun = require("../../src/models/speedrun"),
    User = require("../../src/models/user");

//   ###                            #                        ###
//  #   #                           #                       #   #
//  #      # ##    ###    ###    ## #  # ##   #   #  # ##   #       ###   ## #    ###
//   ###   ##  #  #   #  #   #  #  ##  ##  #  #   #  ##  #  #          #  # # #  #   #
//      #  ##  #  #####  #####  #   #  #      #   #  #   #  #  ##   ####  # # #  #####
//  #   #  # ##   #      #      #  ##  #      #  ##  #   #  #   #  #   #  # # #  #
//   ###   #       ###    ###    ## #  #       ## #  #   #   ###    ####  #   #   ###
//         #
//         #
/**
 * A class that represents the speedrun game page.
 */
class SpeedrunGame extends RouterBase {
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

        route.path = "/speedrun/:id/:name";

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
        const [user, speedruns] = await Promise.all([
            User.getCurrent(req),
            Speedrun.getGame(req.params.id)
        ]);

        if (!speedruns || !speedruns.runs || speedruns.runs.length === 0) {
            await Common.notFound(req, res, user);
            return;
        }

        const page = await Page.getByPath(req.path);
        if (page) {
            await page.loadMetadata();
        }

        const data = {
            page,
            speedruns
        };

        const info = {
            name: speedruns.name,
            page
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: `${speedruns.name} Speedruns - Gaming - roncli.com`,
                css: [],
                js: [],
                views: [
                    {
                        name: "SpeedrunGameView",
                        path: "/views/speedrunGame.js"
                    }
                ],
                view: "SpeedrunGameView",
                data,
                info
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>${Encoding.htmlEncode(speedruns.name)} Speedruns - Gaming - roncli.com</title>
                    <meta name="og:description" content="roncli's speedruns of the game &quot;${Encoding.attributeEncode(speedruns.name)}&quot;." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="${Encoding.attributeEncode(speedruns.name)} Speedruns - Gaming" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="roncli's speedruns of the game &quot;${Encoding.attributeEncode(speedruns.name)}&quot;." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="${Encoding.attributeEncode(speedruns.name)} Speedruns - Gaming" />
                `,
                void 0,
                {},
                SpeedrunGameView.get(data),
                SpeedrunGameView.getInfo(info),
                req,
                user
            ));
        }
    }

}

module.exports = SpeedrunGame;
