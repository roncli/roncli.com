/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AdminPageView = require("../../public/views/adminPage"),
    Common = require("../includes/common"),
    Page = require("../../src/models/page"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####
//   # #       #                       #   #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ###
//  #   #  #  ##  # # #    #    ##  #  ####       #  #  #   #   #
//  #####  #   #  # # #    #    #   #  #       ####   ##    #####
//  #   #  #  ##  # # #    #    #   #  #      #   #  #      #
//  #   #   ## #  #   #   ###   #   #  #       ####   ###    ###
//                                                   #   #
//                                                    ###
/**
 * A class that represents the admin page... uh, page.
 */
class AdminPage extends RouterBase {
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

        route.path = "/admin/page:path((?:/*)?)$";

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

        const relativePath = (req.params.path || "").replace(/\/+$/, "");

        const page = await Page.getByPath(relativePath);

        await page.loadMetadata();

        const pages = await Page.getAllMetadata(),
            childPages = pages.filter((p) => p.parentPageId === page.id).sort((a, b) => a.order - b.order),
            otherPages = pages.filter((p) => p.parentPageId !== page.id && p.id !== page.id).sort((a, b) => a.title.localeCompare(b.title)),
            data = {
                page,
                childPages,
                otherPages
            };

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: [],
                js: ["/js/sortable/sortable.js", "/js/adminPage.js"],
                views: [
                    {
                        name: "AdminPageView",
                        path: "/views/adminPage.js"
                    }
                ],
                view: "AdminPageView",
                jsClass: "AdminPage",
                data,
                info: data
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                void 0,
                {js: ["/js/sortable/sortable.js", "/js/adminPage.js", "/views/adminPage.js"]},
                AdminPageView.get(data),
                AdminPageView.getInfo(data),
                req,
                user
            ));
        }
    }
}

module.exports = AdminPage;
