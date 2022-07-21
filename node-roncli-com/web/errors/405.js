/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    MethodNotAllowedView = require("../../public/views/405"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  #   #          #     #                 #  #   #          #       #     ##     ##                             #
//  #   #          #     #                 #  #   #          #      # #     #      #                             #
//  ## ##   ###   ####   # ##    ###    ## #  ##  #   ###   ####   #   #    #      #     ###   #   #   ###    ## #
//  # # #  #   #   #     ##  #  #   #  #  ##  # # #  #   #   #     #   #    #      #    #   #  #   #  #   #  #  ##
//  #   #  #####   #     #   #  #   #  #   #  #  ##  #   #   #     #####    #      #    #   #  # # #  #####  #   #
//  #   #  #       #  #  #   #  #   #  #  ##  #   #  #   #   #  #  #   #    #      #    #   #  # # #  #      #  ##
//  #   #   ###     ##   #   #   ###    ## #  #   #   ###     ##   #   #   ###    ###    ###    # #    ###    ## #
/**
 * A class that represents the 405 page.
 */
class MethodNotAllowed extends RouterBase {
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

        route.methodNotAllowed = true;

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
        const user = await User.getCurrent(req);

        if (req.headers["content-type"] === "application/json") {
            res.status(405).json({
                css: ["/css/error.css"],
                views: [
                    {
                        name: "MethodNotAllowedView",
                        path: "/views/405.js"
                    }
                ],
                view: "MethodNotAllowedView",
                comments: false,
                data: {message: "This method is not allowed."}
            });
        } else {
            res.status(405).send(await Common.page(
                "",
                void 0,
                {css: ["/css/error.css"]},
                MethodNotAllowedView.get(),
                MethodNotAllowedView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = MethodNotAllowed;
