/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    Page = require("../../src/models/page"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####                                 #    ####    ###
//   # #       #                       #   #                               # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #   #   ###    ## #   ###    ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  ####       #  #  #   #   #  #      #   #  ####     #
//  #####  #   #  # # #    #    #   #  #       ####   ##    #####   ###   #####  #        #
//  #   #  #  ##  # # #    #    #   #  #      #   #  #      #          #  #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #       ####   ###    ###   ####   #   #  #       ###
//                                                   #   #
//                                                    ###
/**
 * A class that handles calls to the admin pages API.
 */
class AdminPagesAPI extends RouterBase {
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

        route.path = "/api/admin/pages";

        return route;
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

            const create = !!req.body.create;

            /** @type {string} */
            const url = req.body.url;

            if (!url || url === "" || url === "/" || !url.startsWith("/")) {
                res.status(400).json({error: "Bad request, invalid URL."});
                return;
            }

            const page = await Page.getByPath(url);

            /** @type {string} */
            const parentPageId = req.body.parentPageId;

            if (create) {
                if (page) {
                    res.status(409).json({error: "Conflict, page already exists.", message: `This page URL already exists.  If you would like this to be a top level page, move the page "${page.title}" to the top level.`});
                    return;
                }

                /** @type {string} */
                const title = req.body.title;

                if (!title || title === "") {
                    res.status(400).json({error: "Bad request, invalid title."});
                    return;
                }

                const titlePage = await Page.getMetadataByTitle(title);

                if (titlePage) {
                    res.status(409).json({error: "Conflict, title already exists.", message: "A page with this title already exists."});
                    return;
                }

                const pages = await Page.getAllMetadata(),
                    newPage = new Page({
                        url,
                        parentPageId,
                        order: pages.filter((p) => p.parentPageId === parentPageId).length + 1,
                        title,
                        shortTitle: title,
                        page: "",
                        dateAdded: new Date(),
                        dateUpdated: new Date()
                    });

                await newPage.add();

                await newPage.loadMetadata();

                res.status(200).json({path: newPage.url});
            } else {
                if (!page) {
                    res.status(404).json({error: "Not found, page does not exist."});
                    return;
                }

                if (parentPageId) {
                    const parentPage = await Page.getMetadataById(parentPageId);

                    if (!parentPage) {
                        res.status(409).json({error: "Conflict, parent page does not exist.", message: "The parent page you are trying to move this page to does not exist."});
                        return;
                    }
                }

                await Page.changeParent(url, parentPageId);

                if (parentPageId) {
                    const parentPage = await Page.get(parentPageId);

                    const pages = await Page.getAllMetadata(),
                        childPages = pages.filter((p) => p.parentPageId === parentPage.id).sort((a, b) => a.order - b.order),
                        otherPages = pages.filter((p) => p.parentPageId !== parentPage.id && p.id !== parentPage.id).sort((a, b) => a.title.localeCompare(b.title)),
                        data = {
                            page: parentPage,
                            childPages,
                            otherPages
                        };

                    res.status(200).json(data);
                } else {
                    const pages = await Page.getAllMetadata(),
                        topLevelPages = pages.filter((p) => !p.parentPageId).sort((a, b) => a.shortTitle.localeCompare(b.shortTitle)),
                        otherPages = pages.filter((p) => p.parentPageId).sort((a, b) => a.title.localeCompare(b.title)),
                        data = {
                            topLevelPages,
                            otherPages
                        };

                    res.status(200).json(data);
                }
            }
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminPagesAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminPagesAPI;
