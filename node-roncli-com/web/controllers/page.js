/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Comment = require("../../src/models/comment"),
    Common = require("../includes/common"),
    Encoding = require("../../public/js/common/encoding"),
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
        const [user, page] = await Promise.all([User.getCurrent(req), PageModel.getByPath(req.path)]);

        if (!page) {
            await Common.notFound(req, res, user);
            return;
        }

        const [comments] = await Promise.all([Comment.getByUrl(page.url, user), page.loadMetadata()]);

        const data = {page};

        if (req.headers["content-type"] === "application/json") {
            res.status(200).json({
                title: `${page.shortTitle} - roncli.com`,
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
                /* html */`
                    <title>${Encoding.htmlEncode(page.shortTitle)} - roncli.com</title>
                    <meta name="og:description" content="Welcome to roncli.com." />
                    <meta name="og:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="og:title" content="${Encoding.attributeEncode(page.title)}" />
                    <meta name="og:type" content="website" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:description" content="Welcome to roncli.com." />
                    <meta name="twitter:image" content="https://roncli.com/images/roncliLogo.png" />
                    <meta name="twitter:title" content="${Encoding.attributeEncode(page.title)}" />
                `,
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
