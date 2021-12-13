/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminFrontPageView = require("../../public/views/adminFrontPage"),
    Common = require("../includes/common"),
    Feature = require("../../src/models/feature"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           #####                        #     ####
//   # #       #                       #                            #     #   #
//  #   #   ## #  ## #    ##    # ##   #      # ##    ###   # ##   ####   #   #   ###    ## #   ###
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #  ##  #   #     ####       #  #  #   #   #
//  #####  #   #  # # #    #    #   #  #      #      #   #  #   #   #     #       ####   ##    #####
//  #   #  #  ##  # # #    #    #   #  #      #      #   #  #   #   #  #  #      #   #  #      #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #   #    ##   #       ####   ###    ###
//                                                                                      #   #
//                                                                                       ###
/**
 * A class that represents the admin front page... uh... page.
 */
class AdminFrontPage extends RouterBase {
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

        route.path = "/admin/front-page";

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

        const features = await Feature.getAll();

        const data = {
            music: features.filter((f) => f.section === "music").sort((a, b) => a.order - b.order),
            coding: features.filter((f) => f.section === "coding").sort((a, b) => a.order - b.order),
            gaming: features.filter((f) => f.section === "gaming").sort((a, b) => a.order - b.order),
            life: features.filter((f) => f.section === "life").sort((a, b) => a.order - b.order)
        };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Front Page - Admin - roncli.com",
                css: [],
                js: ["/js/sortable/sortable.js", "/js/adminFrontPage.js"],
                views: [
                    {
                        name: "AdminFrontPageView",
                        path: "/views/adminFrontPage.js"
                    }
                ],
                view: "AdminFrontPageView",
                jsClass: "AdminFrontPage",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Front Page - Admin - roncli.com</title>
                    <meta name="og:description" content="Manage the front page for roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Front Page Admin" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Manage the front page for roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Front Page Admin" />
                `,
                void 0,
                {js: ["/js/sortable/sortable.js", "/js/adminFrontPage.js"]},
                AdminFrontPageView.get(data),
                AdminFrontPageView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = AdminFrontPage;
