/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminView = require("../../public/views/admin"),
    Comment = require("../../src/models/comment"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #
//   # #       #
//  #   #   ## #  ## #    ##    # ##
//  #   #  #  ##  # # #    #    ##  #
//  #####  #   #  # # #    #    #   #
//  #   #  #  ##  # # #    #    #   #
//  #   #   ## #  #   #   ###   #   #
/**
 * A class that represents the admin page.
 */
class Admin extends RouterBase {
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

        route.path = "/admin";

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

        const data = {
            commentsToModerate: (await Comment.getUnmoderated()).length,
            photosURL: process.env.PHOTOS_URL
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Admin - roncli.com",
                css: [],
                js: [],
                views: [
                    {
                        name: "AdminView",
                        path: "/views/admin.js"
                    }
                ],
                view: "AdminView",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Admin - roncli.com</title>
                    <meta name="og:description" content="Administration for roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Admin" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Administration for roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Admin" />
                `,
                void 0,
                {},
                AdminView.get(data),
                AdminView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = Admin;
