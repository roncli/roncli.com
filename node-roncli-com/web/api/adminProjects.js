/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    Project = require("../../src/models/project"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####                    #                  #              #    ####    ###
//   # #       #                       #   #                                      #             # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #   #  # ##    ###     ##    ###    ###   ####    ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #     #   #   #  #   #   #     #      #   #  ####     #
//  #####  #   #  # # #    #    #   #  #      #      #   #     #   #####  #       #      ###   #####  #        #
//  #   #  #  ##  # # #    #    #   #  #      #      #   #     #   #      #   #   #  #      #  #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #  #    ###    ###     ##   ####   #   #  #       ###
//                                                          #  #
//                                                           ##
/**
 * A class that handles calls to the admin projects API.
 */
class AdminProjectsAPI extends RouterBase {
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

        route.path = "/api/admin/projects";

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

            const project = await Project.get(id);

            if (!project) {
                res.status(404).json({error: "Not found, project does not exist."});
                return;
            }

            await project.delete();

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminProjectsAPI.route.path}.`, {err});
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

            if (!req.body.order || req.body.order.length === 0) {
                res.status(400).json({error: "Bad request, you must include a page order."});
                return;
            }

            const promises = [];
            for (let index = 0; index < req.body.order.length; index++) {
                promises.push(Project.setOrder(req.body.order[index], index + 1));
            }

            await Promise.all(promises);

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminProjectsAPI.route.path}.`, {err});
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

            if (!req.body.url) {
                res.status(400).json({error: "Bad request, you must include a URL."});
                return;
            }

            if (!req.body.title) {
                res.status(400).json({error: "Bad request, you must include a title."});
                return;
            }

            if (!req.body.user) {
                res.status(400).json({error: "Bad request, you must include a GitHub user."});
                return;
            }

            if (!req.body.repository) {
                res.status(400).json({error: "Bad request, you must include a GitHub repository."});
                return;
            }

            let existing = await Project.getByPath(req.body.url);

            if (existing) {
                res.status(409).json({error: "Conflict, project already exists.", message: "This project URL already exists."});
                return;
            }

            existing = await Project.getByTitle(req.body.title);

            if (existing) {
                res.status(409).json({error: "Conflict, project already exists.", message: "This project title already exists."});
                return;
            }

            try {
                await Project.cacheRepository(req.body.user, req.body.repository);
            } catch (err) {
                res.status(409).json({error: "Conflict, GitHub project does not.", message: "Could not find the specified repository on GitHub.  Please try again."});
                return;
            }

            const project = new Project({
                url: req.body.url,
                title: req.body.title,
                github: {
                    user: req.body.user,
                    repository: req.body.repository
                }
            });

            await project.add();

            res.status(200).json({path: project.url});
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminProjectsAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminProjectsAPI;
