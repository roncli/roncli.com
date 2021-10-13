/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminCacheView = require("../../public/views/adminCache"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #            ###                 #
//   # #       #                       #   #                #
//  #   #   ## #  ## #    ##    # ##   #       ###    ###   # ##    ###
//  #   #  #  ##  # # #    #    ##  #  #          #  #   #  ##  #  #   #
//  #####  #   #  # # #    #    #   #  #       ####  #      #   #  #####
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #   #  #   #  #
//  #   #   ## #  #   #   ###   #   #   ###    ####   ###   #   #   ###
/**
 * A class that represents the admin cache page.
 */
class AdminCache extends RouterBase {
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

        route.path = "/admin/cache";

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
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req);

        if (!user || !await user.is("SiteAdmin")) {
            await Common.notFound(req, res, user);
            return;
        }

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: [],
                js: ["/js/adminCache.js"],
                views: [
                    {
                        name: "AdminCacheView",
                        path: "/views/adminCache.js"
                    }
                ],
                view: "AdminCacheView",
                jsClass: "AdminCache"
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {js: ["/js/adminCache.js"]},
                AdminCacheView.get(),
                AdminCacheView.getInfo(),
                req,
                user
            ));
        }
    }

}

module.exports = AdminCache;
