/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const ChangePasswordView = require("../../public/views/changePassword"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//   ###   #                                  ####                                                 #
//  #   #  #                                  #   #                                                #
//  #      # ##    ###   # ##    ## #   ###   #   #   ###    ###    ###   #   #   ###   # ##    ## #
//  #      ##  #      #  ##  #  #  #   #   #  ####       #  #      #      #   #  #   #  ##  #  #  ##
//  #      #   #   ####  #   #   ##    #####  #       ####   ###    ###   # # #  #   #  #      #   #
//  #   #  #   #  #   #  #   #  #      #      #      #   #      #      #  # # #  #   #  #      #  ##
//   ###   #   #   ####  #   #   ###    ###   #       ####  ####   ####    # #    ###   #       ## #
//                              #   #
//                               ###
/**
 * A class that represents the change password page.
 */
class ChangePassword extends RouterBase {
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

        route.path = "/account/change-password";

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

        if (!req.session.allowPasswordChange) {
            res.redirect(302, "/");
            return;
        }

        const user = await User.get(req.session.allowPasswordChange);

        if (!user) {
            res.redirect(302, "/");
            return;
        }

        res.status(200).send(await Common.page(
            /* html */`
                <title>Change Password - roncli.com</title>
                <meta name="og:description" content="Change the password address of your roncli.com account." />
                <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                <meta name="og:title" content="Change Password" />
                <meta name="og:type" content="website" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:description" content="Change the password address of your roncli.com account." />
                <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                <meta name="twitter:title" content="Change Password" />
            `,
            void 0,
            {js: ["/js/changePassword.js"]},
            ChangePasswordView.get(),
            ChangePasswordView.getInfo(),
            req,
            void 0
        ));
    }
}

module.exports = ChangePassword;
