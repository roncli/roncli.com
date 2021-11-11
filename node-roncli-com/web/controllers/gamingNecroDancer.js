/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    GamingNecroDancerView = require("../../public/views/gamingNecroDancer"),
    NecroDancer = require("../../src/models/necrodancer"),
    Page = require("../../src/models/page"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//   ###                   #                  #   #                              ####
//  #   #                                     #   #                               #  #
//  #       ###   ## #    ##    # ##    ## #  ##  #   ###    ###   # ##    ###    #  #   ###   # ##    ###    ###   # ##
//  #          #  # # #    #    ##  #  #  #   # # #  #   #  #   #  ##  #  #   #   #  #      #  ##  #  #   #  #   #  ##  #
//  #  ##   ####  # # #    #    #   #   ##    #  ##  #####  #      #      #   #   #  #   ####  #   #  #      #####  #
//  #   #  #   #  # # #    #    #   #  #      #   #  #      #   #  #      #   #   #  #  #   #  #   #  #   #  #      #
//   ###    ####  #   #   ###   #   #   ###   #   #   ###    ###   #       ###   ####    ####  #   #   ###    ###   #
//                                     #   #
//                                      ###
/**
 * A class that represents the NecroDancer page.
 */
class GamingNecroDancer extends RouterBase {
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

        route.path = "/gaming/necrodancer";

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
        const [user, page, necroDancer] = await Promise.all([
            User.getCurrent(req),
            (async () => {
                const result = await Page.getByPath(req.path);
                if (result) {
                    await result.loadMetadata();
                }

                return result;
            })(),
            NecroDancer.getRuns(0, -1)
        ]);

        const data = {
            page,
            necroDancer
        };

        const info = {
            page
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: [],
                js: [],
                views: [
                    {
                        name: "GamingNecroDancerView",
                        path: "/views/gamingNecroDancer.js"
                    }
                ],
                view: "GamingNecroDancerView",
                data,
                info
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {},
                GamingNecroDancerView.get(data),
                GamingNecroDancerView.getInfo(info),
                req,
                user
            ));
        }
    }
}

module.exports = GamingNecroDancer;
