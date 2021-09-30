/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const ChangeEmailView = require("../../public/views/changeEmail"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//   ###   #                                  #####                  #     ##
//  #   #  #                                  #                             #
//  #      # ##    ###   # ##    ## #   ###   #      ## #    ###    ##      #
//  #      ##  #      #  ##  #  #  #   #   #  ####   # # #      #    #      #
//  #      #   #   ####  #   #   ##    #####  #      # # #   ####    #      #
//  #   #  #   #  #   #  #   #  #      #      #      # # #  #   #    #      #
//   ###   #   #   ####  #   #   ###    ###   #####  #   #   ####   ###    ###
//                              #   #
//                               ###
/**
 * A class that represents the change email page.
 */
class ChangeEmail extends RouterBase {
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

        route.path = "/account/change-email";

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
        if (req.headers["content-type"] === "application/json") {
            res.status(415).json({error: "Unsupported Media Type"});
            return;
        }

        if (!req.session.allowEmailChange) {
            res.redirect(302, "/");
            return;
        }

        const user = await User.getCurrent(req);

        if (!user) {
            res.redirect(302, "/");
            return;
        }

        res.status(200).send(await Common.page(
            "",
            void 0,
            {js: ["/js/changeEmail.js"]},
            ChangeEmailView.get(),
            ChangeEmailView.getInfo(),
            req,
            user
        ));
    }
}

module.exports = ChangeEmail;
