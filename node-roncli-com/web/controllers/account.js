/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AccountView = require("../../public/views/account"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    UnauthorizedView = require("../../public/views/401"),
    User = require("../../src/models/user");


//    #                                        #
//   # #                                       #
//  #   #   ###    ###    ###   #   #  # ##   ####
//  #   #  #   #  #   #  #   #  #   #  ##  #   #
//  #####  #      #      #   #  #   #  #   #   #
//  #   #  #   #  #   #  #   #  #  ##  #   #   #  #
//  #   #   ###    ###    ###    ## #  #   #    ##
/**
 * A class that represents the account page.
 */
class Account extends RouterBase {
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

        route.path = "/account";

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

        if (!user) {
            if (req.headers["content-type"] === "application/json") {
                res.status(401).json({
                    css: ["/css/error.css"],
                    views: [
                        {
                            name: "NotFoundView",
                            path: "/views/404.js"
                        }
                    ],
                    view: "NotFoundView",
                    data: {message: "You are not authorized to view this page."}
                });
            } else {
                res.status(401).send(await Common.page(
                    "",
                    void 0,
                    {css: ["/css/error.css"]},
                    UnauthorizedView.get(),
                    UnauthorizedView.getInfo(),
                    req,
                    user
                ));
            }
            return;
        }

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: ["/css/account.css"],
                js: ["/js/account.js"],
                views: [
                    {
                        name: "AccountView",
                        path: "/views/account.js"
                    }
                ],
                view: "AccountView",
                jsClass: "Account",
                data: user
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {css: ["/css/account.css"], js: ["/js/account.js", "/views/account.js"]},
                AccountView.get(user),
                AccountView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = Account;
