/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Comment = require("../../src/models/comment"),
    Common = require("../includes/common"),
    PageModel = require("../../src/models/page"),
    PageView = require("../../public/views/page"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  ####
//  #   #
//  #   #   ###    ## #   ###
//  ####       #  #  #   #   #
//  #       ####   ##    #####
//  #      #   #  #      #
//  #       ####   ###    ###
//                #   #
//                 ###
/**
 * A class that represents the page controller.
 */
class Page extends RouterBase {
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

        route.notFound = true;

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
        const user = await User.getCurrent(req),
            page = await PageModel.getByPath(req.path);

        if (!page) {
            await Common.notFound(req, res, user);
            return;
        }

        await page.loadMetadata();

        const data = {page},
            comments = await Comment.getByUrl(page.url, user);

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                css: [],
                js: [],
                views: [
                    {
                        name: "PageView",
                        path: "/views/page.js"
                    }
                ],
                view: "PageView",
                comments,
                data,
                info: data
            });
        } else {
            res.status(200).send(await Common.page(
                "",
                comments,
                {},
                PageView.get(data),
                PageView.getInfo(data),
                req,
                user
            ));
        }
    }
}

module.exports = Page;
