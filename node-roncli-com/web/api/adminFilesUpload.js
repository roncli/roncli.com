/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Directory = require("../../src/models/directory"),
    fs = require("fs").promises,
    Log = require("@roncli/node-application-insights-logger"),
    multer = require("multer"),
    os = require("os"),
    path = require("path"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #        #           #           #####    #     ##                  #   #          ##                      #    #    ####    ###
//   # #       #                       #               #                  #   #           #                      #   # #   #   #    #
//  #   #   ## #  ## #    ##    # ##   #       ##      #     ###    ###   #   #  # ##     #     ###    ###    ## #  #   #  #   #    #
//  #   #  #  ##  # # #    #    ##  #  ####     #      #    #   #  #      #   #  ##  #    #    #   #      #  #  ##  #   #  ####     #
//  #####  #   #  # # #    #    #   #  #        #      #    #####   ###   #   #  ##  #    #    #   #   ####  #   #  #####  #        #
//  #   #  #  ##  # # #    #    #   #  #        #      #    #          #  #   #  # ##     #    #   #  #   #  #  ##  #   #  #        #
//  #   #   ## #  #   #   ###   #   #  #       ###    ###    ###   ####    ###   #       ###    ###    ####   ## #  #   #  #       ###
//                                                                               #
//                                                                               #
/**
 * A class that handles calls to the admin files upload API.
 */
class AdminFilesUploadAPI extends RouterBase {
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

        route.path = "/api/admin/files/upload";

        route.middleware = [
            multer({
                dest: os.tmpdir()
            }).any()
        ];

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

            if (!req.files || !req.files[0]) {
                res.status(400).json({error: "Bad request, you must send a file."});
                return;
            }

            const filePath = path.join(__dirname, "../..", "files", req.body.path, req.files[0].originalname);

            /** @type {import("fs").Stats} */
            try {
                await fs.stat(filePath);

                res.status(409).json({error: "Conflict, the specified file or directory already exists."});
                return;
            } catch (err) {
                // File does not exist, okay to proceed.
            }

            await fs.copyFile(req.files[0].path, filePath);
            await fs.unlink(req.files[0].path);

            const dir = new Directory(path.join(filePath, ".."));

            const data = {
                path: req.body.path.replace(/\/+$/, ""),
                entries: await dir.get()
            };

            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${req && req.path || void 0} ${AdminFilesUploadAPI.route.path}.`, {err});
        } finally {
            // Attempt to delete temporary file when we're done.  If it's already gone, this will do nothing.
            try {
                if (req.files && req.files[0]) {
                    await fs.unlink(req.files[0].path);
                }
            } catch (err) {}
        }
    }
}

module.exports = AdminFilesUploadAPI;
