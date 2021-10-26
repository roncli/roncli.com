/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    Page = require("../../src/models/page"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####                          #    ####    ###
//   # #       #                       #   #                        # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  ####       #  #  #   #   #  #   #  ####     #
//  #####  #   #  # # #    #    #   #  #       ####   ##    #####  #####  #        #
//  #   #  #  ##  # # #    #    #   #  #      #   #  #      #      #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #       ####   ###    ###   #   #  #       ###
//                                                   #   #
//                                                    ###
/**
 * A class that handles calls to the admin page API.
 */
class AdminPageAPI extends RouterBase {
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

        route.path = "/api/admin/page";

        return route;
    }

    //    #        ##           #
    //    #         #           #
    //  ###   ##    #     ##   ###    ##
    // #  #  # ##   #    # ##   #    # ##
    // #  #  ##     #    ##     #    ##
    //  ###   ##   ###    ##     ##   ##
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async delete(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, user not logged in."});
                return;
            }

            if (!await user.is("SiteAdmin")) {
                res.status(403).json({error: "Forbidden."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const id = req.body.id;

            if (!id) {
                res.status(400).json({error: "Bad request, invalid ID."});
                return;
            }

            const page = await Page.getMetadataById(id);

            if (!page) {
                res.status(404).json({error: "Not found, page does not exist."});
                return;
            }

            if (await Page.hasChildren(id)) {
                res.status(409).json({error: "Conflict, this page has children."});
                return;
            }

            await Page.deleteByMetadata(page);

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminPageAPI.route.path}.`, {err});
        }
    }

    //                     #
    //                     #
    // ###    ##    ###   ###
    // #  #  #  #  ##      #
    // #  #  #  #    ##    #
    // ###    ##   ###      ##
    // #
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async post(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, user not logged in."});
                return;
            }

            if (!await user.is("SiteAdmin")) {
                res.status(403).json({error: "Forbidden."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const url = req.body.url;

            if (!url || url === "" || url === "/" || !url.startsWith("/")) {
                res.status(400).json({error: "Bad request, invalid URL."});
                return;
            }

            const page = await Page.getByPath(url);

            if (!page) {
                res.status(404).json({error: "Not found, page does not exist."});
                return;
            }

            if (req.body.page) {
                page.page = req.body.page;

                await page.savePage();

                res.sendStatus(204);
            } else if (req.body.title && req.body.shortTitle) {
                page.title = req.body.title;
                page.shortTitle = req.body.shortTitle;

                await page.saveTitle();

                res.sendStatus(204);
            } else {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminPageAPI.route.path}.`, {err});
        }
    }

    //              #
    //              #
    // ###   #  #  ###
    // #  #  #  #   #
    // #  #  #  #   #
    // ###    ###    ##
    // #
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async put(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, user not logged in."});
                return;
            }

            if (!await user.is("SiteAdmin")) {
                res.status(403).json({error: "Forbidden."});
                return;
            }

            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const url = req.body.url;

            if (!url || url === "" || url === "/" || !url.startsWith("/")) {
                res.status(400).json({error: "Bad request, invalid URL."});
                return;
            }

            const page = await Page.getByPath(url);

            if (!page) {
                res.status(404).json({error: "Not found, page does not exist."});
                return;
            }

            if (!req.body.order || req.body.order.length === 0) {
                res.status(400).json({error: "Bad request, you must include a page order."});
                return;
            }

            const promises = [];
            for (let index = 0; index < req.body.order.length; index++) {
                promises.push(Page.setOrder(req.body.order[index], index + 1));
            }

            await Promise.all(promises);

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminPageAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminPageAPI;
