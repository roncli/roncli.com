/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    ServerErrorView = require("../../public/views/500"),
    User = require("../../src/models/user");

//   ###                                      #####
//  #   #                                     #
//  #       ###   # ##   #   #   ###   # ##   #      # ##   # ##    ###   # ##
//   ###   #   #  ##  #  #   #  #   #  ##  #  ####   ##  #  ##  #  #   #  ##  #
//      #  #####  #       # #   #####  #      #      #      #      #   #  #
//  #   #  #      #       # #   #      #      #      #      #      #   #  #
//   ###    ###   #        #     ###   #      #####  #      #       ###   #
/**
 * A class that represents the 500 page.
 */
class ServerError extends RouterBase {
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

        route.serverError = true;

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
        let user;
        try {
            user = await User.getCurrent(req);
        } catch (err) {}

        if (req.headers["content-type"] === "application/json") {
            res.status(500).json({
                css: ["/css/error.css"],
                views: [
                    {
                        name: "ServerErrorView",
                        path: "/views/500.js"
                    }
                ],
                comments: false,
                view: "ServerErrorView"
            });
        } else {
            res.status(500).send(await Common.page(
                "",
                false,
                {css: ["/css/error.css"]},
                ServerErrorView.get(),
                ServerErrorView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = ServerError;
