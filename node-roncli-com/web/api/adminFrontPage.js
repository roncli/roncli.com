/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Feature = require("../../src/models/feature"),
    Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           #####                        #     ####                          #    ####    ###
//   # #       #                       #                            #     #   #                        # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #      # ##    ###   # ##   ####   #   #   ###    ## #   ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #  ##  #   #     ####       #  #  #   #   #  #   #  ####     #
//  #####  #   #  # # #    #    #   #  #      #      #   #  #   #   #     #       ####   ##    #####  #####  #        #
//  #   #  #  ##  # # #    #    #   #  #      #      #   #  #   #   #  #  #      #   #  #      #      #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #   #    ##   #       ####   ###    ###   #   #  #       ###
//                                                                                      #   #
//                                                                                       ###
/**
 * A class that handles calls to the admin front page API.
 */
class AdminFrontPageAPI extends RouterBase {
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

        route.path = "/api/admin/front-page";

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

            if (!req.body.section) {
                res.status(400).json({error: "Bad request, you must include a section."});
                return;
            }

            if (!req.body.url) {
                res.status(400).json({error: "Bad request, you must include a URL."});
                return;
            }

            const feature = await Feature.getBySectionAndUrl(req.body.section, req.body.url);

            if (!feature) {
                res.status(404).json({error: "Not found, the feature doesn't exist in this section."});
                return;
            }

            await feature.delete();

            const features = await Feature.getAll();

            const data = {
                music: features.filter((f) => f.section === "music").sort((a, b) => a.order - b.order),
                coding: features.filter((f) => f.section === "coding").sort((a, b) => a.order - b.order),
                gaming: features.filter((f) => f.section === "gaming").sort((a, b) => a.order - b.order),
                life: features.filter((f) => f.section === "life").sort((a, b) => a.order - b.order)
            };

            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminFrontPageAPI.route.path}.`, {err});
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

            if (!req.body.section) {
                res.status(400).json({error: "Bad request, you must include a section."});
                return;
            }

            if (!req.body.url) {
                res.status(400).json({error: "Bad request, you must include a URL."});
                return;
            }

            if (!req.body.title) {
                res.status(400).json({error: "Bad request, you must include a title."});
                return;
            }

            const sectionFeatures = await Feature.getSection(req.body.section);

            if (sectionFeatures.find((f) => f.url === req.body.url)) {
                res.status(409).json({error: "Conflict, this page already exists as a feature in this section."});
                return;
            }

            const feature = new Feature({
                section: req.body.section,
                url: req.body.url,
                title: req.body.title,
                order: sectionFeatures.length,
                dateAdded: new Date()
            });

            await feature.add();

            const features = await Feature.getAll();

            const data = {
                music: features.filter((f) => f.section === "music").sort((a, b) => a.order - b.order),
                coding: features.filter((f) => f.section === "coding").sort((a, b) => a.order - b.order),
                gaming: features.filter((f) => f.section === "gaming").sort((a, b) => a.order - b.order),
                life: features.filter((f) => f.section === "life").sort((a, b) => a.order - b.order)
            };

            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminFrontPageAPI.route.path}.`, {err});
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

            if (!req.body.section) {
                res.status(400).json({error: "Bad request, you must include a section."});
                return;
            }

            if (!req.body.order || req.body.order.length === 0) {
                res.status(400).json({error: "Bad request, you must include a feature order."});
                return;
            }

            const promises = [];
            for (let index = 0; index < req.body.order.length; index++) {
                promises.push(Feature.setOrder(req.body.section, req.body.order[index], index));
            }

            await Promise.all(promises);

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminFrontPageAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminFrontPageAPI;
