/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("@roncli/node-application-insights-logger"),
    Project = require("../../src/models/project"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           ####                    #                  #       #    ####    ###
//   # #       #                       #   #                                      #      # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #   #  # ##    ###     ##    ###    ###   ####   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  ####   ##  #  #   #     #   #   #  #   #   #     #   #  ####     #
//  #####  #   #  # # #    #    #   #  #      #      #   #     #   #####  #       #     #####  #        #
//  #   #  #  ##  # # #    #    #   #  #      #      #   #     #   #      #   #   #  #  #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #      #       ###   #  #    ###    ###     ##   #   #  #       ###
//                                                          #  #
//                                                           ##
/**
 * A class that handles calls to the admin project API.
 */
class AdminProjectAPI extends RouterBase {
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

        route.path = "/api/admin/project";

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

            const project = await Project.getByPath(req.body.url);

            if (!project) {
                res.status(404).json({error: "Not found, project does not exist."});
                return;
            }

            const existing = await Project.getByTitle(req.body.title);

            if (existing && existing.id !== project.id) {
                res.status(409).json({error: "Conflict, project already exists.", message: "This project title already exists."});
                return;
            }

            try {
                await Project.cacheRepository(req.body.user, req.body.repository);
            } catch (err) {
                res.status(409).json({error: "Conflict, GitHub project does not.", message: "Could not find the specified repository on GitHub.  Please try again."});
                return;
            }

            await project.update({
                title: req.body.title,
                github: {
                    user: req.body.user,
                    repository: req.body.repository
                },
                description: req.body.description
            });

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminProjectAPI.route.path}.`, {err});
        }
    }
}

module.exports = AdminProjectAPI;
