/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminPagesView = require("../../public/views/adminPages"),
    Common = require("../includes/common"),
    Page = require("../../src/models/page"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####
//   # #       #                       #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ###    ###
//  #   #  #  ##  # # #    #    ##  #  ####       #  #  #   #   #  #
//  #####  #   #  # # #    #    #   #  #       ####   ##    #####   ###
//  #   #  #  ##  # # #    #    #   #  #      #   #  #      #          #
//  #   #   ## #  #   #   ###   #   #  #       ####   ###    ###   ####
//                                                   #   #
//                                                    ###
/**
 * A class that represents the admin top level pages... uh, page.
 */
class AdminPages extends RouterBase {
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

        route.path = "/admin/pages";

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

        const pages = await Page.getAllMetadata(),
            topLevelPages = pages.filter((p) => !p.parentPageId).sort((a, b) => a.shortTitle.localeCompare(b.shortTitle)),
            otherPages = pages.filter((p) => p.parentPageId).sort((a, b) => a.title.localeCompare(b.title)),
            data = {
                topLevelPages,
                otherPages
            };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: "Pages - Admin - roncli.com",
                css: [],
                js: ["/js/adminPages.js"],
                views: [
                    {
                        name: "AdminPagesView",
                        path: "/views/adminPages.js"
                    }
                ],
                view: "AdminPagesView",
                jsClass: "AdminPages",
                data
            });
        } else {
            res.status(200).send(await Common.page(
                /* html */`
                    <title>Pages - Admin - roncli.com</title>
                    <meta name="og:description" content="Manage and edit pages on roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="Pages Admin" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Manage and edit pages on roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="Pages Admin" />
                `,
                void 0,
                {js: ["/js/adminPages.js"]},
                AdminPagesView.get(data),
                AdminPagesView.getInfo(),
                req,
                user
            ));
        }
    }
}

module.exports = AdminPages;
