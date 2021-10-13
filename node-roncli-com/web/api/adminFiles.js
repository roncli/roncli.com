/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Directory = require("../../src/models/directory"),
    fs = require("fs").promises,
    Log = require("@roncli/node-application-insights-logger"),
    path = require("path"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           #####    #     ##                    #    ####    ###
//   # #       #                       #               #                   # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #       ##      #     ###    ###   #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  ####     #      #    #   #  #      #   #  ####     #
//  #####  #   #  # # #    #    #   #  #        #      #    #####   ###   #####  #        #
//  #   #  #  ##  # # #    #    #   #  #        #      #    #          #  #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #       ###    ###    ###   ####   #   #  #       ###
/**
 * A class that handles calls to the admin files API.
 */
class AdminFilesAPI extends RouterBase {
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

        route.path = "/api/admin/files";

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

            if (!req.body.path) {
                res.status(400).json({error: "Bad request, you must send the path to delete."});
                return;
            }

            const fullPath = path.join(__dirname, "../..", "files", req.body.path);

            /** @type {import("fs").Stats} */
            let stats;
            try {
                stats = await fs.stat(fullPath);
            } catch (err) {
                res.status(404).json({error: "Not found, the specified file or directory doesn't exist."});
                return;
            }

            if (stats.isFile()) {
                await fs.unlink(fullPath);
            } else {
                const items = await fs.readdir(fullPath);

                if (items.length > 0) {
                    res.status(409).json({error: "Conflict, the directory is not empty."});
                    return;
                }

                await fs.rmdir(fullPath);
            }

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminFilesAPI.route.path}.`, {err});
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

            if (!req.body.path) {
                res.status(400).json({error: "Bad request, you must send the path to delete."});
                return;
            }

            const fullPath = path.join(__dirname, "../..", "files", req.body.path, req.body.directory);

            /** @type {import("fs").Stats} */
            try {
                await fs.mkdir(fullPath);
            } catch (err) {
                res.status(409).json({error: "Conflict, the specified file or directory already exists."});
                return;
            }

            const dir = new Directory(path.join(fullPath, ".."));

            const data = {
                path: req.body.path.replace(/\/+$/, ""),
                entries: await dir.get()
            };

            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminFilesAPI.route.path}.`, {err});
        }
    }

}

module.exports = AdminFilesAPI;
