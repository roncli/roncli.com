/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminModerationView = require("../../public/views/adminModeration"),
    Comment = require("../../src/models/comment"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           #   #             #                        #       #
//   # #       #                       #   #             #                        #
//  #   #   ## #  ## #    ##    # ##   ## ##   ###    ## #   ###   # ##    ###   ####    ##     ###   # ##
//  #   #  #  ##  # # #    #    ##  #  # # #  #   #  #  ##  #   #  ##  #      #   #       #    #   #  ##  #
//  #####  #   #  # # #    #    #   #  #   #  #   #  #   #  #####  #       ####   #       #    #   #  #   #
//  #   #  #  ##  # # #    #    #   #  #   #  #   #  #  ##  #      #      #   #   #  #    #    #   #  #   #
//  #   #   ## #  #   #   ###   #   #  #   #   ###    ## #   ###   #       ####    ##    ###    ###   #   #
/**
 * A class that represents the admin moderation page.
 */
class AdminModeration extends RouterBase {
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

        route.path = "/admin/moderation";

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

        const comments = await Comment.getUnmoderated();

        const data = {comments};

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Moderation - Admin - roncli.com",
                css: [],
                js: ["/js/adminModeration.js"],
                views: [
                    {
                        name: "AdminModerationView",
                        path: "/views/adminModeration.js"
                    }
                ],
                view: "AdminModerationView",
                jsClass: "AdminModeration",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Moderation - Admin - roncli.com</title>
                    <meta name="og:description" content="Moderate posts on roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Moderation Admin" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Moderate posts on roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Moderation Admin" />
                `,
                void 0,
                {js: ["/js/adminModeration.js"]},
                AdminModerationView.get(data),
                AdminModerationView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = AdminModeration;
